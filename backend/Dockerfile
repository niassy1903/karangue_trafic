# --------------------
# ÉTAPE 1 : Image PHP avec extensions Laravel
# --------------------
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
    imagemagick \
    shadow

# Imagick (facultatif)
RUN pecl install imagick \
    && docker-php-ext-enable imagick

# Extensions PHP nécessaires
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

# Définir le dossier de travail
WORKDIR /var/www

# Copier les fichiers du projet
COPY . .

# Installer les dépendances Laravel
RUN composer install --optimize-autoloader --no-dev

# Donner les permissions à Laravel
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 storage bootstrap/cache

# Exposer le port 10000
EXPOSE 10000

# Lancer le serveur intégré Laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=10000"]
