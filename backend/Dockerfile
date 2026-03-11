FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    libzip-dev \
    unzip \
    git \
    curl \
    pkg-config \
    libssl-dev

# extensions PHP
RUN docker-php-ext-install pdo pdo_mysql zip

# extension MongoDB compatible avec ton composer.json
RUN pecl install mongodb-1.20.0 \
    && docker-php-ext-enable mongodb

# activer mod_rewrite pour Laravel
RUN a2enmod rewrite

# configurer Apache pour servir Laravel depuis /public
RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# installer composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

# optimisation Laravel
RUN php artisan config:cache

EXPOSE 80