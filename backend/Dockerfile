FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    libzip-dev unzip git curl pkg-config libssl-dev \
    && docker-php-ext-install pdo pdo_mysql zip \
    && pecl install mongodb-1.20.0 \
    && docker-php-ext-enable mongodb \
    && a2enmod rewrite

RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader \
    && php artisan config:clear \
    && php artisan route:clear \
    && php artisan cache:clear

# Fix permissions pour Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

CMD ["apache2-foreground"]