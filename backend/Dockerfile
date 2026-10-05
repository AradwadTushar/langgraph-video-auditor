# ==============================================================================
# Brand Guardian AI - Production Dockerfile
# ==============================================================================
FROM python:3.10-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system runtime dependencies:
# - ffmpeg: Required by yt-dlp for video extraction and processing
# - curl, ca-certificates: Required for secure network requests and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
COPY --from=ghcr.io/astral-sh/uv:0.12.21 /uv /uvx /bin/

# Copy dependency files first for layer caching
COPY pyproject.toml .

# Install dependencies using uv
RUN uv pip install --system \
    fastapi \
    uvicorn[standard] \
    pydantic \
    python-dotenv \
    langchain \
    langchain-community \
    langchain-core \
    langchain-openai \
    langchain-text-splitters \
    langgraph \
    pypdf \
    yt-dlp \
    requests \
    azure-identity \
    azure-search-documents \
    azure-monitor-opentelemetry

# Copy source code and regulatory data
COPY backend ./backend
COPY src ./src

# Create a non-privileged user and switch to it for security
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser \
    && chown -R appuser:appuser /app

USER appuser

# Expose API port
EXPOSE 8000

# Health check against FastAPI health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Launch ASGI server with Uvicorn
CMD ["uvicorn", "backend.src.api.server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
