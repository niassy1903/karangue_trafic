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
    imagemagick

# Imagick (facultatif si pas utilisé dans le projet)
RUN pecl install imagick \
    && docker-php-ext-enable imagick

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

# Copier le .env.production comme .env
COPY .env.production .env

# Installer les dépendances PHP de production
RUN composer install --no-dev --optimize-autoloader

# Compiler les fichiers de config Laravel
RUN php artisan config:clear \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache

# Donner les bons droits
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# Exposer le port 80 (nécessaire pour que la plateforme détecte l'app)
EXPOSE 80

# Lancer Laravel avec le serveur intégré
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-80}"]
