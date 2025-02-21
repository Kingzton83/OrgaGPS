#!/bin/bash

# Warte auf die Datenbank
until nc -z db 5432; do
  echo "Waiting for the database to be ready..."
  sleep 3
done
echo "Database is ready!"

# Datenbankmigrationen ausführen
echo "Running migrations..."
python manage.py migrate --noinput || {
  echo "Migrations failed. Exiting."
  exit 1
}

# Starte Django-Server und Celery-Worker parallel
echo "Starting Celery..."
celery -A orgagps worker --loglevel=info &

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
