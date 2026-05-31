<?php
declare(strict_types=1);

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dbPath = __DIR__ . '/../database/eshop.db';
            
            // Make sure the database directory exists
            $dbDir = dirname($dbPath);
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0755, true);
            }
            
            self::$instance = new PDO('sqlite:' . $dbPath);
            self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Enable foreign keys and set busy timeout to 5 seconds
            self::$instance->exec('PRAGMA foreign_keys = ON;');
            self::$instance->exec('PRAGMA busy_timeout = 5000;');
        }
        return self::$instance;
    }
}
