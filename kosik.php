<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$cart = new Cart();

// Generate CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Handle GET actions (remove item)
if (isset($_GET['action']) && $_GET['action'] === 'remove') {
    $productId = (int)($_GET['id'] ?? 0);
    $variant = $_GET['variant'] ?? null;
    
    $cart->remove($productId, $variant);
    $_SESSION['notification'] = "Položka byla odebrána z košíku. 🗑️";
    header('Location: kosik.php');
    exit;
}

// Handle POST actions (update quantity, empty cart)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])) {
        http_response_code(403);
        exit('Neplatný bezpečnostní token.');
    }

    $action = $_POST['action'] ?? '';

    if ($action === 'update') {
        $productId = (int)$_POST['product_id'];
        $quantity = (int)$_POST['quantity'];
        $variant = $_POST['variant'] !== '' ? $_POST['variant'] : null;

        $cart->updateQuantity($productId, $quantity, $variant);
    } elseif ($action === 'clear') {
        $cart->clear();
        $_SESSION['notification'] = "Košík byl vyprázdněn. 🗑️";
    }

    header('Location: kosik.php');
    exit;
}

$items = $cart->getItems();
$totalPrice = $cart->getTotalPrice();

$pageTitle = 'Nákupní košík | BEER 3D';
require __DIR__ . '/partials/header.php';
?>
<style>
    .cart-page-container {
        max-width: 1000px;
        margin: 40px auto;
        padding: 40px;
        border-radius: 20px;
        background: var(--bg-card);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border);
    }
    .cart-title {
        font-size: 2em;
        font-weight: 800;
        margin-bottom: 30px;
        text-align: center;
    }
    .cart-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
    }
    .cart-table th {
        text-align: left;
        padding: 15px;
        color: rgba(255, 255, 255, 0.5);
        font-weight: 600;
        font-size: 0.9em;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .cart-table td {
        padding: 20px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        vertical-align: middle;
    }
    .cart-item-detail {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    .cart-item-img {
        width: 70px;
        height: 70px;
        border-radius: 8px;
        object-fit: cover;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .cart-item-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .cart-item-title {
        font-weight: 700;
        font-size: 1.05em;
        color: #fff;
    }
    .cart-item-variant {
        font-size: 0.8em;
        color: var(--accent, #ffc107);
    }
    .qty-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .qty-input {
        width: 45px;
        text-align: center;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        color: #fff;
        padding: 8px 0;
        border-radius: 6px;
        font-size: 0.95em;
        outline: none;
    }
    .qty-btn-small {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        color: #fff;
        font-size: 1.1em;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .qty-btn-small:hover {
        background: rgba(255,255,255,0.1);
    }
    .cart-price-col {
        font-weight: 600;
        font-size: 1.1em;
    }
    .cart-remove-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        font-size: 1.2em;
        transition: color 0.3s;
        display: inline-block;
        padding: 5px;
    }
    .cart-remove-btn:hover {
        color: #ff3b30;
    }
    .cart-summary-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 30px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .cart-total-label {
        font-size: 1.2em;
        color: rgba(255, 255, 255, 0.6);
    }
    .cart-total-val {
        font-size: 2em;
        font-weight: 800;
        color: #fff;
    }
    .cart-actions-row {
        display: flex;
        justify-content: space-between;
        margin-top: 40px;
    }
    .cart-empty-state {
        text-align: center;
        padding: 60px 20px;
    }
    .cart-empty-icon {
        font-size: 4em;
        margin-bottom: 20px;
    }
    .cart-empty-text {
        font-size: 1.4em;
        font-weight: 700;
        margin-bottom: 10px;
    }
    .cart-empty-desc {
        color: rgba(255,255,255,0.5);
        margin-bottom: 30px;
    }
    @media (max-width: 768px) {
        .cart-table th:nth-child(2), .cart-table td:nth-child(2) {
            display: none;
        }
        .cart-actions-row {
            flex-direction: column;
            gap: 15px;
        }
        .cart-actions-row form, .cart-actions-row .btn-ghost, .cart-actions-row .btn-main {
            width: 100%;
        }
        .cart-actions-row .btn-ghost, .cart-actions-row .btn-main {
            text-align: center;
            display: block;
        }
    }
</style>

<div class="page active" style="opacity: 1; visibility: visible; padding: 20px 0;">
    <div class="cart-page-container">
        <h1 class="cart-title">Váš nákupní košík 🛒</h1>

        <?php if (empty($items)): ?>
            <div class="cart-empty-state">
                <div class="cart-empty-icon">🍺</div>
                <div class="cart-empty-text">Váš košík zeje prázdnotou</div>
                <p class="cart-empty-desc">Natočte si nějaké z našich skvělých 3D tištěných doplňků nebo filamentů!</p>
                <a href="produkty.php" class="btn-main" style="text-decoration: none;">Přejít do katalogu</a>
            </div>
        <?php else: ?>
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Produkt</th>
                        <th>Cena za kus</th>
                        <th>Množství</th>
                        <th>Celkem</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($items as $item): ?>
                        <tr>
                            <td>
                                <div class="cart-item-detail">
                                    <img src="<?= htmlspecialchars($item->image) ?>" alt="<?= htmlspecialchars($item->name) ?>" class="cart-item-img" onerror="this.src='./imgs/hero_image2.png'">
                                    <div class="cart-item-info">
                                        <span class="cart-item-title"><?= htmlspecialchars($item->name) ?></span>
                                        <?php if ($item->variant): ?>
                                            <span class="cart-item-variant"><?= htmlspecialchars($item->variant) ?></span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </td>
                            <td class="cart-price-col">
                                <?= number_format($item->unitPrice, 0, ',', ' ') ?> Kč
                            </td>
                            <td>
                                <div class="qty-controls">
                                    <form action="" method="POST" style="display:inline;">
                                        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                                        <input type="hidden" name="action" value="update">
                                        <input type="hidden" name="product_id" value="<?= $item->productId ?>">
                                        <input type="hidden" name="variant" value="<?= htmlspecialchars($item->variant ?? '') ?>">
                                        <input type="hidden" name="quantity" value="<?= $item->quantity - 1 ?>">
                                        <button type="submit" class="qty-btn-small">−</button>
                                    </form>

                                    <input type="text" class="qty-input" value="<?= $item->quantity ?>" readonly>

                                    <form action="" method="POST" style="display:inline;">
                                        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                                        <input type="hidden" name="action" value="update">
                                        <input type="hidden" name="product_id" value="<?= $item->productId ?>">
                                        <input type="hidden" name="variant" value="<?= htmlspecialchars($item->variant ?? '') ?>">
                                        <input type="hidden" name="quantity" value="<?= $item->quantity + 1 ?>">
                                        <button type="submit" class="qty-btn-small">+</button>
                                    </form>
                                </div>
                            </td>
                            <td class="cart-price-col" style="color: #fff;">
                                <?= number_format($item->getSubtotal(), 0, ',', ' ') ?> Kč
                            </td>
                            <td>
                                <a href="?action=remove&id=<?= $item->productId ?>&variant=<?= urlencode($item->variant ?? '') ?>" 
                                   class="cart-remove-btn" 
                                   onclick="return confirm('Opravdu chcete odebrat tento produkt z košíku?')"
                                   aria-label="Odebrat položku">
                                    🗑️
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <div class="cart-summary-box">
                <span class="cart-total-label">Celková cena zboží:</span>
                <span class="cart-total-val"><?= number_format($totalPrice, 0, ',', ' ') ?> Kč</span>
            </div>

            <div class="cart-actions-row">
                <form action="" method="POST" onsubmit="return confirm('Opravdu chcete vyprázdnit celý košík?')">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                    <input type="hidden" name="action" value="clear">
                    <button type="submit" class="btn-ghost" style="cursor: pointer; padding: 12px 24px; font-family: inherit; font-size: 1em;">
                        Vyprázdnit košík 🗑️
                    </button>
                </form>

                <a href="objednavka.php" class="btn-main" style="text-decoration: none; padding: 12px 30px; display: inline-block;">
                    Pokračovat k objednávce ➔
                </a>
            </div>
        <?php endif; ?>
    </div>
</div>
<?php
require __DIR__ . '/partials/footer.php';
?>
