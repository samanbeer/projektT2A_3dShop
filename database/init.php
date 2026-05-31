<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/bootstrap.php';

try {
    $db = Database::getConnection();

    echo "Inicializace SQLite databáze...\n";

    // Drop existing tables in reverse order
    $db->exec("DROP TABLE IF EXISTS review_replies;");
    $db->exec("DROP TABLE IF EXISTS reviews;");
    $db->exec("DROP TABLE IF EXISTS order_items;");
    $db->exec("DROP TABLE IF EXISTS orders;");
    $db->exec("DROP TABLE IF EXISTS customers;");
    $db->exec("DROP TABLE IF EXISTS product_parameters;");
    $db->exec("DROP TABLE IF EXISTS product_images;");
    $db->exec("DROP TABLE IF EXISTS products;");
    $db->exec("DROP TABLE IF EXISTS categories;");
    $db->exec("DROP TABLE IF EXISTS shipping_methods;");
    $db->exec("DROP TABLE IF EXISTS payment_methods;");

    // 1. categories
    $db->exec("CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        image TEXT NOT NULL,
        description TEXT NOT NULL
    );");

    // 2. products
    $db->exec("CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        price REAL NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        is_featured INTEGER NOT NULL DEFAULT 0,
        in_stock INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    );");

    // 3. product_images
    $db->exec("CREATE TABLE product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );");

    // 4. product_parameters
    $db->exec("CREATE TABLE product_parameters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        type TEXT NOT NULL, -- 'select' or 'info'
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );");

    // 5. shipping_methods
    $db->exec("CREATE TABLE shipping_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        delivery_days TEXT NOT NULL
    );");

    // 6. payment_methods
    $db->exec("CREATE TABLE payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL
    );");

    // 7. customers
    $db->exec("CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        street TEXT NOT NULL,
        city TEXT NOT NULL,
        zip TEXT NOT NULL
    );");

    // 8. orders
    $db->exec("CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        shipping_method_id INTEGER NOT NULL,
        payment_method_id INTEGER NOT NULL,
        shipping_price REAL NOT NULL,
        payment_price REAL NOT NULL,
        total_price REAL NOT NULL,
        note TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id),
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
    );");

    // 9. order_items
    $db->exec("CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        variant TEXT,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
    );");

    // 10. reviews
    $db->exec("CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        stars INTEGER NOT NULL,
        text TEXT NOT NULL,
        photo_url TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );");

    // 11. review_replies
    $db->exec("CREATE TABLE review_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        review_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        text TEXT NOT NULL,
        photo_url TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    );");

    echo "Tabulky vytvořeny.\n";

    // --- SEED DATA ---

    // Categories
    $db->exec("INSERT INTO categories (id, name, slug, image, description) VALUES
    (1, 'Filamenty', 'filament', './imgs/products/filament-pla-white.jpg', 'Špičkové filamenty pro vaše 3D tisky'),
    (2, 'Tiskárny', 'printer', './imgs/products/printer-ender3.jpg', 'Kvalitní a prověřené 3D tiskárny'),
    (3, 'Vlastní výrobky', 'custom', './imgs/phone_holder.png', 'Originální výrobky tištěné na míru');");

    // Products
    $db->exec("INSERT INTO products (id, name, slug, price, description, image, category_id, is_featured, in_stock) VALUES
    (1, 'PLA Filament - Bílá 1kg', 'filament-pla-white-1kg', 299.0, 'Ekologický materiál z kukuřičného škrobu. Nabízí skvělý detail, matný povrch a minimální tepelné smrštění. Ideální pro designové kousky a prototypy.', './imgs/products/filament-pla-white.jpg', 1, 1, 1),
    (2, 'PETG Filament - Černá 1kg', 'filament-petg-black-1kg', 349.0, 'Pevný a odolný materiál s vysokou houževnatostí. Chemicky odolný a vhodný pro funkční díly v interiéru i exteriéru. Skvělý kompromis mezi PLA a ABS.', './imgs/products/filament-petg-black.jpg', 1, 1, 1),
    (3, 'Creality Ender-3 V3', 'printer-ender3-v3', 8990.0, 'Profesionální 3D tiskárna s velikostí tisku 220x220x250mm. Tichý provoz, automatické vyrovnání podložky a dotykový displej. Ideální pro začátečníky i pokročilé.', './imgs/products/printer-ender3.jpg', 2, 0, 1),
    (4, 'Bambu Lab X1 Carbon', 'printer-bambulab-x1', 45990.0, 'Prémiová 3D tiskárna s rychlostí tisku až 500mm/s. Pokročilé funkce jako multi-materiálový tisk, uzavřená komora a automatické kalibrování. Top model pro profesionály.', './imgs/products/printer-bambulab.jpg', 2, 1, 1),
    (5, 'Stojan na telefon - Vlastní design', 'custom-phone-holder', 199.0, 'Vlastní stojan na telefon vytištěný na zakázku podle vašich požadavků. Možnost výběru barvy, textury a personalizace. Perfektní dárek nebo funkční doplněk.', './imgs/phone_holder.png', 3, 0, 1),
    (6, 'Stůlní tenisová pálka - Vlastní design', 'custom-pingpong-paddle', 449.0, 'Unikátní pálka na stolní tenis vytištěná na zakázku. Lehká konstrukce, ergonomický úchop a možnost personalizace. Vyrobeno z pevného PETG materiálu.', './imgs/pingpong_pálky.png', 3, 0, 1);");

    // Product images (Gallery)
    $db->exec("INSERT INTO product_images (product_id, image) VALUES
    (1, './imgs/products/filament-pla-white.jpg'),
    (2, './imgs/products/filament-petg-black.jpg'),
    (3, './imgs/products/printer-ender3.jpg'),
    (4, './imgs/products/printer-bambulab.jpg');");

    // Product Parameters
    $db->exec("INSERT INTO product_parameters (product_id, name, value, type) VALUES
    -- PLA Filament
    (1, 'Barva', 'Bílá', 'select'),
    (1, 'Barva', 'Černá', 'select'),
    (1, 'Barva', 'Oranžová', 'select'),
    (1, 'Barva', 'Modrá', 'select'),
    (1, 'Barva', 'Červená', 'select'),
    (1, 'Hmotnost', '1 kg', 'info'),
    (1, 'Průměr filamentu', '1.75 mm', 'info'),
    (1, 'Doporučená teplota', '200 - 220 °C', 'info'),

    -- PETG Filament
    (2, 'Barva', 'Černá', 'info'),
    (2, 'Hmotnost', '1 kg', 'info'),
    (2, 'Průměr filamentu', '1.75 mm', 'info'),
    (2, 'Doporučená teplota', '230 - 250 °C', 'info'),

    -- Creality Ender 3
    (3, 'Tiskový prostor', '220 x 220 x 250 mm', 'info'),
    (3, 'Rychlost tisku', 'až 100 mm/s', 'info'),
    (3, 'Průměr trysky', '0.4 mm', 'info'),

    -- Bambu Lab
    (4, 'Tiskový prostor', '256 x 256 x 256 mm', 'info'),
    (4, 'Maximální rychlost', '500 mm/s', 'info'),
    (4, 'Multi-materiál', 'Ano (AMS modul)', 'info'),

    -- Phone Holder
    (5, 'Barva', 'Černá', 'select'),
    (5, 'Barva', 'Oranžová', 'select'),
    (5, 'Barva', 'Modrá', 'select'),
    (5, 'Materiál', 'PETG (odolný)', 'info'),

    -- Table tennis paddle
    (6, 'Barva rukojeti', 'Červeno-Černá', 'select'),
    (6, 'Barva rukojeti', 'Modro-Černá', 'select'),
    (6, 'Hmotnost', 'cca 180 g', 'info'),
    (6, 'Materiál těla', 'PETG', 'info');");

    // Shipping methods
    $db->exec("INSERT INTO shipping_methods (id, name, price, delivery_days) VALUES
    (1, 'Česká pošta', 89.0, '3–4 pracovní dny'),
    (2, 'Zásilkovna', 69.0, '2–3 pracovní dny'),
    (3, 'Osobní odběr (Kopřivnice)', 0.0, 'Ihned k vyzvednutí');");

    // Payment methods
    $db->exec("INSERT INTO payment_methods (id, name, price) VALUES
    (1, 'Kartou online', 0.0),
    (2, 'Bankovní převod', 0.0),
    (3, 'Dobírka', 39.0);");

    echo "Seed data úspěšně vložena!\n";
    echo "Databáze je kompletně inicializována.\n";

} catch (Exception $e) {
    echo "CHYBA: " . $e->getMessage() . "\n";
}
