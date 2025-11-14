FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar package.json y instalar dependencias
COPY package*.json ./
RUN npm install

RUN apk add --no-cache postgresql-client curl

# Copiar el código fuente
COPY . .

EXPOSE 3500

# Ejecutar directamente con Node.js
CMD ["node", "index.js"]
