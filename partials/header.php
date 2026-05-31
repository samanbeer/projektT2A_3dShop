<?php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';

$cart = new Cart();
$cartCount = $cart->getTotalQuantity();
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-TX7NXJQ3SY"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-TX7NXJQ3SY');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle ?? 'BEER 3D | Tiskneme s chutí') ?></title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="favicon.png">

</head>
<body class="dark-theme">
    <div class="bg-glow"></div>

    <header class="navbar" role="banner">
        <div class="nav-container">
            <a href="index.php" class="logo" style="text-decoration: none; color: inherit;" aria-label="Beer 3D logo"><span class="accent">🍺</span> BEER 3D</a>
            <nav role="navigation" aria-label="Hlavní navigace">
                <a href="index.php" id="nav-home" class="nav-link <?= $currentPage === 'index.php' || $currentPage === '' ? 'active' : '' ?>" <?= $currentPage === 'index.php' ? 'aria-current="page"' : '' ?>>DOMŮ</a>
                <a href="materialy.php" id="nav-materials" class="nav-link <?= $currentPage === 'materialy.php' ? 'active' : '' ?>" <?= $currentPage === 'materialy.php' ? 'aria-current="page"' : '' ?>>MATERIÁLY</a>
                <a href="produkty.php" id="nav-products" class="nav-link <?= $currentPage === 'produkty.php' || $currentPage === 'produkt.php' ? 'active' : '' ?>" <?= $currentPage === 'produkty.php' ? 'aria-current="page"' : '' ?>>PRODUKTY</a>
            </nav>
        </div>
    </header>

    <!-- Floating Shopping Cart Button -->
    <a href="kosik.php" class="cart-button" aria-label="Otevřít košík" style="text-decoration: none;">
        🛒
        <span class="cart-badge" style="display: <?= $cartCount > 0 ? 'flex' : 'none' ?>;"><?= $cartCount ?></span>
    </a>

    <div class="pages-wrapper" style="overflow: visible; min-height: calc(100vh - 80px);">
        <div class="pages-track" style="transform: none; display: block; width: 100%; transition: none;">
            <main class="page-content">
