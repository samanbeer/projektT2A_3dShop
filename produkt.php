<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$productRepo = new ProductRepository();

$slug = $_GET['slug'] ?? '';
$product = $productRepo->getBySlug($slug);

if (!$product) {
    header('Location: 404_page/404.html');
    exit;
}

// Generate CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Handle Add to Cart POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])) {
        http_response_code(403);
        exit('Neplatný bezpečnostní token.');
    }

    $productId = (int)$_POST['product_id'];
    $quantity = (int)($_POST['quantity'] ?? 1);
    
    // Construct variant string from POST selections
    $variantParts = [];
    foreach ($_POST as $key => $val) {
        if (str_starts_with($key, 'param_')) {
            $paramName = str_replace('param_', '', $key);
            $variantParts[] = htmlspecialchars($paramName) . ': ' . htmlspecialchars($val);
        }
    }
    $variant = !empty($variantParts) ? implode(', ', $variantParts) : null;

    $cart = new Cart();
    
    // Fetch product details for validation
    $targetProduct = $productRepo->getById($productId);
    if ($targetProduct && $targetProduct->inStock) {
        $cart->add(
            productId: $targetProduct->id,
            productName: $targetProduct->name,
            unitPrice: $targetProduct->price,
            image: $targetProduct->image,
            variant: $variant,
            quantity: $quantity
        );

        $_SESSION['notification'] = "{$targetProduct->name}" . ($variant ? " ({$variant})" : "") . " přidán do košíku! 🍺";
    }
    
    header('Location: kosik.php');
    exit;
}

$images = $productRepo->getImages($product->id);
// Filter out gallery images that are identical to the main product image
$mainImageNormalized = ltrim($product->image, './');
$images = array_filter($images, function($img) use ($mainImageNormalized) {
    return ltrim($img->image, './') !== $mainImageNormalized;
});

$params = $productRepo->getParameters($product->id);

$selectableParams = array_filter($params, fn($p) => $p->isSelectable());
$infoParams = array_filter($params, fn($p) => !$p->isSelectable());

// Group selectable parameters by parameter name
$groupedSelectable = [];
foreach ($selectableParams as $param) {
    if (!isset($groupedSelectable[$param->name])) {
        $groupedSelectable[$param->name] = [];
    }
    $groupedSelectable[$param->name][] = $param->value;
}

