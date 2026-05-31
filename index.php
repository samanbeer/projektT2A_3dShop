<?php
declare(strict_types=1);
require_once __DIR__ . '/src/bootstrap.php';

$pageTitle = 'BEER 3D | Tiskneme s chutí';
require __DIR__ . '/partials/header.php';
?>
<section class="page active" id="page-home" style="opacity: 1; visibility: visible;">
    <div class="hero-card">
        <div class="hero-content">
            <span class="badge">3D TISK & PIVO</span>
            <h1>TISKNEME S<br><span class="gradient-text">CHUTÍ</span></h1>
            <p>Když se potká precizní 3D tisk s láskou k chmelu. Zakázkový tisk, otvíráky, podtácky a gadgety.</p>
            <div class="hero-actions">
                <a href="materialy.php" class="btn-main" aria-label="Zobrazit sekci s materiály">Naše čepované materiály</a>
                <a href="recenze/recenze.php" class="btn-ghost" aria-label="Zobrazit naše reference">Recenze</a>
            </div>
        </div>
        <div class="hero-img-box">
            <img src="./imgs/hero_image2.png" alt="3D Print Detail">
        </div>
    </div>

    <div class="portfolio-section">
        <h2 class="section-title">Naše výtvory</h2>
        <div class="portfolio-grid">
            <div class="portfolio-item glass-effect"><img src="./imgs/phone_holder.png" alt="Vlastní stojan"></div>
            <div class="portfolio-item glass-effect"><img src="./imgs/pingpong_pálky.png" alt="Pingpongové pálky"></div>
            <div class="portfolio-item glass-effect"><img src="./imgs/pístalky.png" alt="Píšťalky a doplňky"></div>
        </div>
    </div>

    <div class="faq-section">
        <h2 class="section-title">Často kladené otázky</h2>
        <p class="faq-subtitle">Máte dotazy? Jsme tu pro vás!</p>

        <div class="faq-container">
            <div class="faq-item">
                <button class="faq-question" onclick="toggleFAQ(this)">
                    <span>Kolik trvá výroba zakázkového tisku?</span>
                    <span class="faq-icon">+</span>
                </button>
                <div class="faq-answer">
                    <p>Doba výroby závisí na složitosti a velikosti objektu. Běžně se pohybuje mezi 1-3 dny pro menší předměty a 3-7 dní pro větší či složitější projekty. Po konzultaci vám sdělíme přesnou dobu realizace.</p>
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" onclick="toggleFAQ(this)">
                    <span>Můžu dodat vlastní 3D model?</span>
                    <span class="faq-icon">+</span>
                </button>
                <div class="faq-answer">
                    <p>Samozřejmě! Podporujeme formáty STL, OBJ a 3MF. Pokud máte vlastní návrh, napište nám a společně probereme technické detaily a možnosti tisku. Rádi vám také poradíme s optimalizací modelu pro 3D tisk.</p>
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" onclick="toggleFAQ(this)">
                    <span>Jaké materiály používáte a jaká je jejich pevnost?</span>
                    <span class="faq-icon">+</span>
                </button>
                <div class="faq-answer">
                    <p>Používáme kvalitní filamenty: <strong>PLA</strong> (ekologický, ideální pro dekorace), <strong>PETG</strong> (odolný, vhodný pro funkční díly), <strong>ABS</strong> (průmyslový, vysoká tepelná odolnost) a <strong>TPU</strong> (flexibilní). Každý materiál má své vlastnosti - rádi vám pomůžeme vybrat ten správný pro váš projekt.</p>
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" onclick="toggleFAQ(this)">
                    <span>Jak funguje doprava a jaké jsou náklady?</span>
                    <span class="faq-icon">+</span>
                </button>
                <div class="faq-answer">
                    <p>Nabízíme osobní odběr nebo dopravu prostřednictvím České pošty či Zásilkovny. Cena dopravy se pohybuje od 69 Kč (Zásilkovna) do 89 Kč (Česká pošta). Při objednávce nad 15 000 Kč je doprava ZDARMA! 🍺</p>
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" onclick="toggleFAQ(this)">
                    <span>Nabízíte i kompletní návrh modelu?</span>
                    <span class="faq-icon">+</span>
                </button>
                <div class="faq-answer">
                    <p>Ano! Pokud máte jen představu a potřebujete kompletní 3D návrh, kontaktujte nás. Rádi vám pomůžeme navrhnout a vymodelovat váš projekt. Cena za modelování se domlouvá individuálně podle složitosti.</p>
                </div>
            </div>

            <div class="faq-item">
                <button class="faq-question" onclick="toggleFAQ(this)">
                    <span>Jak vás mohu kontaktovat?</span>
                    <span class="faq-icon">+</span>
                </button>
                <div class="faq-answer">
                    <p>Nejrychlejší je napsat nám přes formulář v sekci Recenze, nebo nás kontaktujte emailem. Odpovídáme obvykle do 24 hodin. Pro urgentní dotazy nás můžete zastihnout také na sociálních sítích.</p>
                </div>
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
    function toggleFAQ(button) {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });

        // Toggle current FAQ item
        faqItem.classList.toggle('active', !isActive);
    }
</script>
<?php
require __DIR__ . '/partials/footer.php';
?>
