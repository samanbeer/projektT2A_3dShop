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

---


## 💳 Platební systém (Stripe)

### Stav implementace:
- ✅ Frontend platebních stránek
- ✅ Stripe integrace (klientská část)
- ✅ Firebase Functions (backend kód)
- ⏳ Potřeba deployment Functions



## 📝 Soubory k vymazání před produkčním deployem

Tyto soubory jsou jen pro vývoj a měly by se vymazat:
- `server.py` - lokální Python server (nepotřebný)
- `start_Serveru.txt` - návod na Python server
- `nohup.out` - log soubor z Python serveru
- `files/` - pomocná složka s nepoužívanými soubory

---

## 👨‍💻 Autor

**Beer 3D**  
3D tisk s láskou k chmelu 🍺

---

## 📄 Licence

© 2025 Beer 3D. Všechna práva vyhrazena.
