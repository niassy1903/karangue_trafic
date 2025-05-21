# Étape 1 : base image PHP avec extensions nécessaires
FROM php:8.2-fpm-alpine

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
    php82-pecl-imagick

# Installer extensions PHP
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    zip \
    intl \
    bcmath \
    exif \
    pcntl \
    opcache

# Installer ext-mongodb version 1.20.0
RUN pecl install mongodb-1.20.0 \
    && docker-php-ext-enable mongodb

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définir le répertoire de travail
WORKDIR /var/www

# Copier les fichiers de l'application
COPY . .

# Installer les dépendances PHP de production
RUN composer install --no-dev --optimize-autoloader

# Donner les bons droits
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# Lancer php-fpm
CMD ["php-fpm"]
