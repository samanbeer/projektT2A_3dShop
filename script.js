/* --- 1. PŘEPÍNÁNÍ TÉMAT (DARK/LIGHT) --- */
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Zkusíme načíst uložené téma z prohlížeče, jinak dáme light
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Uložíme volbu uživatele
});

/* --- 2. GENERÁTOR TABULKY FILAMENTŮ --- */

// Tady upravuj seznam svých filamentů:
const filaments = [
    { type: "PLA", color: "Galaxy Black", amount: "high", label: "> 750g" },
    { type: "PLA", color: "Prusa Orange", amount: "mid", label: "> 500g" },
    { type: "PETG", color: "Transparentní", amount: "low", label: "< 200g" },
    { type: "TPU", color: "Flexibilní Červená", amount: "high", label: "> 750g" },
    { type: "ASA", color: "Šedá", amount: "mid", label: "> 400g" }
];

const tableBody = document.getElementById('filament-list');

// Funkce se spustí pouze pokud jsme na stránce s tabulkou
if (tableBody) {
    filaments.forEach(fil => {
        // Vytvoříme řádek
        const row = document.createElement('tr');
        
        // Vložíme obsah pomocí HTML šablony
        row.innerHTML = `
            <td><strong>${fil.type}</strong></td>
            <td>${fil.color}</td>
            <td><span class="status-badge ${fil.amount}">${fil.label}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}