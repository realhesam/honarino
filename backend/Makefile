include .env
export

.PHONY: run build migrate-up migrate-down migrate-status migrate-create migrate-fix test lint tidy dev

MIGRATIONS := db/migrations
DB_URL     := $(MIGRATE_DATABASE_URL)

run:
	go run cmd/api/main.go

dev:
	go run cmd/api/main.go

build:
	go build -o bin/api cmd/api/main.go

migrate-up:
	migrate -path $(MIGRATIONS) -database "$(DB_URL)" up

migrate-down:
	migrate -path $(MIGRATIONS) -database "$(DB_URL)" down 1

migrate-status:
	migrate -path $(MIGRATIONS) -database "$(DB_URL)" version

migrate-create:
ifndef name
	$(error Usage: make migrate-create name=your_migration_name)
endif
	migrate create -ext sql -dir $(MIGRATIONS) -seq $(name)

migrate-fix:
ifndef v
	$(error Usage: make migrate-fix v=<version>)
endif
	migrate -path $(MIGRATIONS) -database "$(DB_URL)" force $(v)
	
create-test-user:
	curl -X POST http://localhost:3001/api/v1/auth/signup \
	-H "Content-Type: application/json" \
	-d '{"name": "testname", "username": "testusername", "email": "testmail@gmail.com", "password": "testpass"}'

test:
	go test ./... -v

lint:
	golangci-lint run

tidy:
	go mod tidy