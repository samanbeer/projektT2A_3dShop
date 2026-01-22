# Soubory k vymazání před produkčním deployem

Tyto soubory jsou pouze pro lokální vývoj a není je potřeba déployovat:

## ❌ Vymazat tyto soubory:

1. **`server.py`** - Python HTTP server (použitý jen pro lokální testování)
2. **`start_Serveru.txt`** - Návod jak spustit Python server
3. **`nohup.out`** - Log soubor z běhu Python serveru (701 KB!)
4. **`files/`** - Složka s nepoužívanými pomocnými soubory

## 🗑️ Jak vymazat:

V PowerShell nebo příkazové řádce:

```powershell
cd z:\Documents\HTML_3d_shop

# Vymazat jednotlivé soubory
Remove-Item server.py
Remove-Item start_Serveru.txt  
Remove-Item nohup.out

# Vymazat složku files
Remove-Item -Recurse files
```

Nebo prostě v Průzkumníku Windows označte tyto soubory a dejte Delete.

## ✅ Co PONECHAT:

Vše ostatní je důležité pro fungování webu!

- `index.html`, `style.css`, `script.js` - hlavní web
- `imgs/` - obrázky
- `platba/` - platební systém
- `recenze/` - recenze
- `functions/` - Firebase funkce
- `products_database.json`, `filamenty.txt` - databáze
- `404_page/` - chybová stránka
- `firebase.json`, `.gitignore` - konfigurace
