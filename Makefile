.PHONY: help dev hybrid-dev prod pull restart down logs ps attach shell frontend backend

COMPOSE=docker compose -f docker-compose.yml -f docker-compose.prod.yml

help:
	@echo "Available targets:"
	@echo "  dev         - Development"
	@echo "  hybrid-dev  - Hybrid development"
	@echo "  prod        - Pull and start production"
	@echo "  pull        - Pull latest images"
	@echo "  restart     - Restart containers"
	@echo "  down        - Stop all containers"
	@echo "  logs        - Follow logs"
	@echo "  ps          - Show containers"
	@echo "  attach      - Attach to frontend logs"
	@echo "  shell       - Open frontend shell"
	@echo "  frontend    - Restart frontend"
	@echo "  backend     - Restart backend"

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

hybrid-dev:
	docker compose -f docker-compose.yml -f docker-compose.hybrid.yml up --build

pull:
	$(COMPOSE) pull

prod:
	$(COMPOSE) up -d --pull always --force-recreate --remove-orphans

restart:
	$(COMPOSE) restart

down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down || true
	docker compose -f docker-compose.yml -f docker-compose.hybrid.yml down || true
	$(COMPOSE) down || true

logs:
	$(COMPOSE) logs -f --tail=100

ps:
	$(COMPOSE) ps

attach:
	$(COMPOSE) logs -f frontend

shell:
	$(COMPOSE) exec frontend sh

frontend:
	$(COMPOSE) up -d --force-recreate frontend

backend:
	$(COMPOSE) up -d --force-recreate backend