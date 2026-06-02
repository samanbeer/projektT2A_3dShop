<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$pageTitle = 'BEER 3D | Zakázková 3D tisková manufaktura';
require __DIR__ . '/partials/header.php';
?>

<!-- Temporary Cybernetic Diagnostics Overlay (Hidden for Production Redesign) -->
<div id="debug-log-overlay" style="position:fixed; top:70px; right:20px; background:rgba(10,10,10,0.92); color:#00ffcc; font-family:monospace; padding:15px; font-size:11px; z-index:999999; max-height:250px; overflow-y:auto; width:340px; border:1px solid #ff0055; border-radius:8px; box-shadow:0 0 15px rgba(255,0,85,0.4); pointer-events:auto; word-break:break-all; display:none;">
    <div style="font-weight:bold; border-bottom:1px solid #ff0055; padding-bottom:5px; margin-bottom:5px; color:#ff0055; display:flex; justify-content:between; align-items:center;">
        <span>CYBER DIACNOSTICS CONTROLLER</span>
        <button onclick="document.getElementById('debug-log-overlay').style.display='none'" style="background:none; border:none; color:#ff0055; cursor:pointer; font-weight:bold;">[X]</button>
    </div>
    <div id="debug-log-content" style="max-height:180px; overflow-y:auto;"></div>
</div>
<script>
    (function() {
        const content = document.getElementById('debug-log-content');
        function addLog(msg, color = '#00ffcc') {
            if (!content) return;
            const item = document.createElement('div');
            item.style.color = color;
            item.style.marginBottom = '4px';
            item.innerText = msg;
            content.appendChild(item);
            content.scrollTop = content.scrollHeight;
        }
        
        const _log = console.log;
        const _warn = console.warn;
        const _error = console.error;
        
        console.log = function(...args) {
            addLog(args.join(' '), '#00ffcc');
            _log.apply(console, args);
        };
        console.warn = function(...args) {
            addLog('[WARN] ' + args.join(' '), '#ffcc00');
            _warn.apply(console, args);
        };
        console.error = function(...args) {
            addLog('[ERROR] ' + args.join(' '), '#ff0055');
            _error.apply(console, args);
        };
        
        window.addEventListener('error', function(e) {
            addLog('[UNCAUGHT] ' + e.message + ' at ' + e.filename + ':' + e.lineno, '#ff0055');
        });
    })();
</script>

<!-- Load CDNs, Space Grotesk & Outfit typography, Warm styles -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="home_3d.css?v=<?php echo time(); ?>">
<script src="js/three.min.js"></script>
<script src="js/GLTFLoader.js"></script>
<script src="js/gsap.min.js"></script>
<script src="js/ScrollTrigger.min.js"></script>

<!-- Interactive 3D Loading Screen -->
<div class="loader-overlay-3d">
    <div class="loader-pint"></div>
    <div class="loader-text">Načítáme 3D zážitek...</div>
</div>

<!-- Three.js Canvas Element (Fixed backdrop) -->
<div class="canvas-3d-wrapper" id="canvas-3d-container">
    <canvas id="canvas-3d"></canvas>
</div>

