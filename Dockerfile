FROM python:3.12-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Create app directory and config directory
WORKDIR /app
RUN mkdir -p /app/config

# Copy the application into the container.
COPY . /app

# Install the application dependencies.
RUN uv pip install --no-cache-dir -r requirements.txt --system

# Set proper permissions for config directory
RUN chmod 755 /app/config

# Run the application.
CMD ["fastapi", "run", "app/main.py", "--port", "8000", "--host", "0.0.0.0", "--workers", "4"]