# AI DevOps Assistant — Makefile

.PHONY: dev build test lint clean docker-up docker-down k8s-deploy

dev:
	@echo "Starting development servers..."
	uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload &
	cd frontend/dashboard && npm run dev

backend-dev:
	uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload

frontend-dev:
	cd frontend/dashboard && npm run dev

install:
	pip install -r requirements.txt
	cd frontend/dashboard && npm install

test:
	pytest backend/tests/ -v

lint:
	python -m flake8 backend/ ai/ --max-line-length=100

docker-up:
	cd infra/docker && docker-compose up -d

docker-down:
	cd infra/docker && docker-compose down

docker-logs:
	cd infra/docker && docker-compose logs -f backend

docker-build:
	cd infra/docker && docker-compose build

k8s-deploy:
	kubectl apply -f infra/kubernetes/

k8s-delete:
	kubectl delete -f infra/kubernetes/

k8s-status:
	kubectl get all -n ai-devops

ollama-setup:
	docker exec -it ai-devops-ollama ollama pull llama3

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	cd frontend/dashboard && rm -rf dist node_modules/.vite

help:
	@echo "Available targets:"
	@echo "  make dev           - Start all services"
	@echo "  make install       - Install all dependencies"
	@echo "  make test          - Run test suite"
	@echo "  make docker-up     - Start with Docker Compose"
	@echo "  make k8s-deploy    - Deploy to Kubernetes"
	@echo "  make ollama-setup  - Pull LLaMA3 model"
