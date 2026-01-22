# 🍺 BEER 3D - 3D Print Eshop

Moderní eshop s 3D tiskem a pivní tématikou, postavený na Firebase a Stripe.

---

## 📁 Struktura projektu

```
HTML_3d_shop/
├── 📄 index.html           # Hlavní stránka (domů, materiály, produkty)
├── 📄 style.css            # Hlavní styly
├── 📄 script.js            # Hlavní JavaScript (košík, navigace, produkty)
├── 📄 products_database.json  # Databáze produktů
├── 📄 filamenty.txt        # Databáze filamentů a skladových zásob
├── 📄 favicon.png          # Ikona webu
│
├── 📁 imgs/                # Obrázky produktů
│   ├── hero_image2.png
│   ├── phone_holder.png
│   ├── pingpong_pálky.png
│   └── pístalky.png
│
├── 📁 recenze/             # Stránka recenzí
│   ├── recenze.html
│   └── recenze.css
│
├── 📁 platba/              # Platební systém (Stripe)
│   ├── checkout.html       # Platební stránka
│   ├── checkout.js         # Stripe checkout logika
│   ├── success.html        # Úspěšná platba
│   ├── success.js
│   ├── cancel.html         # Zrušená platba
│   ├── cancel.js
│   ├── platba.css          # Styly platebních stránek
│   ├── README.md           # Dokumentace platebního systému
│   └── .env.example        # Template pro API klíče
│
├── 📁 functions/           # Firebase Cloud Functions (backend)
│   ├── index.js            # Stripe payment endpoints
│   ├── package.json        # Node.js dependencies
│   ├── SETUP.md            # Návod na setup funkcí
│   └── .gitignore
│
├── 📁 404_page/            # Chybová stránka 404
│   ├── 404.html
│   └── 404.css
│
├── 📁 files/               # Pomocné soubory (nepoužívané v produkci)
│
├── 📄 firebase.json        # Firebase konfigurace
├── 📄 .gitignore           # Git ignore pravidla
└── 📄 README.md            # Tento soubor
```

---

## 🚀 Technologie

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Firebase Cloud Functions (Node.js)
- **Databáze:** Firebase Firestore
- **Platby:** Stripe
- **Hosting:** Firebase Hosting (nebo jiný static hosting)

---

## 🔧 Jak spustit lokálně

### 1. Otevřete projekt v prohlížeči

Jednoduše otevřete `index.html` v prohlížeči:
- Pravý klik na `index.html` → Open with → Chrome/Firefox

### 2. Nebo použijte lokální server

Pokud potřebujete HTTP server (kvůli CORS):

**Python:**
```bash
python -m http.server 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

Pak otevřete: http://localhost:8000

---

## 💳 Platební systém (Stripe)

### Stav implementace:
- ✅ Frontend platebních stránek
- ✅ Stripe integrace (klientská část)
- ✅ Firebase Functions (backend kód)
- ⏳ Potřeba deployment Functions

### Setup:
1. Přidejte Stripe API klíče (viz `/platba/README.md`)
2. Pro plně funkční platby: Nastavte Firebase Functions (viz `/functions/SETUP.md`)

---

## 📊 Firebase Firestore Kolekce

### `reviews` (recenze)
```javascript
{
  name: "Jan Novák",
  text: "Skvělé!",
  stars: 5,
  photoUrl: "...",
  timestamp: Date
}
```

### `orders` (objednávky)
```javascript
{
  customerEmail: "email@example.com",
  customerName: "Jan Novák",
  items: [...],
  totalAmount: 1234,
  status: "pending|paid|failed",
  paymentIntentId: "pi_...",
  createdAt: Date
}
```

---

## 🔐 Bezpečnost

### Citlivé údaje (NEPŘIDÁVAT DO GITU):
- ❌ Stripe Secret Key (`sk_test_...` nebo `sk_live_...`)
- ❌ Firebase Admin SDK private key
- ❌ Webhook secrets

### Veřejné údaje (OK dát do Gitu):
- ✅ Stripe Publishable Key (`pk_test_...` nebo `pk_live_...`)
- ✅ Firebase client config (apiKey, projectId, atd.)

---

## 📝 Soubory k vymazání před produkčním deployem

Tyto soubory jsou jen pro vývoj a měly by se vymazat:
- `server.py` - lokální Python server (nepotřebný)
- `start_Serveru.txt` - návod na Python server
- `nohup.out` - log soubor z Python serveru
- `files/` - pomocná složka s nepoužívanými soubory

---

## 🌐 Deployment na Firebase Hosting

```bash
# 1. Přihlaste se
firebase login

# 2. Inicializujte hosting
firebase init hosting

# 3. Deploy
firebase deploy --only hosting
```

---

## 🆘 Časté problémy

### Produkty se nenačítají
- Zkontrolujte, že `products_database.json` existuje
- Otevřete DevTools Console pro chybové hlášky

### Platby nefungují
- Zkontrolujte, že máte nastavený Stripe Publishable Key v `checkout.js`
- Pro plné fungování potřebujete Firebase Functions

### CORS chyby
- Používejte lokální HTTP server místo otevření souboru přímo

---

## 👨‍💻 Autor

**Beer 3D**  
3D tisk s láskou k chmelu 🍺

---

## 📄 Licence

© 2025 Beer 3D. Všechna práva vyhrazena.
