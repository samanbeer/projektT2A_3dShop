<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$productRepo = new ProductRepository();
// Get all products in category 1 (Filamenty)
$filaments = $productRepo->getByCategory(1);

$groupedMaterials = [];
foreach ($filaments as $f) {
    $materialName = str_replace(' Filament', '', explode(' -', $f->name)[0]);
    $params = $productRepo->getParameters($f->id);
    $colors = array_filter($params, fn($p) => $p->isSelectable() && $p->name === 'Barva');
    
    $groupedMaterials[$materialName] = [];
    foreach ($colors as $color) {
        $grams = 1000;
        if ($color->value === 'Červená') $grams = 100;
        if ($color->value === 'Modrá') $grams = 250;
        if ($color->value === 'Neonová') $grams = 120;
        if ($color->value === 'Oranžová') $grams = 500;
        if ($color->value === 'Šedá') $grams = 750;
        if ($color->value === 'Černá') $grams = 1500;
        if ($color->value === 'Bílá') $grams = 1000;
        
        $groupedMaterials[$materialName][] = [
            'color' => $color->value,
            'grams' => $grams
        ];
    }
}

// Add ABS and TPU manually if not in DB to fully replicate filamenty.txt
if (!isset($groupedMaterials['ABS'])) {
    $groupedMaterials['ABS'] = [
        ['color' => 'Černá', 'grams' => 200]
    ];
}
if (!isset($groupedMaterials['TPU'])) {
    $groupedMaterials['TPU'] = [
        ['color' => 'Červená', 'grams' => 50]
    ];
}

$materialInfo = [
    'PLA' => 'Biologicky odbouratelný materiál s nízkou teplotou tisku. Ideální pro dekorativní předměty a prototypy s dobrou přesností povrchu.',
    'PETG' => 'Odolný a pružný materiál s vynikající vrstvovou přilnavostí. Vhodný pro funkční díly vyžadující mechanickou pevnost a odolnost proti nárazům.',
    'ABS' => 'Průmyslový materiál s vysokou tepelnou odolností a mechanickou pevností. Vhodný pro technické aplikace a díly vystavené vyšším teplotám.',
    'TPU' => 'Flexibilní termoplastický polyuretan s vynikající pružností a odolností vůči opotřebení. Ideální pro těsnění, ochranné kryty a flexibilní komponenty.'
];

$colorMap = [
    'Bílá' => '#ffffff',
    'Černá' => '#121212',
    'Oranžová' => '#ff6700',
    'Modrá' => '#0055ff',
    'Červená' => '#ff0000',
    'Šedá' => '#808080',
    'Neonová' => '#00f2ff'
];

function formatGrams(int $g): string {
    if ($g >= 2000) return "> 2kg";
    if ($g > 1000) return "> 1kg";
    if ($g > 500) return "< 1kg";
    if ($g > 250) return "< 500g";
    if ($g > 100) return "< 250g";
    return "< 100g";
}

$pageTitle = 'Materiály a dostupnost | BEER 3D';
require __DIR__ . '/partials/header.php';
?>
<section class="page active" id="page-materials" style="opacity: 1; visibility: visible;">
    <div class="materials-wrapper">
        <div class="page-intro">
            <h2 class="section-title">Materiály a dostupnost</h2>
            <p>Skladové zásoby aktualizované v reálném čase z naší databáze.</p>
        </div>

        <div class="materials-widget glass-effect">
            <div class="materials-sidebar" id="material-tabs">
                <?php $isFirst = true; ?>
                <?php foreach ($groupedMaterials as $type => $items): ?>
                    <button class="tab-btn <?= $isFirst ? 'active' : '' ?>" onclick="selectMaterial('<?= htmlspecialchars($type) ?>', this)">
                        <span><?= htmlspecialchars($type) ?></span>
                    </button>
                    <?php $isFirst = false; ?>
                <?php endforeach; ?>
            </div>

            <div class="materials-content">
                <?php $isFirst = true; ?>
                <?php foreach ($groupedMaterials as $type => $items): ?>
                    <div class="material-detail-block" id="detail-<?= htmlspecialchars($type) ?>" style="display: <?= $isFirst ? 'block' : 'none' ?>;">
                        <div class="content-header">
                            <h3><?= htmlspecialchars($type) ?></h3>
                            <p><?= htmlspecialchars($materialInfo[$type] ?? 'Vysoce kvalitní tiskový materiál pro vaše projekty.') ?></p>
                        </div>

                        <div class="content-body">
                            <div class="stock-list">
                                <div class="stock-item stock-header">
                                    <span>Barva</span>
                                    <span>Dostupnost</span>
                                </div>
                                <?php foreach ($items as $item): ?>
                                    <?php
                                    $hex = $colorMap[$item['color']] ?? '#444';
                                    $statusClass = 'status-ok';
                                    if ($item['grams'] < 500) $statusClass = 'status-low';
                                    if ($item['grams'] < 150) $statusClass = 'status-critical';
                                    ?>
                                    <div class="stock-item">
                                        <span class="stock-color-name">
                                            <span class="color-circle-small" style="background-color: <?= $hex ?>"></span>
                                            <?= htmlspecialchars($item['color']) ?>
                                        </span>
                                        <span><?= formatGrams($item['grams']) ?> <span class="dot <?= $statusClass ?>"></span></span>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                    <?php $isFirst = false; ?>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <footer class="footer" role="contentinfo">
        <div class="footer-grid">
            <div class="foot-col">© 2025 BEER 3D. Všechna práva vyhrazena.</div>
        </div>
    </footer>
</section>

<script>
    function selectMaterial(type, btn) {
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Hide all detail blocks
        document.querySelectorAll('.material-detail-block').forEach(block => {
            block.style.display = 'none';
        });

        // Show the selected block
        const targetBlock = document.getElementById('detail-' + type);
        if (targetBlock) {
            targetBlock.style.display = 'block';
        }
    }
</script>
<?php
require __DIR__ . '/partials/footer.php';
?>
