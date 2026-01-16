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

let productsData = [];
let currentFilter = 'all';

function showPage(id) {
    const track = document.getElementById('pages-track');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    if (id === 'home') {
        track.style.transform = 'translateX(0)';
        document.getElementById('nav-home').classList.add('active');
        const homePage = document.getElementById('page-home');
        homePage.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'products') {
        track.style.transform = 'translateX(-100vw)';
        document.getElementById('nav-products').classList.add('active');
        const productsPage = document.getElementById('page-products');
        productsPage.scrollTo({ top: 0, behavior: 'smooth' });
        if (productsData.length === 0) {
            loadProducts();
        }
    } else if (id === 'materials') {
        track.style.transform = 'translateX(-200vw)';
        document.getElementById('nav-materials').classList.add('active');
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

// Products functionality
async function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '<div class="loading">Načítání produktů...</div>';
    
    try {
        const response = await fetch('products_database.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        productsData = await response.json();
        renderProducts(productsData);
    } catch (e) {
        console.error("Products load failed:", e);
        if (productsGrid) {
            productsGrid.innerHTML = '<div class="error-message">Nepodařilo se načíst produkty. Zkuste to prosím později.</div>';
        }
    }
}

function renderProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = `product-card`;
        card.style.animationDelay = `${index * 0.1}s`;
        card.setAttribute('data-category', product.category);
        card.setAttribute('data-instock', product.inStock);
        
        const categoryName = {
            'filament': 'Filament',
            'printer': 'Tiskárna',
            'custom': 'Vlastní výrobek'
        }[product.category] || product.category;
        
        const soldOutClass = !product.inStock ? 'sold-out' : '';
        const soldOutBadge = !product.inStock ? '<div class="sold-out-badge">Vyprodáno</div>' : '';
        
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='./imgs/hero_image2.png'">
                ${soldOutBadge}
            </div>
            <div class="product-info">
                <div class="product-category">${categoryName}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">${product.cost.toLocaleString('cs-CZ')}<span class="price-unit"> Kč</span></div>
                    ${product.inStock ? '<button class="product-btn-quick">Zobrazit</button>' : '<div class="product-status-text">Vyprodáno</div>'}
                </div>
            </div>
        `;
        
        // Store product data for modal access
        card.setAttribute('data-product-id', product.id);
        
        if (product.inStock) {
            card.classList.add('product-available');
            card.onclick = () => openModal(product);
            const quickBtn = card.querySelector('.product-btn-quick');
            if (quickBtn) {
                quickBtn.onclick = (e) => {
                    e.stopPropagation();
                    openModal(product);
                };
            }
        } else {
            card.classList.add('product-sold-out');
        }
        productsGrid.appendChild(card);
    });
    
    // Apply current filter
    if (currentFilter !== 'all') {
        filterProducts(currentFilter);
    }
}

function filterProducts(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    document.querySelectorAll('.product-card').forEach((card, index) => {
        const productCategory = card.getAttribute('data-category');
        
        if (category === 'all' || productCategory === category) {
            card.classList.remove('hidden');
            card.style.animationDelay = `${index * 0.05}s`;
        } else {
            card.classList.add('hidden');
        }
    });
}

// Modal functionality
function openModal(product) {
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;
    
    const categoryName = {
        'filament': 'Filament',
        'printer': 'Tiskárna',
        'custom': 'Vlastní výrobek'
    }[product.category] || product.category;
    
    const stockStatus = product.inStock 
        ? '<div class="stock-badge in-stock"><span class="stock-dot"></span> Skladem</div>' 
        : '<div class="stock-badge out-of-stock"><span class="stock-dot"></span> Vyprodáno</div>';
    
    modalContent.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="modal-product-image" onerror="this.src='./imgs/hero_image2.png'">
        <div class="modal-product-header">
            <div class="modal-product-category">${categoryName}</div>
            ${stockStatus}
        </div>
        <h2 class="modal-product-name">${product.name}</h2>
        <div class="modal-product-price">${product.cost.toLocaleString('cs-CZ')}<span class="price-unit"> Kč</span></div>
        <p class="modal-product-description">${product.description}</p>
        <div class="modal-actions">
            ${product.inStock 
                ? `<button class="modal-btn modal-btn-primary" onclick="addToCart('${product.id}')">Přidat do košíku</button>` 
                : `<button class="modal-btn modal-btn-disabled" disabled>Vyprodáno</button>`}
            <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Zavřít</button>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(event) {
    if (event && event.target === event.currentTarget || !event) {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

function addToCart(productId) {
    // Placeholder for cart functionality
    alert(`Produkt ${productId} byl přidán do košíku!`);
    // TODO: Implement actual cart functionality
}

document.addEventListener('DOMContentLoaded', () => {
    loadMaterials();
    initBackToTop();
    initKeyboardNavigation();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('product-modal');
        if (modal && modal.classList.contains('active')) {
            closeModal();
        }
    }
});