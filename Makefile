up:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose down
	docker compose up -d --build

logs:
	docker compose logs -f

ps:
	docker compose ps

backend:
	docker compose exec backend sh

db:
	docker compose exec postgres psql -U user -d Ultramar

seed:
	docker compose exec backend npm run seed