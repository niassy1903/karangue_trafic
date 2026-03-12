# Étape 1 : Build Angular
FROM node:20 AS build

WORKDIR /app

# Copier package.json et package-lock.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier tout le reste du projet
COPY . .

# S'assurer que tous les fichiers ont les bonnes permissions
RUN chmod -R 755 /app

# Build Angular en production
RUN npm run build -- --output-path=dist/KARANGUE_TRAFIC/browser --configuration=production

# Étape 2 : NGINX pour servir Angular
FROM nginx:alpine

# Copier les fichiers build Angular dans NGINX
COPY dist/KARANGUE_TRAFIC/browser/browser/ /usr/share/nginx/html

# Copier la config NGINX pour Angular (SPA)
COPY default.conf /etc/nginx/conf.d/default.conf

# Donner les bonnes permissions pour NGINX
RUN chmod -R 755 /usr/share/nginx/html \
    && chown -R nginx:nginx /usr/share/nginx/html

# Exposer le port HTTP
EXPOSE 80

# Démarrer NGINX au premier plan
CMD ["nginx", "-g", "daemon off;"]