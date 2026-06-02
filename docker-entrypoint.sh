#!/bin/sh
set -e

echo "Running entrypoint configurations..."

# Create database and uploads directory if they don't exist
mkdir -p /var/www/html/database
mkdir -p /var/www/html/imgs/reviews

# Initialize database if eshop.db is missing in the mounted folder
if [ ! -f /var/www/html/database/eshop.db ]; then
    echo "Database file eshop.db not found. Initializing database..."
    php /var/www/html/database/init.php
fi

# Set proper ownership and permissions for the mounted directories
echo "Assigning write permissions to Apache user (www-data)..."
chown -R www-data:www-data /var/www/html/database
chown -R www-data:www-data /var/www/html/imgs/reviews
chmod -R 775 /var/www/html/database
chmod -R 775 /var/www/html/imgs/reviews

echo "Entrypoint initialization complete. Starting Apache web server..."
exec "$@"