$pageTitle = "{$product->name} | BEER 3D";
require __DIR__ . '/partials/header.php';
?>
<style>
    .detail-grid {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 50px;
        max-width: 1100px;
        margin: 40px auto;
        padding: 40px;
        border-radius: 20px;
        background: var(--bg-card);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border);
    }
    .detail-gallery {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    .detail-main-img {
        width: 100%;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        object-fit: cover;
        max-height: 450px;
    }
    .gallery-thumbs {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding-bottom: 5px;
    }
    .gallery-thumb {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        object-fit: cover;
        transition: border-color 0.3s;
    }
    .gallery-thumb:hover, .gallery-thumb.active {
        border-color: var(--accent, #ffc107);
    }
    .detail-info {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .detail-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 6px;
        background: rgba(255, 193, 7, 0.1);
        color: var(--accent, #ffc107);
        font-weight: 600;
        font-size: 0.85em;
        align-self: flex-start;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    .detail-price {
        font-size: 2.2em;
        font-weight: 800;
        color: #fff;
    }
    .detail-price .price-unit {
        font-size: 0.6em;
        color: rgba(255, 255, 255, 0.5);
    }

    .detail-desc {
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.6;
        font-size: 1em;
    }
    .detail-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-top: 10px;
        padding: 20px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .form-group label {
        font-weight: 600;
        font-size: 0.9em;
        color: rgba(255, 255, 255, 0.8);
    }
    .form-control {
        padding: 12px 16px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #fff;
        font-family: inherit;
        font-size: 1em;
        outline: none;
        transition: border-color 0.3s;
    }
    .form-control:focus {
        border-color: var(--accent, #ffc107);
    }
    .qty-input-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .qty-btn {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #fff;
        font-size: 1.2em;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
    }
    .qty-btn:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    .info-params {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .info-param-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.9em;
        padding: 8px 0;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.03);
    }
    .info-param-name {
        color: rgba(255, 255, 255, 0.5);
    }
    .info-param-value {
        color: #fff;
        font-weight: 500;
    }
    @media (max-width: 768px) {
        .detail-grid {
            grid-template-columns: 1fr;
            padding: 20px;
            gap: 30px;
        }
    }
</style>

<div class="page active" style="opacity: 1; visibility: visible; padding: 20px 0;">
    <div class="detail-grid">
        <!-- Gallery -->
        <div class="detail-gallery">
            <img src="<?= htmlspecialchars($product->image) ?>" alt="<?= htmlspecialchars($product->name) ?>" class="detail-main-img" id="main-image">
            <?php if (!empty($images)): ?>
                <div class="gallery-thumbs">
                    <img src="<?= htmlspecialchars($product->image) ?>" alt="Main view" class="gallery-thumb active" onclick="switchImage('<?= htmlspecialchars($product->image) ?>', this)">
                    <?php foreach ($images as $img): ?>
                        <img src="<?= htmlspecialchars($img->image) ?>" alt="Gallery detail" class="gallery-thumb" onclick="switchImage('<?= htmlspecialchars($img->image) ?>', this)">
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <!-- Info details -->
        <div class="detail-info">
            <span class="detail-badge"><?= htmlspecialchars($product->categoryName) ?></span>
            <h1 class="gradient-text" style="font-size: 2.2em; font-weight: 800; line-height: 1.2;"><?= htmlspecialchars($product->name) ?></h1>
            
            <div class="detail-price">
                <?= number_format($product->price, 0, ',', ' ') ?><span class="price-unit"> Kč</span>
            </div>

            <p class="detail-desc"><?= htmlspecialchars($product->description) ?></p>

            <form action="" method="POST" class="detail-form">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
                <input type="hidden" name="product_id" value="<?= $product->id ?>">

                <!-- Selectable parameters (Variants) -->
                <?php foreach ($groupedSelectable as $name => $values): ?>
                    <div class="form-group">
                        <label for="param-<?= htmlspecialchars(strtolower($name)) ?>">Vyberte <?= htmlspecialchars(strtolower($name)) ?>:</label>
                        <select name="param_<?= htmlspecialchars($name) ?>" id="param-<?= htmlspecialchars(strtolower($name)) ?>" class="form-control" required>
                            <?php foreach ($values as $val): ?>
                                <option value="<?= htmlspecialchars($val) ?>"><?= htmlspecialchars($val) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                <?php endforeach; ?>

                <!-- Quantity selector -->
                <div class="form-group">
                    <label for="quantity">Množství:</label>
                    <div class="qty-input-wrapper">
                        <button type="button" class="qty-btn" onclick="updateQty(-1)">−</button>
                        <input type="number" name="quantity" id="quantity" class="form-control" value="1" min="1" max="99" style="width: 70px; text-align: center;" readonly>
                        <button type="button" class="qty-btn" onclick="updateQty(1)">+</button>
                    </div>
                </div>

                <!-- Action Button -->
                <?php if ($product->inStock): ?>
                    <button type="submit" class="btn-main" style="width: 100%; border: none; font-family: inherit; font-size: 1.1em; cursor: pointer; padding: 14px 20px;">
                        Přidat do košíku 🛒
                    </button>
                <?php else: ?>
                    <button type="button" class="btn-main" disabled style="width: 100%; background: #555; cursor: not-allowed; padding: 14px 20px;">
                        Vyprodáno
                    </button>
                <?php endif; ?>
            </form>

            <!-- Informational Parameters -->
            <?php if (!empty($infoParams)): ?>
                <div class="info-params">
                    <h3 style="font-size: 1.1em; font-weight: 600; margin-bottom: 10px; color: rgba(255,255,255,0.9);">Parametry produktu:</h3>
                    <?php foreach ($infoParams as $p): ?>
                        <div class="info-param-row">
                            <span class="info-param-name"><?= htmlspecialchars($p->name) ?></span>
                            <span class="info-param-value"><?= htmlspecialchars($p->value) ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
    function switchImage(src, thumb) {
        document.getElementById('main-image').src = src;
        document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
    }

    function updateQty(change) {
        const input = document.getElementById('quantity');
        let val = parseInt(input.value) + change;
        if (val < 1) val = 1;
        if (val > 99) val = 99;
        input.value = val;
    }
</script>
<?php
require __DIR__ . '/partials/footer.php';
?>
