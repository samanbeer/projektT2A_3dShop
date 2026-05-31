<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$cart = new Cart();
if ($cart->isEmpty()) {
    header('Location: kosik.php');
    exit;
}

$shippingRepo = new ShippingMethodRepository();
$paymentRepo = new PaymentMethodRepository();
$customerRepo = new CustomerRepository();
$orderRepo = new OrderRepository();

$shippingMethods = $shippingRepo->getAll();
$paymentMethods = $paymentRepo->getAll();

$errors = [];
$values = $_POST;

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])) {
        http_response_code(403);
        exit('Neplatný bezpečnostní token.');
    }

    $validator = new Validator($_POST);
    $validator->required('first_name', 'Jméno je povinné.')
              ->required('last_name', 'Příjmení je povinné.')
              ->required('email', 'E-mail je povinný.')
              ->email('email', 'Zadejte platnou e-mailovou adresu.')
              ->required('phone', 'Telefonní číslo je povinné.')
              ->phone('phone', 'Zadejte platné telefonní číslo.')
              ->required('street', 'Ulice a číslo popisné jsou povinné.')
              ->required('city', 'Město je povinné.')
              ->required('zip', 'PSČ je povinné.')
              ->zip('zip', 'Zadejte platné PSČ (např. 110 00).')
              ->required('shipping_method_id', 'Vyberte způsob dopravy.')
              ->required('payment_method_id', 'Vyberte způsob platby.');

    if ($validator->isValid()) {
        try {
            // 1. Create Customer
            $customer = $customerRepo->create(
                firstName: trim($_POST['first_name']),
                lastName: trim($_POST['last_name']),
                email: trim($_POST['email']),
                phone: trim($_POST['phone']),
                street: trim($_POST['street']),
                city: trim($_POST['city']),
                zip: trim(str_replace(' ', '', $_POST['zip']))
            );

            // 2. Create Order
            $order = $orderRepo->create(
                customerId: $customer->id,
                shippingMethodId: (int)$_POST['shipping_method_id'],
                paymentMethodId: (int)$_POST['payment_method_id'],
                note: trim($_POST['note'] ?? ''),
                cartItems: $cart->getItems()
            );

            // 3. Clear Cart
            $cart->clear();

            // 4. Redirect to thank you page
            header('Location: podekovani.php?id=' . $order->id);
            exit;
        } catch (Exception $e) {
            $errors['global'] = 'Při odesílání objednávky došlo k chybě: ' . $e->getMessage();
        }
    } else {
        $errors = $validator->getErrors();
    }
}

$items = $cart->getItems();
$itemsPrice = $cart->getTotalPrice();

