<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Autoloader that searches src/, src/DTO/, and src/Repository/
spl_autoload_register(function (string $class): void {
    $paths = [
        __DIR__ . '/' . $class . '.php',
        __DIR__ . '/DTO/' . $class . '.php',
        __DIR__ . '/Repository/' . $class . '.php'
    ];
    
    foreach ($paths as $file) {
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Release the session lock immediately so concurrent requests don't hang
session_write_close();
