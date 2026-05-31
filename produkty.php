<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$productRepo = new ProductRepository();
$categoryRepo = new CategoryRepository();

$categories = $categoryRepo->getAll();
$products = $productRepo->getAll();

// Get active category from query parameter for deep links
$activeCategorySlug = $_GET['category'] ?? 'all';

$pageTitle = 'Katalog produktů | BEER 3D';
require __DIR__ . '/partials/header.php';
?>
<section class="page active" id="page-products" style="opacity: 1; visibility: visible;">
    <div class="products-wrapper">
        <div class="page-intro">
            <h2 class="section-title">Katalog produktů</h2>
            <p>Procházejte naši nabídku 3D tiskáren, filamentů a vlastních výrobků.</p>
        </div>

        <div class="product-controls">
            <div class="product-search-wrapper">
                <input type="text" id="product-search" class="product-search"
                       placeholder="Hledat produkty..." oninput="searchProducts(this.value)"
                       aria-label="Vyhledat produkty">
                <span class="search-icon">🔍</span>
            </div>

            <div class="product-filters" id="product-filters">
                <button class="filter-btn <?= $activeCategorySlug === 'all' ? 'active' : '' ?>" data-category="all"
                        onclick="filterProducts('all')">Vše</button>
                <?php foreach ($categories as $cat): ?>
                    <button class="filter-btn <?= $activeCategorySlug === $cat->slug ? 'active' : '' ?>" 
                            data-category="<?= htmlspecialchars($cat->name) ?>"
                            onclick="filterProducts('<?= htmlspecialchars($cat->name) ?>')">
                        <?= htmlspecialchars($cat->name) ?>
                    </button>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="products-grid" id="products-grid">
            <?php foreach ($products as $product): ?>
                <?php require __DIR__ . '/partials/product-card.php'; ?>
            <?php endforeach; ?>
        </div>
    </div>

    <footer class="footer" role="contentinfo">
        <div class="footer-grid">
            <div class="foot-col">© 2025 BEER 3D. Všechna práva vyhrazena.</div>
        </div>
    </footer>
</section>

<script>
    let currentFilter = 'all';
    let currentSearchQuery = '';

    document.addEventListener('DOMContentLoaded', () => {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) {
            const category = activeBtn.getAttribute('data-category');
            filterProducts(category);
        }
    });

    function filterProducts(category) {
        currentFilter = category;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-category') === category);
        });

        applyFiltersAndSearch();
    }

    function searchProducts(query) {
        currentSearchQuery = query.toLowerCase().trim();
        applyFiltersAndSearch();
    }

    function applyFiltersAndSearch() {
        let visibleIndex = 0;

        document.querySelectorAll('.product-card').forEach((card) => {
            const productCategory = card.getAttribute('data-category');
            
            // Check category filter
            const matchesCategory = currentFilter === 'all' || productCategory === currentFilter;

            // Check search query
            let matchesSearch = true;
            if (currentSearchQuery) {
                const name = card.querySelector('.product-name').textContent.toLowerCase();
                const desc = card.querySelector('.product-description').textContent.toLowerCase();
                matchesSearch = name.includes(currentSearchQuery) || desc.includes(currentSearchQuery) || productCategory.toLowerCase().includes(currentSearchQuery);
            }

            // Show or hide based on filters
            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                card.style.animationDelay = `${visibleIndex * 0.05}s`;
                visibleIndex++;
            } else {
                card.style.display = 'none';
            }
        });
    }
</script>
<?php
require __DIR__ . '/partials/footer.php';
?>
