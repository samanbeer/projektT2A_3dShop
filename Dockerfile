FROM php:8.2-apache

# Install SQLite development headers and configure PDO SQLite drivers
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite

# Enable Apache mod_rewrite module for standard web routing configurations
RUN a2enmod rewrite

# Copy all application files to the Apache standard web server directory
COPY . /var/www/html/

# Copy the custom entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create the uploads directory if it does not exist
RUN mkdir -p /var/www/html/imgs/reviews

# Assign ownership of the database and reviews upload directories to Apache web user www-data (build fallback)
RUN chown -R www-data:www-data /var/www/html/database \
    && chown -R www-data:www-data /var/www/html/imgs/reviews \
    && chmod -R 775 /var/www/html/database \
    && chmod -R 775 /var/www/html/imgs/reviews

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
