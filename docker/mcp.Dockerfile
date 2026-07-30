FROM python:3.11-slim

# Install uv
RUN pip install uv --no-cache-dir

WORKDIR /app

# Install dependencies (no lockfile required — resolves from pyproject.toml)
COPY pyproject.toml ./
RUN uv pip install --system --no-cache .

# Copy application
COPY . .

EXPOSE 8765

ENTRYPOINT ["python", "server.py", "--http"]
CMD ["--port", "8765"]
