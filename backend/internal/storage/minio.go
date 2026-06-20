package storage

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	minio "github.com/minio/minio-go/v7"
	miniocreds "github.com/minio/minio-go/v7/pkg/credentials"

	"backend/config"
)

type MinioClient struct {
	client         *minio.Client
	bucket         string
	endpoint       string
	publicEndpoint string
	useSSL         bool
	presignTTL     time.Duration
	accessKey      string
	secretKey      string
}

func NewMinioClient(cfg *config.Config) (*MinioClient, error) {
	mc, err := minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  miniocreds.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: cfg.MinioUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("minio new: %w", err)
	}

	ctx := context.Background()
	exists, err := mc.BucketExists(ctx, cfg.MinioBucket)
	if err != nil {
		return nil, fmt.Errorf("minio bucket check: %w", err)
	}
	if !exists {
		if err := mc.MakeBucket(ctx, cfg.MinioBucket, minio.MakeBucketOptions{}); err != nil {
			exists2, checkErr := mc.BucketExists(ctx, cfg.MinioBucket)
			if checkErr != nil || !exists2 {
				return nil, fmt.Errorf("minio make bucket: %w", err)
			}
		}
	}

	policy := fmt.Sprintf(
		`{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}`,
		cfg.MinioBucket,
	)
	if err := mc.SetBucketPolicy(ctx, cfg.MinioBucket, policy); err != nil {
		return nil, fmt.Errorf("minio set bucket policy: %w", err)
	}

	publicEndpoint := cfg.MinioPublicEndpoint
	publicEndpoint = strings.TrimPrefix(publicEndpoint, "https://")
	publicEndpoint = strings.TrimPrefix(publicEndpoint, "http://")
	publicEndpoint = strings.TrimRight(publicEndpoint, "/")

	return &MinioClient{
		client:         mc,
		bucket:         cfg.MinioBucket,
		endpoint:       cfg.MinioEndpoint,
		publicEndpoint: publicEndpoint,
		useSSL:         cfg.MinioUseSSL,
		presignTTL:     time.Duration(cfg.MinioPresignHours) * time.Hour,
		accessKey:      cfg.MinioAccessKey,
		secretKey:      cfg.MinioSecretKey,
	}, nil
}

func (m *MinioClient) Upload(ctx context.Context, objectName string, reader io.Reader, objectSize int64, contentType string) (string, error) {
	opts := minio.PutObjectOptions{ContentType: contentType}
	_, err := m.client.PutObject(ctx, m.bucket, objectName, reader, objectSize, opts)
	if err != nil {
		return "", fmt.Errorf("minio put object: %w", err)
	}
	return m.publicURL(objectName), nil
}

func (m *MinioClient) GetPresignedUploadURL(ctx context.Context, objectName, contentType string) (string, string, error) {
	cfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion("us-east-1"),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(m.accessKey, m.secretKey, ""),
		),
		awsconfig.WithEndpointResolverWithOptions(
			aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL:               m.scheme() + "://" + m.publicEndpoint,
					HostnameImmutable: true,
				}, nil
			}),
		),
	)
	if err != nil {
		return "", "", fmt.Errorf("aws config: %w", err)
	}

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	presignClient := s3.NewPresignClient(s3Client)

	presigned, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(m.bucket),
		Key:         aws.String(objectName),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(m.presignTTL))
	if err != nil {
		return "", "", fmt.Errorf("presign put: %w", err)
	}

	u, err := url.Parse(presigned.URL)
	if err != nil {
		return "", "", fmt.Errorf("parse presigned url: %w", err)
	}
	u.Host = m.publicEndpoint
	u.Scheme = m.scheme()

	return u.String(), m.publicURL(objectName), nil
}

func (m *MinioClient) Delete(ctx context.Context, objectName string) error {
	err := m.client.RemoveObject(ctx, m.bucket, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("minio remove object: %w", err)
	}
	return nil
}

func (m *MinioClient) publicURL(objectName string) string {
	return fmt.Sprintf("%s://%s/%s/%s", m.scheme(), m.publicEndpoint, m.bucket, objectName)
}

func (m *MinioClient) scheme() string {
	if m.useSSL {
		return "https"
	}
	return "http"
}