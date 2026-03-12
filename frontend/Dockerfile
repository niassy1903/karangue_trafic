# Utiliser NGINX léger
FROM nginx:alpine

# Copier le build Angular (double browser)
COPY dist/KARANGUE_TRAFIC/browser/browser /usr/share/nginx/html

# S'assurer que les fichiers sont lisibles
RUN chmod -R 755 /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Lancer NGINX
CMD ["nginx", "-g", "daemon off;"]