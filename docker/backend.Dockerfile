FROM python:3.11-slim

# Install uv
RUN pip install uv --no-cache-dir

WORKDIR /app

# Install dependencies (no lockfile required — resolves from pyproject.toml)
COPY pyproject.toml ./
RUN uv pip install --system --no-cache -e ".[dev]" 2>/dev/null || uv pip install --system --no-cache .

# Copy application
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
