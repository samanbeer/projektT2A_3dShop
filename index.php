<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$pageTitle = 'BEER 3D | Imersivní 3D tisková manufaktura';
require __DIR__ . '/partials/header.php';
?>

<!-- Load CDNs and Home 3D styles -->
<link rel="stylesheet" href="home_3d.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

<!-- Interactive 3D Loading Screen -->
<div class="loader-overlay-3d">
    <div class="loader-pint"></div>
    <div class="loader-text">Čepujeme 3D zážitek...</div>
</div>

<!-- Three.js Canvas Element (Fixed backdrop) -->
<div class="canvas-3d-wrapper" id="canvas-3d-container">
    <canvas id="canvas-3d"></canvas>
</div>

<!-- Active Page Wrapper -->
<div class="page active" id="page-home" style="opacity: 1; visibility: visible;">
    
    <!-- 1. Hero 3D Section -->
    <section class="scroll-section hero-3d-section" id="section-hero">
        <div class="hero-3d-content">
            <span class="badge">3D TISK & PIVO</span>
            <h1>TISKNEME S<br><span class="gradient-text-gold">CHUTÍ</span></h1>
            <p>Když se precizní zakázkový 3D tisk spojí s láskou k chmelu. Originální otvíráky, podtácky, personalizované stojany a technické díly tištěné na míru.</p>
            <div class="hero-3d-actions">
                <a href="materialy.php" class="btn-main" aria-label="Zobrazit sekci s materiály">Naše materiály</a>
                <a href="produkty.php" class="btn-ghost" aria-label="Zobrazit naše reference">E-shop</a>
            </div>
        </div>
    </section>

    <!-- 2. Features 3D Section -->
    <section class="scroll-section features-3d-section" id="section-features">
        <div class="features-grid-3d">
            <div class="feature-card-premium glass-effect-premium">
                <div class="feature-icon-box">🎯</div>
                <div>
                    <h3>Precizní tisk 0.05mm</h3>
                    <p>Tiskneme na nejmodernějších tiskárnách Bambu Lab a Creality s extrémní rozměrovou přesností a vrstvami tak jemnými, že je sotva spatříte.</p>
                </div>
            </div>
            
            <div class="feature-card-premium glass-effect-premium">
                <div class="feature-icon-box">🍺</div>
                <div>
                    <h3>Chmelový design & Gadgety</h3>
                    <p>Náš rukopis poznáte okamžitě. Vyvíjíme vlastní pivní gadgety, designové otvíráky a doplňky, které ozvláštní každou chvíli pohody.</p>
                </div>
            </div>
            
            <div class="feature-card-premium glass-effect-premium">
                <div class="feature-icon-box">🇨🇿</div>
                <div>
                    <h3>Lokální manufaktura Kopřivnice</h3>
                    <p>Vše modelujeme a tiskneme přímo v srdci Kopřivnice. Podporujeme místní nadšence a nabízíme osobní předání zcela zdarma.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 3. Portfolio Showroom Section (Interactive liquid changing) -->
    <section class="scroll-section portfolio-3d-section" id="section-portfolio">
        <div class="portfolio-header">
            <h2 class="section-title">Naše čepované portfolio</h2>
            <p>Přejeďte kurzorem přes naše výrobky níže a sledujte, jak se mění příchuť a barva našeho interaktivního 3D půllitru!</p>
        </div>
        
        <div class="portfolio-3d-grid">
            <div class="portfolio-card-premium glass-effect-premium active" data-variant="pilsner">
                <span class="beer-flavor-label">Pilsner Gold</span>
                <div class="portfolio-img-wrapper">
                    <img src="./imgs/phone_holder.png" alt="Stojan na telefon">
                </div>
                <div class="portfolio-info">
                    <h4>Vlastní stojan na telefon</h4>
                    <p>Robustní stolní stojánek s logem na míru, vytištěný z vysoce odolného PETG materiálu.</p>
                </div>
            </div>

            <div class="portfolio-card-premium glass-effect-premium" data-variant="ipa">
                <span class="beer-flavor-label">IPA Copper</span>
                <div class="portfolio-img-wrapper">
                    <img src="./imgs/pingpong_pálky.png" alt="Pingpongové pálky">
                </div>
                <div class="portfolio-info">
                    <h4>Pingpongové pálky</h4>
                    <p>Originální plně hratelné pálky na stolní tenis s odlehčeným včelím vzorem a perfektním gripem.</p>
                </div>
            </div>

            <div class="portfolio-card-premium glass-effect-premium" data-variant="stout">
                <span class="beer-flavor-label">Stout Dark</span>
                <div class="portfolio-img-wrapper">
                    <img src="./imgs/pístalky.png" alt="Píšťalky a doplňky">
                </div>
                <div class="portfolio-info">
                    <h4>Hlasité píšťalky a gadgety</h4>
                    <p>Extrémně výkonné dvoukomorové píšťalky a další praktické doplňky pro sport i kempování.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 4. FAQ Premium Accordions Section -->
    <section class="scroll-section faq-3d-section" id="section-faq">
        <div class="faq-title-box">
            <h2 class="section-title">Často kladené otázky</h2>
            <p class="faq-subtitle">Vše, co vás zajímá o naší zakázkové 3D tiskové manufaktuře.</p>
        </div>

        <div class="faq-wrapper-3d">
            <div class="faq-item-premium glass-effect-premium">
                <button class="faq-question-premium" onclick="togglePremiumFAQ(this)">
                    <span>Kolik času trvá výroba zakázkového tisku?</span>
                    <span class="faq-trigger-icon">+</span>
                </button>
                <div class="faq-answer-premium">
                    <div class="faq-answer-inner">
                        Doba tisku se odvíjí od velikosti modelu a zvolené výšky vrstvy. Běžně menší gadgety dodáváme do 1–3 dnů. U větších a složitějších sestav trvá realizace obvykle 3–7 dní. Vždy vás předem informujeme.
                    </div>
                </div>
            </div>

            <div class="faq-item-premium glass-effect-premium">
                <button class="faq-question-premium" onclick="togglePremiumFAQ(this)">
                    <span>Můžu dodat vlastní hotový 3D model?</span>
                    <span class="faq-trigger-icon">+</span>
                </button>
                <div class="faq-answer-premium">
                    <div class="faq-answer-inner">
                        Rozhodně! Přijímáme standardní formáty jako STL, OBJ, 3MF nebo STEP. Stačí nám soubor zaslat a my ho bezplatně zkontrolujeme, doporučíme vhodnou hustotu výplně a obratem naceníme.
                    </div>
                </div>
            </div>

            <div class="faq-item-premium glass-effect-premium">
                <button class="faq-question-premium" onclick="togglePremiumFAQ(this)">
                    <span>Jaké materiály používáte a jaká je jejich odolnost?</span>
                    <span class="faq-trigger-icon">+</span>
                </button>
                <div class="faq-answer-premium">
                    <div class="faq-answer-inner">
                        Standardně čepujeme: <strong>PLA</strong> (ekologické, detailní, pro designové modely), <strong>PETG</strong> (pružné, mechanicky vysoce odolné), <strong>ABS</strong> (tepelně odolné, skvělé do auta) a <strong>TPU</strong> (pružné, elastické). Zvolíme ten nejvhodnější pro účel vašeho výrobku.
                    </div>
                </div>
            </div>

            <div class="faq-item-premium glass-effect-premium">
                <button class="faq-question-premium" onclick="togglePremiumFAQ(this)">
                    <span>Jak funguje osobní odběr v Kopřivnici?</span>
                    <span class="faq-trigger-icon">+</span>
                </button>
                <div class="faq-answer-premium">
                    <div class="faq-answer-inner">
                        Osobní odběr u nás v Kopřivnici je zcela zdarma. Jakmile bude vaše objednávka kompletně vytištěná a připravená, zašleme vám notifikaci a domluvíme si čas předání. Ušetříte tak náklady na dopravu!
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer Area inside section -->
    <footer class="footer" role="contentinfo" style="margin-top: 5rem; z-index: 5; position: relative;">
        <div class="footer-grid">
            <div class="foot-col">© 2025 BEER 3D. Vytvořeno s precizností a chutí. Všechna práva vyhrazena.</div>
        </div>
    </footer>
</div>

<!-- Load dynamic 3D experience logic -->
<script src="home_3d.js"></script>

<script>
    function togglePremiumFAQ(button) {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        const answer = faqItem.querySelector('.faq-answer-premium');

        // Close all other FAQ items
        document.querySelectorAll('.faq-item-premium').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
                item.querySelector('.faq-answer-premium').style.maxHeight = null;
            }
        });

        // Toggle current FAQ item
        if (isActive) {
            faqItem.classList.remove('active');
            answer.style.maxHeight = null;
        } else {
            faqItem.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    }
</script>

<?php
require __DIR__ . '/partials/footer.php';
?>
