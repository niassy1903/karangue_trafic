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

# installer extension MongoDB
RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

# installer composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN php artisan config:cache

EXPOSE 80