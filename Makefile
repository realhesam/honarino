COMPOSE=docker compose
BASE=-f docker-compose.yml

.PHONY: run down logs ps clean

run:
	$(COMPOSE) $(BASE) up --build

down:
	$(COMPOSE) $(BASE) down

logs:
	$(COMPOSE) $(BASE) logs -f

ps:
	$(COMPOSE) $(BASE) ps

clean:
	docker compose down -v --remove-orphans
	docker system prune -f
