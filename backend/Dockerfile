FROM php:8.2-cli-alpine

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
    imagemagick

# Imagick (facultatif)
RUN pecl install imagick \
    && docker-php-ext-enable imagick

# Installer les extensions PHP
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

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# Exposer le port attendu par Render
EXPOSE 80

# Lancer le serveur artisan
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-80}"]