<!-- Active Page Wrapper -->
<div class="page active" id="page-home" style="opacity: 1; visibility: visible;">
    
    <!-- Lepshee Cyberpunk Backgrounds & Glows -->
    <div class="cyber-grid-overlay"></div>
    <div class="interactive-glow-orb" id="glow-orb"></div>
    
    <!-- Dynamic warm glow backdrop -->
    <div class="bg-glow-warm"></div>

    <!-- 1. Hero 3D Section -->
    <section class="scroll-section hero-3d-section" id="section-hero">
        <div class="hero-3d-content">
            <span class="badge">3D TISK NA ZAKÁZKU</span>
            <h1>TISKNEME S<br><span class="gradient-text-gold">PRECIZNOSTÍ</span></h1>
            <p>Precizní zakázkový 3D tisk pro Vaše projekty i každodenní radost. Navrhujeme a tiskneme originální otvíráky, magnetické podtácky, designové stojany a vysoce odolné technické i designové díly na zakázku.</p>
            <div class="hero-3d-actions">
                <a href="materialy.php" class="btn-main-premium" aria-label="Zobrazit sekci s materiály">Naše materiály</a>
                <a href="produkty.php" class="btn-ghost-premium" aria-label="E-shop">E-shop</a>
            </div>
        </div>
    </section>

    <!-- 2. Features 3D Section -->
    <section class="scroll-section features-3d-section" id="section-features">
        <div class="features-grid-3d">
            <div class="feature-card-premium glass-effect-premium">
                <div class="cyber-corners cyber-corners-tl"></div>
                <div class="cyber-corners cyber-corners-tr"></div>
                <div class="cyber-corners cyber-corners-bl"></div>
                <div class="cyber-corners cyber-corners-br"></div>
                <div class="feature-icon-box">🎯</div>
                <div>
                    <h3>Precizní tisk 0.05mm</h3>
                    <p>Tiskneme na nejmodernějších tiskárnách Bambu Lab a Creality s extrémní rozměrovou přesností a dokonale hladkým povrchem vrstev.</p>
                </div>
            </div>
            
            <div class="feature-card-premium glass-effect-premium">
                <div class="cyber-corners cyber-corners-tl"></div>
                <div class="cyber-corners cyber-corners-tr"></div>
                <div class="cyber-corners cyber-corners-bl"></div>
                <div class="cyber-corners cyber-corners-br"></div>
                <div class="feature-icon-box">⚙️</div>
                <div>
                    <h3>Vlastní praktické doplňky</h3>
                    <p>Náš rukopis poznáte okamžitě. Vyvíjíme originální magnetické otvíráky, designové držáky a unikátní doplňky pro každodenní radost.</p>
                </div>
            </div>
            
            <div class="feature-card-premium glass-effect-premium">
                <div class="cyber-corners cyber-corners-tl"></div>
                <div class="cyber-corners cyber-corners-tr"></div>
                <div class="cyber-corners cyber-corners-bl"></div>
                <div class="cyber-corners cyber-corners-br"></div>
                <div class="feature-icon-box">🇨🇿</div>
                <div>
                    <h3>Manufaktura Kopřivnice</h3>
                    <p>Vše modelujeme a tiskneme přímo v Kopřivnici. Podporujeme místní nadšence, optimálně upravujeme STL data a nabízíme osobní předání zdarma.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 3. Portfolio Showroom Section (Interactive liquid changing) -->
    <section class="scroll-section portfolio-3d-section" id="section-portfolio">
        <div class="portfolio-header">
            <h2 class="section-title">Naše portfolio</h2>
            <p>Přejeďte kurzorem přes naše výrobky a sledujte, jak se v našem interaktivním 3D showroomu mění barvy a odlesky lahve reprezentující různé materiály!</p>
        </div>
        
        <div class="portfolio-3d-grid">
            <div class="portfolio-card-premium glass-effect-premium active" data-variant="pilsner">
                <div class="cyber-corners cyber-corners-tl"></div>
                <div class="cyber-corners cyber-corners-tr"></div>
                <div class="cyber-corners cyber-corners-bl"></div>
                <div class="cyber-corners cyber-corners-br"></div>
                <span class="beer-flavor-label">Zlatavý PETG</span>
                <div class="portfolio-img-wrapper">
                    <img src="./imgs/phone_holder.png" alt="Stojan na telefon">
                </div>
                <div class="portfolio-info">
                    <h4>Vlastní stojánek na telefon</h4>
                    <p>Robustní stolní stojánek s logem na míru, vytištěný z odolného PETG s karbonovým finišem.</p>
                </div>
            </div>

            <div class="portfolio-card-premium glass-effect-premium" data-variant="ipa">
                <div class="cyber-corners cyber-corners-tl"></div>
                <div class="cyber-corners cyber-corners-tr"></div>
                <div class="cyber-corners cyber-corners-bl"></div>
                <div class="cyber-corners cyber-corners-br"></div>
                <span class="beer-flavor-label">Oranžové PLA</span>
                <div class="portfolio-img-wrapper">
                    <img src="./imgs/pingpong_pálky.png" alt="Pingpongové pálky">
                </div>
                <div class="portfolio-info">
                    <h4>Pingpongové pálky</h4>
                    <p>Originální plně hratelné pálky na stolní tenis s odlehčeným včelím vzorem a perfektním gripem.</p>
                </div>
            </div>

            <div class="portfolio-card-premium glass-effect-premium" data-variant="stout">
                <div class="cyber-corners cyber-corners-tl"></div>
                <div class="cyber-corners cyber-corners-tr"></div>
                <div class="cyber-corners cyber-corners-bl"></div>
                <div class="cyber-corners cyber-corners-br"></div>
                <span class="beer-flavor-label">Karbonové PETG</span>
                <div class="portfolio-img-wrapper">
                    <img src="./imgs/pístalky.png" alt="Píšťalky a doplňky">
                </div>
                <div class="portfolio-info">
                    <h4>Hlasité píšťalky a gadgety</h4>
                    <p>Extrémně výkonné dvoukomorové píšťalky a doplňky pro nouzové signály a outdoor aktivity.</p>
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
                    <span>Kolik času zabere tisk zakázky?</span>
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
                    <span>Tisknete z vlastních 3D modelů?</span>
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
                    <span>Které materiály se hodí pro funkční součástky?</span>
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
                    <span>Jak funguje osobní odběr v Kopřivnici?</span>
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
            <div class="foot-col">© 2025 BEER 3D. Vytvořeno s maximální precizností. Všechna práva vyhrazena.</div>
        </div>
    </footer>
</div>

<!-- Load dynamic 3D experience logic -->
<script src="home_3d.js?v=<?php echo time(); ?>"></script>

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
