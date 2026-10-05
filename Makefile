.DEFAULT_GOAL := help
COMPOSE := docker compose

.PHONY: help up down build restart logs ps db db-down psql clean install dev-backend dev-frontend seed seed-local test

help: ## Liste les commandes disponibles
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-14s %s\n", $$1, $$2}'

up: ## Lance toute l'application (build + démarrage)
	$(COMPOSE) up --build -d

down: ## Arrête les conteneurs (les données sont conservées)
	$(COMPOSE) down

build: ## Reconstruit les images
	$(COMPOSE) build

restart: ## Redémarre tous les services
	$(COMPOSE) restart

logs: ## Affiche les logs en continu
	$(COMPOSE) logs -f

ps: ## Affiche l'état des services
	$(COMPOSE) ps

db: ## Lance uniquement PostgreSQL (pour le développement local)
	$(COMPOSE) up -d postgres

db-down: ## Arrête uniquement PostgreSQL
	$(COMPOSE) stop postgres

psql: ## Ouvre un shell psql dans la base
	$(COMPOSE) exec postgres psql -U crm -d crm

clean: ## Arrête tout ET supprime les volumes (efface la base)
	$(COMPOSE) down -v --remove-orphans

install: ## Installe les dépendances backend et frontend
	cd backend && npm install
	cd frontend && npm install

dev-backend: ## Lance le backend en mode watch (nécessite make db)
	cd backend && npm run start:dev

dev-frontend: ## Lance le frontend Vite
	cd frontend && npm run dev

seed: ## Remplit la base avec des contacts fictifs (service backend requis)
	$(COMPOSE) exec backend npm run seed:prod

seed-local: ## Remplit la base depuis votre machine (nécessite make db)
	cd backend && npm run seed

test: ## Lance les tests du backend
	cd backend && npm test
