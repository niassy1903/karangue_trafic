# --------------------
# ÉTAPE 1 : Image PHP avec extensions Laravel
# --------------------
FROM php:8.2-fpm-alpine AS base

# Installer les dépendances système
RUN apk add --no-cache \
    bash \
    git \
    curl \
    libpng \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libxpm-dev \
    oniguruma-dev \
    libzip-dev \
    icu-dev \
    autoconf \
    g++ \
    make \
    openssl \
    zlib-dev \
    jpegoptim optipng pngquant gifsicle \
    nano \
    unzip \
    libxml2-dev \
    pkgconfig \
    libressl-dev \
    imagemagick-dev \
    imagemagick \
    shadow

# Imagick (facultatif)
RUN pecl install imagick \
    && docker-php-ext-enable imagick

# Extensions PHP
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    zip \
    intl \
    bcmath \
    exif \
    pcntl \
    opcache

# MongoDB extension
RUN pecl install mongodb-1.20.0 \
    && docker-php-ext-enable mongodb

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Créer un utilisateur non-root
RUN usermod -u 1000 www-data

WORKDIR /var/www

COPY . .

# Installer les dépendances Laravel
RUN composer install --optimize-autoloader --no-dev

# Donne les droits d'écriture à Laravel
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 storage bootstrap/cache

# --------------------
# ÉTAPE 2 : Ajouter Caddy (serveur web rapide)
# --------------------
FROM caddy:2-alpine

# Copier le code et PHP depuis l'étape précédente
COPY --from=base /var/www /var/www
COPY --from=base /usr/local /usr/local

# Caddyfile de config
COPY ./Caddyfile /etc/caddy/Caddyfile

WORKDIR /var/www

# Lancer Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
