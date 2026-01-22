# Firebase Cloud Functions Setup Guide

## 🚀 Krok za krokem

### 1. Nainstalujte Firebase CLI

Otevřete terminál (PowerShell) a spusťte:

```powershell
npm install -g firebase-tools
```

Ověřte instalaci:
```powershell
firebase --version
```

---

### 2. Přihlaste se do Firebase

```powershell
firebase login
```

Otevře se prohlížeč - přihlaste se pomocí Google účtu, který používáte pro Firebase.

---

### 3. Inicializujte Firebase v projektu

V kořenové složce projektu (`z:\Documents\HTML_3d_shop`) spusťte:

```powershell
cd z:\Documents\HTML_3d_shop
firebase init
```

**Odpovědi na otázky:**
- **Which Firebase features?** → Vyberte `Functions` (mezerník pro výběr, Enter pro potvrzení)
- **Use an existing project** → Vyberte váš projekt `beer-3d-eshop`
- **What language?** → `JavaScript`
- **Use ESLint?** → `No` (nebo Yes, jak chcete)
- **Install dependencies now?** → `Yes`

---

### 4. Nastavte Stripe Secret Key

V terminálu spusťte (nahraďte `sk_test_...` vaším skutečným klíčem):

```powershell
firebase functions:config:set stripe.secret_key="sk_test_VÁŠE_SECRET_KEY_ZDE"
```

Získejte Secret Key zde: https://dashboard.stripe.com/test/apikeys

---

### 5. Nainstalujte dependencies

Přejděte do složky functions:

```powershell
cd functions
npm install
```

---

### 6. Testujte lokálně (volitelné)

Spusťte emulator:

```powershell
npm run serve
```

Functions budou dostupné na `http://localhost:5001/beer-3d-eshop/us-central1/`

---

### 7. Deployněte do Firebase

```powershell
firebase deploy --only functions
```

Po deployi dostanete URL pro vaše funkce, například:
```
https://us-central1-beer-3d-eshop.cloudfunctions.net/createPaymentIntent
```

**Zkopírujte si tuto URL!** Budete ji potřebovat v dalším kroku.

---

### 8. Upgradujte Firebase na Blaze plán

1. Otevřete Firebase Console: https://console.firebase.google.com/
2. Vyberte projekt `beer-3d-eshop`
3. V levém menu klikněte na "Upgrade" nebo "Spark → Blaze"
4. Nastavte si limit upozornění (např. 100 Kč měsíčně)

**Poznámka:** Prvních 2 miliony volání měsíčně je zdarma!

---

### 9. Nastavte Webhook v Stripe (volitelné, pro produkci)

1. Otevřete: https://dashboard.stripe.com/test/webhooks
2. Klikněte "Add endpoint"
3. URL endpointu: `https://us-central1-beer-3d-eshop.cloudfunctions.net/stripeWebhook`
4. Vyberte události: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Zkopírujte **Webhook signing secret** (začíná `whsec_...`)
6. Nastavte v Firebase:
   ```powershell
   firebase functions:config:set stripe.webhook_secret="whsec_VÁŠE_WEBHOOK_SECRET"
   firebase deploy --only functions
   ```

---

## ✅ Co dál?

Po dokončení těchto kroků vám řeknu, jak aktualizovat frontend (checkout.js), aby volal vaše Firebase Functions!

## 🆘 Problémy?

- **Chyba při deployi:** Zkontrolujte, že máte Blaze plán
- **Functions nefungují:** Zkontrolujte logy: `firebase functions:log`
- **CORS chyby:** Ujistěte se, že máte `cors` nainstalovaný v dependencies
