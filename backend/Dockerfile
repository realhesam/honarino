FROM golang:1.26-alpine AS builder

RUN apk add --no-cache git ca-certificates tzdata
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .

RUN CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64 \
    go build \
      -ldflags="-w -s -extldflags '-static'" \
      -trimpath \
      -o /app/server \
      ./cmd/api/


FROM alpine:3.20 AS health
RUN apk add --no-cache wget

FROM scratch

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo                /usr/share/zoneinfo
COPY --from=builder /etc/passwd                        /etc/passwd
COPY --from=builder /etc/group                         /etc/group

COPY --from=health  /usr/bin/wget /usr/bin/wget
COPY --from=builder /app/server   /server

USER appuser:appgroup

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["/usr/bin/wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]

ENTRYPOINT ["/server"]