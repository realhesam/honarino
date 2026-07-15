.PHONY: help dev hybrid-dev prod pull restart down

help:
	@echo "Available targets:"
	@echo "  dev"
	@echo "  hybrid-dev"
	@echo "  prod"
	@echo "  pull"
	@echo "  restart"
	@echo "  down"

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

hybrid-dev:
	docker compose -f docker-compose.yml -f docker-compose.hybrid.yml up --build

pull:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml pull

prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --pull always --force-recreate --remove-orphans

restart:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml restart

down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down || true
	docker compose -f docker-compose.yml -f docker-compose.hybrid.yml down || true
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down || true