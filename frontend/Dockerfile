FROM node:20-alpine

WORKDIR /frontend

# Kopiere die package.json und package-lock.json
COPY package.json package-lock.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den gesamten Frontend-Code
COPY . .

# Baue die Anwendung (optional)
RUN npm run build || echo

# Exponiere den Port
EXPOSE 3000

# Starte den Next.js-Entwicklungsserver
CMD ["npm", "run", "dev"]
