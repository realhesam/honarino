package service

import (
    "context"
    "fmt"
    "log/slog"
    "time"

    "golang.org/x/crypto/bcrypt"

    "backend/internal/cache"
    "backend/internal/model"
    "backend/internal/repository"
)

type ProfileService struct {
    userRepo *repository.UserRepository
    rdb      *cache.Redis
}

func NewProfileService(repo *repository.UserRepository, rdb *cache.Redis) *ProfileService {
    return &ProfileService{userRepo: repo, rdb: rdb}
}

func (s *ProfileService) GetProfile(ctx context.Context, userID string) (*model.User, error) {
    key := cache.KeyUserProfile(userID)

    var user model.User
    err := s.rdb.Get(ctx, key, &user)
    if err == nil {
        return &user, nil
    }

    if !cache.IsNil(err) {
        slog.Warn("redis get profile error", "err", err)
    }

    dbUser, err := s.userRepo.GetByID(ctx, userID)
    if err != nil {
        return nil, ErrUserNotFound
    }

    s.cacheUser(ctx, dbUser)
    return dbUser, nil
}

func (s *ProfileService) UpdateProfile(ctx context.Context, userID string, updates map[string]interface{}) (*model.User, error) {
    if len(updates) == 0 {
        return nil, fmt.Errorf("no updates provided")
    }

    user, err := s.userRepo.Update(ctx, userID, updates)
    if err != nil {
        return nil, err
    }

    s.InvalidateUserCache(ctx, userID)
    return user, nil
}

func (s *ProfileService) ChangePassword(ctx context.Context, userID, currentPassword, newPassword string) error {
    if currentPassword == "" || newPassword == "" {
        return fmt.Errorf("current and new passwords are required")
    }
    if len(newPassword) < 8 {
        return fmt.Errorf("new password must be at least 8 characters")
    }

    storedPassword, err := s.userRepo.GetPasswordByID(ctx, userID)
    if err != nil {
        return err
    }

    if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(currentPassword)); err != nil {
        return ErrInvalidCreds
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
    if err != nil {
        return fmt.Errorf("hash password: %w", err)
    }

    if err := s.userRepo.UpdatePassword(ctx, userID, string(hashedPassword)); err != nil {
        return err
    }

    s.InvalidateUserCache(ctx, userID)
    return nil
}

func (s *ProfileService) InvalidateUserCache(ctx context.Context, userID string) {
    key := cache.KeyUserProfile(userID)
    if err := s.rdb.Del(ctx, key); err != nil {
        slog.Warn("redis del profile error", "err", err, "userID", userID)
    }
}

func (s *ProfileService) cacheUser(ctx context.Context, user *model.User) {
    key := cache.KeyUserProfile(user.ID)
    if err := s.rdb.Set(ctx, key, user, cache.TTLUserProfile*time.Second); err != nil {
        slog.Warn("redis set profile error", "err", err)
    }
}
