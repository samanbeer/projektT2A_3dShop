let groupedMaterials = {};

const materialInfo = {
    'PLA': 'Ekologický materiál, rozložitelný skoro jako pěna na pivu. Ideální pro designové kousky, jako jsou podtácky nebo otvíráky.',
    'PETG': 'Pevný a houževnatý, skoro jako sládkova trpělivost. Skvělý na funkční díly, co musí vydržet i bouřlivější oslavu.',
    'ABS': 'Průmyslový standard pro díly, co musí vydržet teplo od motoru... nebo od grilu. Pro opravdové fajnšmekry.',
    'TPU': 'Flexibilní jako harmonikář po desátém kousku. Ideální na těsnění k pípě nebo nerozbitné "půllitry" na festival.'
};

const colorMap = {
    'Pěna (Bílá)': '#ffffff', 'Pěna (Bíla)': '#ffffff', 'Stout (Černá)': '#121212', 
    'IPA (Oranžová)': '#ff6700', 'Borůvkový Ale (Modrá)': '#0055ff', 'Red Ale (Červená)': '#ff0000',
    'Golem (Šedá)': '#808080', 'Limetkový Radler (Neon)': '#00f2ff'
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

    // Add header for the stock list
    stockBox.innerHTML = `
        <div class="stock-item stock-header">
            <span>Barva</span>
            <span>Dostupnost</span>
        </div>
    `;

    groupedMaterials[type].forEach(item => {
        const originalColor = item.color;
        const newColorKey = Object.keys(colorMap).find(key => key.includes(`(${originalColor})`)) || Object.keys(colorMap).find(key => key.toLowerCase().includes(originalColor.toLowerCase()));
        const hex = newColorKey ? colorMap[newColorKey] : '#444';
        const displayName = newColorKey || originalColor;
        
        // Skladová dostupnost s malým barevným kroužkem vedle názvu
        let statusClass = 'status-ok'; 
        if (item.grams < 500) statusClass = 'status-low'; 
        if (item.grams < 150) statusClass = 'status-critical'; 
        stockBox.innerHTML += `
            <div class="stock-item">
                <span class="stock-color-name">
                    <span class="color-circle-small" style="background-color: ${hex}"></span>
                    ${displayName}
                </span>
                <span>${formatGrams(item.grams)} <span class="dot ${statusClass}"></span></span>
            </div>
        `;
    });
}

// Global variable for products data
let productsData = [];
let currentFilter = 'all';

// URL Routing and Navigation
function handleRouting() {
    // Get hash without '#'. If empty, default to 'home'
    const hash = window.location.hash.replace('#', '') || 'home';
    const validPages = ['home', 'materials', 'products'];
    
    // Map URL aliases to internal page IDs
    const routeMap = {
        'domu': 'home',
        'materialy': 'materials',
        'produkty': 'products'
    };
    
    let pageId = validPages.includes(hash) ? hash : routeMap[hash];
    

    if (!pageId) {
        // Check if we have a 404 page handling logic or redirect
        if (hash !== '') {
             window.location.href = '404_page/404.html';
             return;
        }
        pageId = 'home';
    }
    
    showPage(pageId, false);
}

function showPage(id, updateHistory = true) {
    const track = document.getElementById('pages-track');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const navLink = document.getElementById(`nav-${id}`);
    if (navLink) navLink.classList.add('active');
    const pageIndex = ['home', 'materials', 'products'].indexOf(id);
    
    if (pageIndex >= 0) {
        track.style.transform = `translateX(-${pageIndex * 100}vw)`;
        
        // Scroll top of the new page
        const newPage = document.getElementById(`page-${id}`);
        if (newPage) {
            newPage.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Load data if needed
        if (id === 'products' && (!productsData || productsData.length === 0)) {
            loadProducts();
        }
        
        // Update URL hash if requested (e.g. clicked button)
        if (updateHistory) {
            // Map internal IDs back to nice URL aliases
            const urlMap = {
                'home': 'domu',
                'materials': 'materialy',
                'products': 'produkty'
            };
            
            const newHash = urlMap[id] || id;
            
            // Only update if changed to avoid loops
            if (window.location.hash.replace('#', '') !== newHash) {
                // Using history.pushState or replacing hash.
                // Setting hash triggers 'hashchange', calling handleRouting again.
                // handleRouting will see the ID matches current page and do nothing (efficient).
                window.location.hash = newHash;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMaterials();
    initBackToTop();
    initKeyboardNavigation();
    
    // Initialize routing
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
});

// Back to top button functionality
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'Zpět nahoru');
    document.body.appendChild(backToTopBtn);

    const pages = Array.from(document.querySelectorAll('.page'));
    
    // Helper to get current active page index based on hash
    function getActivePageIndex() {
         const hash = window.location.hash.replace('#', '') || 'home';
         // Map aliases to IDs to find index
         const routeMap = {
            'domu': 'home',
            'materialy': 'materials',
            'produkty': 'products'
        };
        const id = routeMap[hash] || hash; 
        return ['home', 'materials', 'products'].indexOf(id);
    }

    backToTopBtn.onclick = () => {
        const activeIndex = getActivePageIndex();
        if (pages[activeIndex]) {
            pages[activeIndex].scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Add scroll listeners to all pages
    pages.forEach((page, index) => {
        page.addEventListener('scroll', () => {
            // Only show button if this page is the currently active one
            if (index === getActivePageIndex()) {
                if (page.scrollTop > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
        }
        });
    });
    
    // Re-check button visibility on navigation change
    window.addEventListener('hashchange', () => {
        backToTopBtn.classList.remove('visible'); // Hide initially on change
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
    
    // If data is already loaded, render immediately
    if (productsData && productsData.length > 0) {
        renderProducts(productsData);
        return;
    }
    
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
    // Add click listeners to nav links for manual navigation updates
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Get the ID from the href (e.g. #home -> home) or map from alias
            // Actually, the links in HTML should probably use the aliases now: href="#materialy"
            // Let's assume the HTML links are updated to use aliases or IDs. 
            // The routing system handles the hash change.
            const targetHash = link.getAttribute('href');
            window.location.hash = targetHash;
        });
    });
    
    // Initialize everything
    handleRouting();
    window.addEventListener('hashchange', handleRouting);

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