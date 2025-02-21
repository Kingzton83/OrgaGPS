# Dockerfile

FROM python:3.9-slim

# Erstelle einen neuen Benutzer und eine Gruppe
RUN addgroup --system celerygroup && adduser --system --ingroup celerygroup celeryuser

# Setze das Arbeitsverzeichnis
WORKDIR /backend

# Installiere Systemabhängigkeiten
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Kopiere nur requirements.txt zuerst, um den Docker Layer Cache optimal zu nutzen
COPY requirements.txt .

# Installiere Python-Abhängigkeiten
RUN pip install --upgrade pip && pip install -r requirements.txt

# Kopiere den gesamten Backend-Code und setze den Eigentümer
COPY . /backend
RUN chown -R celeryuser:celerygroup /backend

# Wechsel zu celeryuser vor dem Kopieren des Startskripts
USER celeryuser

# Kopiere das Startskript und setze die Berechtigungen
COPY --chown=celeryuser:celerygroup start.sh /start.sh
RUN chmod +x /start.sh

# Standardbefehl
CMD ["/start.sh"]
