include .env
export

.PHONY: run build migrate-up migrate-down docker-up docker-down test lint tidy dev

run:
	go run cmd/api/main.go

dev:
	go run cmd/api/main.go

build:
	go build -o bin/api cmd/api/main.go

migrate-fix:
	migrate -path db/migrations -database "$(MIGRATE_DATABASE_URL)" force 1
	
migrate-up:
	migrate -path db/migrations -database "$(MIGRATE_DATABASE_URL)" up

migrate-down:
	migrate -path db/migrations -database "$(MIGRATE_DATABASE_URL)" down 1

migrate-create:
	migrate create -ext sql -dir db/migrations -seq $(name)
	
create-test-user:
	curl -X POST http://localhost:3001/api/v1/auth/signup \
	-H "Content-Type: application/json" \
	-d '{"name": "testname", "username": "testusername", "email": "testmail@gmail.com", "password": "testpass"}'

docker-down:
	docker compose down

test:
	go test ./... -v

lint:
	golangci-lint run

tidy:
	go mod tidy