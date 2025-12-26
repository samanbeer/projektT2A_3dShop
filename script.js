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
    try {
        const response = await fetch('filamenty.txt');
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

        renderTabs();
    } catch (e) { console.error("Data load failed:", e); }
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
        
        // Vzorník
        swatchBox.innerHTML += `
            <div class="swatch-item">
                <div class="circle" style="background-color: ${hex}"></div>
                <span>${item.color}</span>
            </div>
        `;

        // Skladová dostupnost s novými třídami pro barvy
        let statusClass = 'status-ok'; 
        if (item.grams < 500) statusClass = 'status-low'; 
        if (item.grams < 150) statusClass = 'status-critical'; 

        stockBox.innerHTML += `
            <div class="stock-item">
                <span>${item.color}</span>
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
    } else {
        track.style.transform = 'translateX(-100vw)';
        document.getElementById('nav-materials').classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', loadMaterials);