.PHONY: help dev hybrid-dev up build build-backend build-frontend logs down restart

help:
	@echo "Available targets: dev hybrid-dev up build build-backend build-frontend logs down restart"

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

hybrid-dev:
	docker compose -f docker-compose.yml -f docker-compose.hybrid.yml up --build

up:
	docker compose up --build -d

build:
	docker compose build --no-cache

build-backend:
	docker compose build backend

build-frontend:
	docker compose build frontend

logs:
	docker compose logs -f

down:
	docker compose down

restart:
	docker compose restart
