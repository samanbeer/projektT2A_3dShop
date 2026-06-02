<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$orderId = (int)($_GET['id'] ?? 0);

$orderRepo = new OrderRepository();
$customerRepo = new CustomerRepository();
$shippingRepo = new ShippingMethodRepository();
$paymentRepo = new PaymentMethodRepository();

$order = $orderRepo->getById($orderId);

if (!$order) {
    header('Location: 404_page/404.html');
    exit;
}

$customer = $customerRepo->getById($order->customerId);
$shipping = $shippingRepo->getById($order->shippingMethodId);
$payment = $paymentRepo->getById($order->paymentMethodId);

// Fetch order items to display
$db = Database::getConnection();
$stmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC");
$stmt->execute([$order->id]);
$items = $stmt->fetchAll();

$pageTitle = 'Děkujeme za objednávku | BEER 3D';
require __DIR__ . '/partials/header.php';
?>
<style>
    .thanks-container {
        max-width: 800px;
        margin: 40px auto;
        border-radius: 20px;
        text-align: center;
        background: var(--bg-card);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border);
        text-align: center;
    }
    .thanks-icon {
        font-size: 5em;
        margin-bottom: 20px;
        animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    .thanks-title {
        font-size: 2.2em;
        font-weight: 800;
        margin-bottom: 15px;
    }
    .thanks-order-num {
        font-size: 1.2em;
        color: var(--accent, #ffc107);
        font-weight: 700;
        margin-bottom: 30px;
    }
    .thanks-desc {
        color: rgba(255,255,255,0.7);
        line-height: 1.7;
        font-size: 1.05em;
        margin-bottom: 40px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }
    .summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        text-align: left;
        margin-bottom: 45px;
        padding: 30px;
        background: rgba(255,255,255,0.02);
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.03);
    }
    .summary-title {
        font-size: 1.1em;
        font-weight: 700;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        padding-bottom: 8px;
        margin-bottom: 15px;
        color: #fff;
    }
    .summary-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 0.9em;
        color: rgba(255,255,255,0.7);
    }
    .summary-details strong {
        color: #fff;
    }
    .order-items-recap {
        text-align: left;
        background: rgba(255,255,255,0.02);
        border-radius: 12px;
        padding: 30px;
        border: 1px solid rgba(255,255,255,0.03);
        margin-bottom: 40px;
    }
    .recap-item-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px dashed rgba(255,255,255,0.03);
        font-size: 0.95em;
    }
    .recap-item-row.recap-header {
        font-weight: 700;
        color: rgba(255,255,255,0.5);
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .recap-item-row.recap-total {
        font-size: 1.25em;
        font-weight: 800;
        color: #fff;
        border-bottom: none;
        margin-top: 10px;
    }
    @media (max-width: 768px) {
        .summary-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 20px;
        }
    }
</style>

<div class="page active" style="opacity: 1; visibility: visible; padding: 20px 0;">
    <div class="thanks-container">
        <div class="thanks-icon">🍻</div>
        <h1 class="thanks-title gradient-text">Děkujeme za vaši objednávku!</h1>
        <div class="thanks-order-num">Číslo vaší objednávky je: #<?= htmlspecialchars((string)$order->id) ?></div>
        
        <p class="thanks-desc">
            Úspěšně jsme zaznamenali vaši objednávku do naší databáze. Již brzy začneme tisknout vaše doplňky s maximální precizností! 
            Na zadanou e-mailovou adresu jsme vám odeslali rekapitulaci. Jakmile zásilku předáme dopravci, budeme vás informovat.
        </p>

        <!-- Dynamic summary breakdown directly from DB -->
        <div class="summary-grid">
            <!-- Customer Delivery Details -->
            <div>
                <h3 class="summary-title">Doručovací údaje</h3>
                <div class="summary-details">
                    <span><strong>Příjemce:</strong> <?= htmlspecialchars($customer->firstName) ?> <?= htmlspecialchars($customer->lastName) ?></span>
                    <span><strong>Telefon:</strong> <?= htmlspecialchars($customer->phone) ?></span>
                    <span><strong>E-mail:</strong> <?= htmlspecialchars($customer->email) ?></span>
                    <span><strong>Adresa:</strong> <?= htmlspecialchars($customer->street) ?>, <?= htmlspecialchars($customer->city) ?>, <?= htmlspecialchars($customer->zip) ?></span>
                </div>
            </div>

            <!-- Transport & Payment -->
            <div>
                <h3 class="summary-title">Doprava a platba</h3>
                <div class="summary-details">
                    <span><strong>Doprava:</strong> <?= htmlspecialchars($shipping->name) ?> (<?= number_format($order->shippingPrice, 0, ',', ' ') ?> Kč)</span>
                    <span><strong>Platba:</strong> <?= htmlspecialchars($payment->name) ?> (<?= number_format($order->paymentPrice, 0, ',', ' ') ?> Kč)</span>
                    <?php if ($order->note): ?>
                        <span style="margin-top: 10px;"><strong>Poznámka:</strong> <em>"<?= htmlspecialchars($order->note) ?>"</em></span>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Ordered items breakdown -->
        <div class="order-items-recap">
            <h3 class="summary-title" style="border-bottom: none; margin-bottom: 10px;">Položky objednávky</h3>
            <div class="recap-item-row recap-header">
                <span>Položka</span>
                <span>Cena celkem</span>
            </div>
            <?php foreach ($items as $item): ?>
                <div class="recap-item-row">
                    <span>
                        <?= htmlspecialchars($item['product_name']) ?>
                        <?php if ($item['variant']): ?>
                            <span style="color: var(--accent, #ffc107); font-size: 0.85em; display: block;"><?= htmlspecialchars($item['variant']) ?></span>
                        <?php endif; ?>
                        <span style="color: rgba(255,255,255,0.4); font-size: 0.85em;">Množství: <?= $item['quantity'] ?> × <?= number_format($item['unit_price'], 0, ',', ' ') ?> Kč</span>
                    </span>
                    <span style="font-weight: 600;"><?= number_format($item['unit_price'] * $item['quantity'], 0, ',', ' ') ?> Kč</span>
                </div>
            <?php endforeach; ?>
            <div class="recap-item-row recap-total">
                <span>Celkem k úhradě:</span>
                <span>
                    <?= number_format($order->totalPrice, 0, ',', ' ') ?> Kč
                    <?php if ($order->paymentMethodId === 4): ?>
                        <span style="font-size: 0.7em; color: var(--accent, #ffc107); display: block; text-align: right; font-weight: 500; margin-top: 4px;">(<?= round($order->totalPrice / 25) ?> piv)</span>
                    <?php endif; ?>
                </span>
            </div>
        </div>

        <a href="index.php" class="btn-main" style="text-decoration: none; padding: 12px 30px; display: inline-block;">
            Zpět na hlavní stránku ➔
        </a>
    </div>
</div>
<?php
require __DIR__ . '/partials/footer.php';
?>
