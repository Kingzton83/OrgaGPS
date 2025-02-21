#!/bin/bash
set -e

# Define the function to wait for other services
wait_for_service() {
  local host="$1"
  local port="$2"
  local retries=12 # 12 x 5 Sekunden = 60 Sekunden Timeout

  echo "Waiting for service at $host:$port ..."
  while ! nc -z "$host" "$port"; do
    retries=$((retries - 1))
    if [ "$retries" -le 0 ]; then
      echo "Service at $host:$port did not become available. Exiting."
      exit 1
    fi
    echo "Still waiting for the service at $host:$port ..."
    sleep 5
  done
  echo "Service at $host:$port is now available."
}

# Log environment variables for debugging
echo "DB_HOST=$DB_HOST, DB_PORT=$DB_PORT"

# Ensure the DB_HOST can be resolved
if ! getent hosts "$DB_HOST"; then
  echo "DB_HOST ($DB_HOST) cannot be resolved. Exiting."
  exit 1
fi

case "$1" in
  web)
    echo "Starting web service..."
    echo "Ensuring log directory exists..."
    mkdir -p /usr/src/backend/logs
    touch /usr/src/backend/logs/debug.log
    chmod -R 755 /usr/src/backend/logs

    # Wait for the database service
    wait_for_service "$DB_HOST" "$DB_PORT"
    
    # Run migrations and collectstatic before starting
    echo "Running database migrations..."
    python manage.py migrate --noinput

    echo "Collecting static files..."
    python manage.py collectstatic --noinput
    
    # Start Gunicorn
    echo "Starting Gunicorn..."
    exec gunicorn --workers 3 --bind 0.0.0.0:8000 orgagps.wsgi:application
    ;;
    
  frontend)
    echo "Starting frontend service..."
    if command -v npm > /dev/null 2>&1; then
      echo "Building frontend..."
      npm install
      npm run build
    else
      echo "NPM not found, skipping build."
    fi
    
    # Start Next.js frontend server
    exec npm start
    ;;
    
  *)
    echo "Invalid or no service type specified. Please specify 'web' or 'frontend'."
    exit 1
    ;;
esac