$pageTitle = 'Dokončení objednávky | BEER 3D';
require __DIR__ . '/partials/header.php';
?>
<style>
    .checkout-container {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 40px;
        max-width: 1100px;
        margin: 40px auto;
        padding: 40px;
        border-radius: 20px;
        background: var(--bg-card);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border);
    }
    .checkout-form-section {
        display: flex;
        flex-direction: column;
        gap: 30px;
    }
    .checkout-section-title {
        font-size: 1.3em;
        font-weight: 700;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        padding-bottom: 10px;
        margin-bottom: 15px;
        color: #fff;
    }
    .form-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }
    .error-text {
        color: #ff3b30;
        font-size: 0.8em;
        margin-top: 5px;
    }
    .checkout-options-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .checkout-option-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 20px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        cursor: pointer;
        transition: border-color 0.3s, background 0.3s;
    }
    .checkout-option-label:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.15);
    }
    .checkout-option-label.active {
        border-color: var(--accent, #ffc107);
        background: rgba(255, 193, 7, 0.02);
    }
    .option-radio-group {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .option-details {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
    .option-name {
        font-weight: 700;
        color: #fff;
    }
    .option-desc {
        font-size: 0.8em;
        color: rgba(255,255,255,0.5);
    }
    .option-price {
        font-weight: 600;
        color: #fff;
    }
    .checkout-summary-section {
        background: rgba(255,255,255,0.02);
        border-radius: 14px;
        padding: 25px;
        border: 1px solid rgba(255,255,255,0.03);
        height: fit-content;
    }
    .summary-item-row {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px 0;
        border-bottom: 1px dashed rgba(255,255,255,0.03);
    }
    .summary-item-img {
        width: 45px;
        height: 45px;
        border-radius: 6px;
        object-fit: cover;
        border: 1px solid rgba(255,255,255,0.05);
    }
    .summary-item-name {
        flex-grow: 1;
        font-size: 0.9em;
        color: rgba(255,255,255,0.8);
    }
    .summary-item-variant {
        font-size: 0.75em;
        color: var(--accent, #ffc107);
        display: block;
    }
    .summary-item-price {
        font-weight: 600;
        font-size: 0.9em;
    }
    .total-recap-box {
        margin-top: 25px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .recap-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.95em;
        color: rgba(255,255,255,0.6);
    }
    .recap-row.grand-total {
        font-size: 1.4em;
        font-weight: 800;
        color: #fff;
        border-top: 1px solid rgba(255,255,255,0.05);
        padding-top: 15px;
        margin-top: 5px;
    }
    .form-control {
        width: 100%;
        padding: 14px 18px;
        background: var(--bg-surface) !important;
        border: 1px solid var(--glass-border) !important;
        border-radius: var(--radius-md) !important;
        color: var(--text-primary) !important;
        font-family: 'Montserrat', sans-serif !important;
        font-size: 1rem !important;
        transition: var(--transition-base) !important;
        box-sizing: border-box;
    }
    .form-control:focus {
        outline: none;
        border-color: var(--accent-orange) !important;
        box-shadow: 0 0 15px var(--orange-glow) !important;
    }
    @media (max-width: 768px) {
        .checkout-container {
            grid-template-columns: 1fr;
            padding: 20px;
        }
        .form-grid-2 {
            grid-template-columns: 1fr;
        }
    }
</style>

<div class="page active" style="opacity: 1; visibility: visible; padding: 20px 0;">
    <div class="checkout-container">
        <!-- Form columns -->
        <form action="" method="POST" id="checkout-form" class="checkout-form-section">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">

            <?php if (isset($errors['global'])): ?>
                <div class="error-text" style="font-size: 1em; padding: 15px; background: rgba(255,59,48,0.1); border-radius: 8px; border: 1px solid #ff3b30; margin-bottom: 20px;">
                    <?= htmlspecialchars($errors['global']) ?>
                </div>
            <?php endif; ?>

            <!-- Contact Details -->
            <div>
                <h2 class="checkout-section-title">Osobní údaje</h2>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label for="first_name">Jméno *</label>
                        <input type="text" name="first_name" id="first_name" class="form-control" 
                               value="<?= htmlspecialchars($values['first_name'] ?? '') ?>" required>
                        <?php if (isset($errors['first_name'])): ?>
                            <span class="error-text"><?= htmlspecialchars($errors['first_name']) ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="form-group">
                        <label for="last_name">Příjmení *</label>
                        <input type="text" name="last_name" id="last_name" class="form-control" 
                               value="<?= htmlspecialchars($values['last_name'] ?? '') ?>" required>
                        <?php if (isset($errors['last_name'])): ?>
                            <span class="error-text"><?= htmlspecialchars($errors['last_name']) ?></span>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="form-grid-2" style="margin-top: 15px;">
                    <div class="form-group">
                        <label for="email">E-mail *</label>
                        <input type="email" name="email" id="email" class="form-control" 
                               value="<?= htmlspecialchars($values['email'] ?? '') ?>" required>
                        <?php if (isset($errors['email'])): ?>
                            <span class="error-text"><?= htmlspecialchars($errors['email']) ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="form-group">
                        <label for="phone">Telefon *</label>
                        <input type="tel" name="phone" id="phone" class="form-control" 
                               value="<?= htmlspecialchars($values['phone'] ?? '') ?>" placeholder="+420 777 123 456" required>
                        <?php if (isset($errors['phone'])): ?>
                            <span class="error-text"><?= htmlspecialchars($errors['phone']) ?></span>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- Billing Address -->
            <div>
                <h2 class="checkout-section-title">Dodací adresa</h2>
                <div class="form-group">
                    <label for="street">Ulice a číslo popisné *</label>
                    <input type="text" name="street" id="street" class="form-control" 
                           value="<?= htmlspecialchars($values['street'] ?? '') ?>" required>
                    <?php if (isset($errors['street'])): ?>
                        <span class="error-text"><?= htmlspecialchars($errors['street']) ?></span>
                    <?php endif; ?>
                </div>
                <div class="form-grid-2" style="margin-top: 15px;">
                    <div class="form-group">
                        <label for="city">Město *</label>
                        <input type="text" name="city" id="city" class="form-control" 
                               value="<?= htmlspecialchars($values['city'] ?? '') ?>" required>
                        <?php if (isset($errors['city'])): ?>
                            <span class="error-text"><?= htmlspecialchars($errors['city']) ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="form-group">
                        <label for="zip">PSČ *</label>
                        <input type="text" name="zip" id="zip" class="form-control" 
                               value="<?= htmlspecialchars($values['zip'] ?? '') ?>" placeholder="110 00" required>
                        <?php if (isset($errors['zip'])): ?>
                            <span class="error-text"><?= htmlspecialchars($errors['zip']) ?></span>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- Shipping Methods -->
            <div>
                <h2 class="checkout-section-title">Způsob dopravy</h2>
                <div class="checkout-options-list">
                    <?php foreach ($shippingMethods as $index => $ship): ?>
                        <label class="checkout-option-label <?= ((int)($values['shipping_method_id'] ?? 2) === $ship->id) ? 'active' : '' ?>">
                            <span class="option-radio-group">
                                <input type="radio" name="shipping_method_id" value="<?= $ship->id ?>" 
                                       data-price="<?= $ship->price ?>"
                                       <?= ((int)($values['shipping_method_id'] ?? 2) === $ship->id) ? 'checked' : '' ?>
                                       onchange="updateOptionVisuals(); calculateTotalPrice();" required>
                                <span class="option-details">
                                    <span class="option-name"><?= htmlspecialchars($ship->name) ?></span>
                                    <span class="option-desc">Doba doručení: <?= htmlspecialchars($ship->deliveryDays) ?></span>
                                </span>
                            </span>
                            <span class="option-price">
                                <?= $ship->isFree() ? 'Zdarma' : number_format($ship->price, 0, ',', ' ') . ' Kč' ?>
                            </span>
                        </label>
                    <?php endforeach; ?>
                </div>
                <?php if (isset($errors['shipping_method_id'])): ?>
                    <span class="error-text"><?= htmlspecialchars($errors['shipping_method_id']) ?></span>
                <?php endif; ?>
            </div>

            <!-- Payment Methods -->
            <div>
                <h2 class="checkout-section-title">Způsob platby</h2>
                <div class="checkout-options-list">
                    <?php foreach ($paymentMethods as $pay): ?>
                        <label class="checkout-option-label <?= ((int)($values['payment_method_id'] ?? 1) === $pay->id) ? 'active' : '' ?>">
                            <span class="option-radio-group">
                                <input type="radio" name="payment_method_id" value="<?= $pay->id ?>" 
                                       data-price="<?= $pay->price ?>"
                                       <?= ((int)($values['payment_method_id'] ?? 1) === $pay->id) ? 'checked' : '' ?>
                                       onchange="updateOptionVisuals(); calculateTotalPrice();" required>
                                <span class="option-details">
                                    <span class="option-name"><?= htmlspecialchars($pay->name) ?></span>
                                </span>
                            </span>
                            <span class="option-price">
                                <?= $pay->price <= 0 ? 'Zdarma' : number_format($pay->price, 0, ',', ' ') . ' Kč' ?>
                            </span>
                        </label>
                    <?php endforeach; ?>
                </div>
                <?php if (isset($errors['payment_method_id'])): ?>
                    <span class="error-text"><?= htmlspecialchars($errors['payment_method_id']) ?></span>
                <?php endif; ?>
            </div>

            <!-- Note -->
            <div class="form-group">
                <label for="note">Poznámka k objednávce</label>
                <textarea name="note" id="note" class="form-control" style="resize: vertical; min-height: 80px;"><?= htmlspecialchars($values['note'] ?? '') ?></textarea>
            </div>

            <!-- Checkout Action Button -->
            <button type="submit" class="btn-main" style="width: 100%; border: none; font-family: inherit; font-size: 1.1em; cursor: pointer; padding: 14px 20px; text-align: center; margin-top: 10px;">
                Dokončit a odeslat objednávku ➔
            </button>
        </form>

        <!-- Right Side: Order summary recap -->
        <div class="checkout-summary-section">
            <h2 class="checkout-section-title" style="margin-bottom: 20px;">Vaše objednávka</h2>
            
            <div class="summary-items-list">
                <?php foreach ($items as $item): ?>
                    <div class="summary-item-row">
                        <img src="<?= htmlspecialchars($item->image) ?>" alt="<?= htmlspecialchars($item->name) ?>" class="summary-item-img" onerror="this.src='./imgs/hero_image2.png'">
                        <div class="summary-item-name">
                            <strong><?= htmlspecialchars($item->name) ?></strong>
                            <?php if ($item->variant): ?>
                                <span class="summary-item-variant"><?= htmlspecialchars($item->variant) ?></span>
                            <?php endif; ?>
                            <span style="color: rgba(255,255,255,0.4); font-size: 0.85em;">Množství: <?= $item->quantity ?></span>
                        </div>
                        <span class="summary-item-price"><?= number_format($item->getSubtotal(), 0, ',', ' ') ?> Kč</span>
                    </div>
                <?php endforeach; ?>
            </div>

            <div class="total-recap-box">
                <div class="recap-row">
                    <span>Mezisoučet zboží:</span>
                    <span id="summary-items-price" data-base="<?= $itemsPrice ?>"><?= number_format($itemsPrice, 0, ',', ' ') ?> Kč</span>
                </div>
                <div class="recap-row">
                    <span>Doprava:</span>
                    <span id="summary-shipping-price">0 Kč</span>
                </div>
                <div class="recap-row">
                    <span>Platba:</span>
                    <span id="summary-payment-price">0 Kč</span>
                </div>
                <div class="recap-row grand-total">
                    <span>Celkem k úhradě:</span>
                    <span id="summary-grand-total">0 Kč</span>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    function updateOptionVisuals() {
        document.querySelectorAll('.checkout-option-label').forEach(label => {
            const input = label.querySelector('input');
            if (input && input.checked) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
    }

    function calculateTotalPrice() {
        const itemsBasePrice = parseFloat(document.getElementById('summary-items-price').getAttribute('data-base'));
        
        let shippingPrice = 0;
        const selectedShipping = document.querySelector('input[name="shipping_method_id"]:checked');
        if (selectedShipping) {
            shippingPrice = parseFloat(selectedShipping.getAttribute('data-price'));
        }

        let paymentPrice = 0;
        const selectedPayment = document.querySelector('input[name="payment_method_id"]:checked');
        if (selectedPayment) {
            paymentPrice = parseFloat(selectedPayment.getAttribute('data-price'));
        }

        const grandTotal = itemsBasePrice + shippingPrice + paymentPrice;

        // Update summaries
        document.getElementById('summary-shipping-price').textContent = shippingPrice === 0 ? 'Zdarma' : shippingPrice.toLocaleString('cs-CZ') + ' Kč';
        document.getElementById('summary-payment-price').textContent = paymentPrice === 0 ? 'Zdarma' : paymentPrice.toLocaleString('cs-CZ') + ' Kč';
        document.getElementById('summary-grand-total').textContent = grandTotal.toLocaleString('cs-CZ') + ' Kč';
    }

    // Run on initial load
    document.addEventListener('DOMContentLoaded', () => {
        updateOptionVisuals();
        calculateTotalPrice();
    });
</script>
<?php
require __DIR__ . '/partials/footer.php';
?>
