# Étape 1 : Build Angular
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# S'assurer que tous les fichiers ont les bonnes permissions
RUN chmod -R 755 /app

# Build prod Angular
RUN npm run build -- --output-path=dist/KARANGUE_TRAFIC/browser --configuration=production

# Étape 2 : NGINX
FROM nginx:alpine

# Copier build Angular
COPY --from=build /app/dist/KARANGUE_TRAFIC/browser /usr/share/nginx/html

# Donner les bonnes permissions pour NGINX
RUN chmod -R 755 /usr/share/nginx/html \
    && chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]