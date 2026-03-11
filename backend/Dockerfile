# Dockerfile
FROM php:8.2-apache

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    libzip-dev unzip git curl pkg-config libssl-dev \
    && docker-php-ext-install pdo pdo_mysql zip \
    && pecl install mongodb-1.20.0 \
    && docker-php-ext-enable mongodb \
    && a2enmod rewrite

# Configurer Apache pour servir Laravel depuis /public
RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier le projet
COPY . .

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader \
    && php artisan config:clear \
    && php artisan route:clear \
    && php artisan cache:clear

EXPOSE 80

# Commande de démarrage Apache
CMD ["apache2-foreground"]