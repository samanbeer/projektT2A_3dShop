let groupedMaterials = {};

const materialInfo = {
    'PLA': 'Ekologický materiál z kukuřičného škrobu. Nabízí skvělý detail, matný povrch a minimální tepelné smrštění. Ideální pro designové kousky a prototypy.',
    'PETG': 'Pevný a odolný materiál s vysokou houževnatostí. Chemicky odolný a vhodný pro funkční díly v interiéru i exteriéru. Skvělý kompromis mezi PLA a ABS.',
    'ABS': 'Průmyslový standard pro mechanicky namáhané díly. Vysoká teplotní odolnost a pevnost. Vyžaduje zkušenosti při tisku.',
    'TPU': 'Flexibilní elastomer připomínající gumu. Vynikající pro těsnění, pouzdra, tlumící prvky a ohebné části.'
};

const colorMap = {
    'Bílá': '#ffffff', 'Bíla': '#ffffff', 'Černá': '#121212', 
    'Oranžová': '#ff6700', 'Modrá': '#0055ff', 'Červená': '#ff0000',
    'Šedá': '#808080', 'Neon Blue': '#00f2ff'
};

function formatGrams(g) {
    const val = parseInt(g);
    if (val >= 2000) return "> 2kg";
    if (val > 1000) return "> 1kg";
    if (val > 500) return "< 1kg";
    if (val > 250) return "< 500g";
    if (val > 100) return "< 250g";
    return "< 100g";
}

async function loadMaterials() {
    const detailTitle = document.getElementById('detail-title');
    const detailDesc = document.getElementById('detail-desc');
    const swatchBox = document.getElementById('color-swatches');
    const stockBox = document.getElementById('availability-list');
    const container = document.getElementById('material-tabs');
    
    // Show loading state
    container.innerHTML = '';
    detailTitle.innerText = 'Načítání...';
    detailDesc.innerText = 'Materialy se načítají...';
    swatchBox.innerHTML = '<div class="loading">Načítání vzorků</div>';
    stockBox.innerHTML = '<div class="loading">Načítání dostupnosti</div>';
    
    try {
        const response = await fetch('filamenty.txt');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        groupedMaterials = {};
        lines.forEach(line => {
            if(!line.trim() || !line.includes('|')) return;
            const parts = line.split('|').map(s => s.trim());
            const type = parts[0];
            const color = parts[1];
            const grams = parts[2] ? parseInt(parts[2]) : 0;
            
            if (!groupedMaterials[type]) groupedMaterials[type] = [];
            groupedMaterials[type].push({ color, grams });
        });

        if (Object.keys(groupedMaterials).length === 0) {
            throw new Error('Žádná data nenalezena');
        }

        renderTabs();
    } catch (e) {
        console.error("Data load failed:", e);
        container.innerHTML = '';
        detailTitle.innerText = 'Chyba';
        detailDesc.innerHTML = '<div class="error-message">Nepodařilo se načíst materiály. Zkuste to prosím později.</div>';
        swatchBox.innerHTML = '';
        stockBox.innerHTML = '';
    }
}

function renderTabs() {
    const container = document.getElementById('material-tabs');
    container.innerHTML = '';
    
    Object.keys(groupedMaterials).forEach((type, index) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
        btn.innerHTML = `<span>${type}</span>`;
        btn.onclick = () => selectMaterial(type, btn);
        container.appendChild(btn);
        if (index === 0) selectMaterial(type, btn);
    });
}

function selectMaterial(type, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('detail-title').innerText = type;
    document.getElementById('detail-desc').innerText = materialInfo[type] || 'Vysoce kvalitní tiskový materiál pro vaše projekty.';

    const swatchBox = document.getElementById('color-swatches');
    const stockBox = document.getElementById('availability-list');
    swatchBox.innerHTML = '';
    stockBox.innerHTML = '';

    groupedMaterials[type].forEach(item => {
        const hex = colorMap[item.color] || '#444';
        
        // Skladová dostupnost s malým barevným kroužkem vedle názvu
        let statusClass = 'status-ok'; 
        if (item.grams < 500) statusClass = 'status-low'; 
        if (item.grams < 150) statusClass = 'status-critical'; 

        stockBox.innerHTML += `
            <div class="stock-item">
                <span class="stock-color-name">
                    ${item.color}
                    <span class="color-circle-small" style="background-color: ${hex}"></span>
                </span>
                <span>${formatGrams(item.grams)} <span class="dot ${statusClass}"></span></span>
            </div>
        `;
    });
}

function showPage(id) {
    const track = document.getElementById('pages-track');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    if (id === 'home') {
        track.style.transform = 'translateX(0)';
        document.getElementById('nav-home').classList.add('active');
        // Scroll to top smoothly
        const homePage = document.getElementById('page-home');
        homePage.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        track.style.transform = 'translateX(-100vw)';
        document.getElementById('nav-materials').classList.add('active');
        // Scroll to top smoothly
        const materialsPage = document.getElementById('page-materials');
        materialsPage.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Back to top button functionality
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'Zpět nahoru');
    backToTopBtn.onclick = () => {
        const activePage = document.querySelector('.page:not([style*="display: none"])') || 
                          (document.getElementById('nav-home').classList.contains('active') 
                           ? document.getElementById('page-home') 
                           : document.getElementById('page-materials'));
        activePage.scrollTo({ top: 0, behavior: 'smooth' });
    };
    document.body.appendChild(backToTopBtn);

    // Show/hide button based on scroll position
    const pages = [document.getElementById('page-home'), document.getElementById('page-materials')];
    pages.forEach(page => {
        if (page) {
            page.addEventListener('scroll', () => {
                if (page.scrollTop > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            });
        }
    });
}

// Keyboard navigation support
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Escape key to go back to home
        if (e.key === 'Escape' && document.getElementById('nav-materials').classList.contains('active')) {
            showPage('home');
        }
        // Number keys for material tabs (1-4)
        if (document.getElementById('nav-materials').classList.contains('active')) {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            const num = parseInt(e.key);
            if (num >= 1 && num <= tabs.length) {
                tabs[num - 1].click();
            }
        }
    });

    // Improve tab navigation for material buttons
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && e.shiftKey === false) {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('tab-btn')) {
                // Ensure smooth focus transitions
                setTimeout(() => {
                    activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 0);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadMaterials();
    initBackToTop();
    initKeyboardNavigation();
});