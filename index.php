<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$pageTitle = 'BEER 3D // Cybernetic Print Manufaktura';
require __DIR__ . '/partials/header.php';
?>

<!-- Load CDNs, Cyberpunk grid and styles -->
<link rel="stylesheet" href="home_3d.css">
<script src="js/three.min.js"></script>
<script src="js/gsap.min.js"></script>
<script src="js/ScrollTrigger.min.js"></script>

<!-- CRT Scanlines Overlay -->
<div class="scanlines"></div>

<!-- Interactive 3D Loading Screen -->
<div class="loader-overlay-3d">
    <div class="loader-pint"></div>
    <div class="loader-text">Nahrávám kybernetické jádro...</div>
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
            <span class="badge">BEER 3D // CYBER-CORE</span>
            <h1>TISKNEME S<br><span class="gradient-text-gold">CHUTÍ</span></h1>
            <p>Precizní zakázkový 3D tisk spojený s estetikou neonového věku. Navrhujeme a tiskneme otvíráky, podtácky, taktické stojánky a zakázkové gadgety s integrovanými technologickými detaily.</p>
            <div class="hero-3d-actions">
                <a href="materialy.php" class="btn-cyber-primary" aria-label="Zobrazit sekci s materiály">Materiály</a>
                <a href="produkty.php" class="btn-cyber-ghost" aria-label="E-shop">E-shop</a>
            </div>
        </div>
    </section>

    <!-- 2. Features 3D Section -->
    <section class="scroll-section features-3d-section" id="section-features">
        <div class="features-grid-3d">
            <div class="feature-card-premium glass-effect-premium">
                <div class="feature-icon-box">🎯</div>
                <div>
                    <h3>Mikro-vrstvy 0.05mm</h3>
                    <p>Tiskneme na vysokorychlostních tiskárnách Bambu Lab a Creality s extrémní hustotou detailů a laserově přesným nanášením vrstev.</p>
                </div>
            </div>
            
            <div class="feature-card-premium glass-effect-premium">
                <div class="feature-icon-box">⚡</div>
                <div>
                    <h3>Neonový design & Pivní Gadgety</h3>
                    <p>Vlastní designová laboratoř. Vytváříme originální taktické otvíráky, magnetické zachytávače zátky a odolné outdoorové příslušenství.</p>
                </div>
            </div>
            
            <div class="feature-card-premium glass-effect-premium">
                <div class="feature-icon-box">🛠️</div>
                <div>
                    <h3>Manufaktura Kopřivnice // CZ-08</h3>
                    <p>Lokální modelování a tisk. Podporujeme místní komunitu, provádíme bezplatnou optimalizaci STL dat a nabízíme rychlé osobní předání.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 3. Portfolio Showroom Section (Interactive liquid changing) -->
    <section class="scroll-section portfolio-3d-section" id="section-portfolio">
        <div class="portfolio-header">
            <h2 class="section-title">Čepované portfolio</h2>
            <p>Přejeďte kurzorem přes naše výrobky a sledujte, jak se mění barva, záře a proudění energie v našem 3D kyber-kontejneru!</p>
        </div>
        
        <div class="portfolio-3d-grid">
            <div class="portfolio-card-premium glass-effect-premium active" data-variant="pilsner">
                <span class="beer-flavor-label">Green Acid core</span>
                <div class="portfolio-img-wrapper">
                    <img src="./imgs/phone_holder.png" alt="Stojan na telefon">
                </div>
                <div class="portfolio-info">
                    <h4>Stojánek [HOLDER-01]</h4>
                    <p>Stolní stojánek s logem na míru, vytištěný z odolného PETG s carbonovým finišem.</p>
                </div>
            </div>

            <div class="portfolio-card-premium glass-effect-premium" data-variant="ipa">
                <span class="beer-flavor-label">Pink Plasma core</span>
                <div class="portfolio-img-wrapper">
                    <img src="./imgs/pingpong_pálky.png" alt="Pingpongové pálky">
                </div>
                <div class="portfolio-info">
                    <h4>Pálky [TACTICAL-02]</h4>
                    <p>Originální odlehčené pálky na stolní tenis s aerodynamickým včelím vzorem a perfektním gripem.</p>
                </div>
            </div>

            <div class="portfolio-card-premium glass-effect-premium" data-variant="stout">
                <span class="beer-flavor-label">Blue Cobalt core</span>
                <div class="portfolio-img-wrapper">
                    <img src="./imgs/pístalky.png" alt="Píšťalky a doplňky">
                </div>
                <div class="portfolio-info">
                    <h4>Píšťalky [SIGNAL-03]</h4>
                    <p>Extrémně hlasité dvoukomorové píšťalky a doplňky pro nouzové signály a outdoor použití.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 4. FAQ Premium Accordions Section -->
    <section class="scroll-section faq-3d-section" id="section-faq">
        <div class="faq-title-box">
            <h2 class="section-title">Databáze FAQ</h2>
            <p class="faq-subtitle">Informační centrum o naší 3D tiskové manufaktuře.</p>
        </div>

        <div class="faq-wrapper-3d">
            <div class="faq-item-premium glass-effect-premium">
                <button class="faq-question-premium" onclick="togglePremiumFAQ(this)">
                    <span>Jaká je průměrná doba tisku zakázky?</span>
                    <span class="faq-trigger-icon">+</span>
                </button>
                <div class="faq-answer-premium">
                    <div class="faq-answer-inner">
                        Doba tisku se odvíjí od objemu a detailnosti modelu. Běžné gadgety a stojánky dokončujeme do 1–3 dnů. U větších zakázek nebo složitějších sestav se doba dodání pohybuje kolem 3–7 dnů. O každé fázi tisku Vás ihned informujeme.
                    </div>
                </div>
            </div>

            <div class="faq-item-premium glass-effect-premium">
                <button class="faq-question-premium" onclick="togglePremiumFAQ(this)">
                    <span>Podporujete tisk z vlastních 3D modelů?</span>
                    <span class="faq-trigger-icon">+</span>
                </button>
                <div class="faq-answer-premium">
                    <div class="faq-answer-inner">
                        Rozhodně. Zpracováváme soubory formátů STL, OBJ, 3MF, STEP a IGES. Stačí nám poslat data, my je bezplatně prověříme v simulátoru, navrhneme optimální výplň pro maximální pevnost a odešleme cenovou nabídku.
                    </div>
                </div>
            </div>

            <div class="faq-item-premium glass-effect-premium">
                <button class="faq-question-premium" onclick="togglePremiumFAQ(this)">
                    <span>Jaké materiály se hodí pro mechanické součástky?</span>
                    <span class="faq-trigger-icon">+</span>
                </button>
                <div class="faq-answer-premium">
                    <div class="faq-answer-inner">
                        Pro vysoké mechanické zatížení doporučujeme **PETG** (skvělá pružnost a rázová houževnatost) nebo **ABS/ASA** (vysoká teplotní stálost a UV odolnost). Flexibilní prvky tiskneme z **TPU** (pryžový elastický polymer). Pro designové modely využíváme **PLA**.
                    </div>
                </div>
            </div>

            <div class="faq-item-premium glass-effect-premium">
                <button class="faq-question-premium" onclick="togglePremiumFAQ(this)">
                    <span>Jak si mohu vyzvednout zboží v Kopřivnici?</span>
                    <span class="faq-trigger-icon">+</span>
                </button>
                <div class="faq-answer-premium">
                    <div class="faq-answer-inner">
                        Osobní předání je u nás v Kopřivnici zcela zdarma. Jakmile tiskárny dokončí práci a Váš model projde výstupní kontrolou, zašleme Vám zprávu a domluvíme si čas setkání. V košíku jednoduše zvolte osobní odběr Kopřivnice.
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer Area inside section -->
    <footer class="footer" role="contentinfo" style="margin-top: 5rem; z-index: 5; position: relative;">
        <div class="footer-grid">
            <div class="foot-col">© 2025 BEER 3D // CYBER-MANUFACTURING SYSTEM. VŠECHNA PRÁVA VYHRAZENA.</div>
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
