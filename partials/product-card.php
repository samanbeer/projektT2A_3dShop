<?php
declare(strict_types=1);
/** @var ProductDTO $product */

$soldOutBadge = !$product->inStock ? '<div class="sold-out-badge">Vyprodáno</div>' : '';
?>
<div class="product-card <?= !$product->inStock ? 'product-sold-out' : 'product-available' ?>" 
     data-category="<?= htmlspecialchars($product->categoryName) ?>" 
     data-product-id="<?= htmlspecialchars((string)$product->id) ?>"
     onclick="window.location.href='produkt.php?slug=<?= htmlspecialchars($product->slug) ?>'"
     style="cursor: pointer;">
    
    <div class="product-image-wrapper">
        <img src="<?= htmlspecialchars($product->image) ?>" alt="<?= htmlspecialchars($product->name) ?>" class="product-image" onerror="this.src='./imgs/hero_image2.png'">
        <?= $soldOutBadge ?>
    </div>
    
    <div class="product-info">
        <div class="product-category"><?= htmlspecialchars($product->categoryName) ?></div>
        <h3 class="product-name"><?= htmlspecialchars($product->name) ?></h3>
        <p class="product-description"><?= htmlspecialchars($product->description) ?></p>
        <div class="product-footer">
            <div class="product-price">
                <?= number_format($product->price, 0, ',', ' ') ?><span class="price-unit"> Kč</span>
            </div>
            <?php if ($product->inStock): ?>
                <a href="produkt.php?slug=<?= htmlspecialchars($product->slug) ?>" class="product-btn-quick" style="text-decoration: none; text-align: center; display: inline-block; line-height: 2.2;">Zobrazit</a>
            <?php else: ?>
                <div class="product-status-text">Vyprodáno</div>
            <?php endif; ?>
        </div>
    </div>
</div>
