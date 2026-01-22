# Stripe Payment Integration Setup Guide

## 📋 Co jsem vytvořil

Vytvořil jsem kompletní platební systém ve složce `/platba`:

### Soubory:
- ✅ `checkout.html` - Platební stránka s formulářem
- ✅ `success.html` - Stránka úspěšné platby
- ✅ `cancel.html` - Stránka zrušené/neúspěšné platby
- ✅ `platba.css` - Styly pro všechny platební stránky
- ✅ `checkout.js` - Logika pro zpracování platby
- ✅ `success.js` - Logika pro success stránku
- ✅ `cancel.js` - Logika pro cancel stránku
- ✅ `.env.example` - Template pro API klíče

### Aktualizované soubory:
- ✅ `index.html` - Tlačítko "Pokračovat k objednávce" přesměruje na checkout
- ✅ `script.js` - Přidána funkce `proceedToCheckout()`

## 🔑 Jak nastavit Stripe API klíče

### Krok 1: Získejte klíče ze Stripe
1. Přihlaste se na https://dashboard.stripe.com/
2. Klikněte na "Developers" → "API keys"
3. Zkopírujte:
   - **Publishable key** (`pk_test_...`)
   - **Secret key** (`sk_test_...`)

### Krok 2: Nastavte klíč ve frontendové části
Otevřete soubor [platba/checkout.js](file:///z:/Documents/HTML_3d_shop/platba/checkout.js) a na **řádku 22** nahraďte:

```javascript
const STRIPE_PUBLISHABLE_KEY = "pk_test_YOUR_KEY_HERE"; // TODO: Nahraďte svým klíčem!
```

Vaším skutečným klíčem (začíná `pk_test_`).

## ⚠️ DŮLEŽITÉ - Chybějící Backend

**Aktuální stav:** Frontend je hotový, ale pro plně funkční platby potřebujete ještě **backend** (Firebase Cloud Functions).

### Co funguje teď:
- ✅ Košík a přidávání produktů
- ✅ Přesměrování na checkout stránku
- ✅ UI platebního formuláře
- ✅ Ukládání objednávek do Firestore

### Co NEFUNGUJE bez backendu:
- ❌ Skutečné zpracování platby (potřebujete Firebase Function)
- ❌ Ověření platby serverem
- ❌ Webhook od Stripe

## 🚀 Další kroky

### Varianta A: Jednoduchá (pro testování UI)
Můžete si prohlédnout stránky a UI, ale platby nebudou fungovat.

### Varianta B: Plná implementace (vyžaduje Firebase Functions)
Pro plně funkční platby potřebujete:

1. **Firebase Blaze plán** (pay-as-you-go, ale 2M volání/měsíc zdarma)
2. **Firebase Cloud Functions** - backend pro vytváření payment intents
3. **Firebase CLI** nainstalované

Chcete, abych vytvořil i backend část s Firebase Functions?

## 📝 Poznámky

- Všechny soubory jsou ve složce `/platba`
- Při přechodu na produkční provoz NEZAPOMEŇTE změnit test klíče za live klíče
- Objednávky se ukládají do Firestore kolekce `orders`
