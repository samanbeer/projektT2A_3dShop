/* --- DATA: SEZNAM FILAMENTŮ --- */
// Zde si upravuj své zásoby.
// hexColor: barva ikonky špulky
// percent: kolik zbývá (100 = plná, 10 = skoro prázdná)
const filaments = [
    { 
        type: "PLA", 
        name: "Galaxy Black", 
        hexColor: "#333333", 
        percent: 90, 
        tags: ["Základní", "Matný", "Detailní"] 
    },
    { 
        type: "PETG", 
        name: "Prusa Orange", 
        hexColor: "#fa6831", 
        percent: 45, 
        tags: ["Odolné", "Flexibilní", "UV Stálé"] 
    },
    { 
        type: "PLA", 
        name: "Neon Blue", 
        hexColor: "#00f2ff", 
        percent: 15, 
        tags: ["Estetické", "Svítící"] 
    },
    { 
        type: "TPU", 
        name: "Flexi Red", 
        hexColor: "#e74c3c", 
        percent: 80, 
        tags: ["Guma", "Tlumící nárazy"] 
    },
    { 
        type: "ASA", 
        name: "Industrial Grey", 
        hexColor: "#7f8c8d", 
        percent: 60, 
        tags: ["Venkovní", "Teplotně odolné"] 
    }
];

/* --- GENERÁTOR KARET --- */
const container = document.getElementById('materials-container');

if (container) {
    filaments.forEach((fil, index) => {
        // Určení barvy progress baru
        let progressColor = "var(--status-ok)";
        if (fil.percent < 50) progressColor = "var(--status-mid)";
        if (fil.percent < 20) progressColor = "var(--status-low)";

        // Vytvoření HTML tagů
        const tagsHtml = fil.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        const card = document.createElement('div');
        card.className = 'material-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 100); // Kaskádový efekt

        card.innerHTML = `
            <div class="mat-header">
                <i class="fa-solid fa-dharmachakra spool-icon" style="color: ${fil.hexColor}; text-shadow: 0 0 10px ${fil.hexColor}66;"></i>
                <div class="mat-info">
                    <h3>${fil.type}</h3>
                    <p>${fil.name}</p>
                </div>
            </div>
            
            <div class="progress-wrapper">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:5px;">
                    <span style="color: var(--text-muted)">Dostupnost</span>
                    <span>${fil.percent}%</span>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill" style="width: ${fil.percent}%; background: ${progressColor};"></div>
                </div>
            </div>

            <div class="mat-tags">
                ${tagsHtml}
            </div>
        `;

        container.appendChild(card);
    });
}

/* --- THEME TOGGLE (Volitelné) --- */
// Kód pro přepínání témat zůstává stejný, pokud ho chceš zachovat
// i pro ruční přepnutí na světlý režim.
const themeToggle = document.getElementById('theme-toggle');
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        alert("Momentálně je design optimalizován pro Dark Mode, ale funkčnost zde můžeš později dodělat!");
    });
}