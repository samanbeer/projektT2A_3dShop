# BEER 3D - PHP + SQLite E-shop

Tento projekt je plně dynamický e-shop zmigrovaný ze statické verze do architektury PHP s lokální SQLite databází pro účely školního hodnocení. Všechny procesy od správy košíku, přes odeslání objednávky a uložení do databáze, až po psaní recenzí a nahrávání obrázků fungují plně lokálně bez nutnosti jakýchkoliv cloudových služeb.

## Požadavky na systém
- PHP verze 8.0 nebo novější
- Povolené rozšíření pro SQLite (PDO SQLite extension) - ve standardních instalacích PHP je aktivní automaticky

## Instrukce pro spuštění na libovolném počítači

### 1. Inicializace databáze (Volitelné)
Databázový soubor `database/eshop.db` je již součástí projektu a je plně nakonfigurován a naplněn výchozími daty (produkty, kategorie, parametry a výchozí recenze). 

Pokud by bylo potřeba databázi kdykoliv vyresetovat do výchozího stavu nebo ji znovu vytvořit, otevřete terminál v kořenové složce projektu a spusťte příkaz:
```bash
php database/init.php
```
Tento skript automaticky smaže staré tabulky, vytvoří novou databázovou strukturu a provede seed dat.

### 2. Spuštění lokálního webového serveru
V kořenovém adresáři projektu (`HTML_3d_shop/`) spusťte vestavěný PHP vývojový server pomocí následujícího příkazu v terminálu:
```bash
php -S localhost:8080
```

### 3. Otevření e-shopu v prohlížeči
Po spuštění serveru otevřete webový prohlížeč a přejděte na adresu:
[http://localhost:8080](http://localhost:8080)

Server automaticky načte výchozí soubor `index.php`.

## Hlavní funkce projektu k ověření

1. **Dynamický katalog produktů** (`produkty.php`): Všechny položky jsou načítány z databáze. Podporuje vyhledávání a filtrování kategorií na straně klienta.
2. **Detail produktu a parametry** (`produkt.php`): Dynamické načítání parametrů (barevné varianty u PLA, rozměry a hmotnost) a automatické skrytí prázdných obrázkových galerií u produktů bez doplňujících fotek.
3. **Nákupní košík** (`kosik.php`): Správa relace (session) košíku, která bezpečně odděluje produkty podle zvolených variant.
4. **Pokladna a validace** (`objednavka.php`): Bezpečné odeslání objednávky s ochranou proti CSRF útokům a validací všech vstupů. Ceny za dopravu a platbu se v reálném čase dynamicky přepočítávají na pokladně.
5. **Potvrzení objednávky** (`podekovani.php`): Načítá a rekapituluje úspěšně zapsaná data zákazníka a objednávky přímo z databázových tabulek orders a customers.
6. **Zákaznické recenze a odpovědi** (`recenze/recenze.php`): Umožňuje přidat recenzi a odpovídat na stávající recenze. Podporuje nahrávání obrázků, které se ukládají lokálně do adresáře `imgs/reviews/`, přičemž cesty k nim se ukládají do databáze. Pro offline testování je ve formulářích Turnstile CAPTCHA ošetřen třísekundovým automatickým schválením při nedostupnosti internetu.

## Přehled struktury projektu

- `database/` - Obsahuje SQLite databázi `eshop.db` a inicializační skript `init.php`.
- `src/` - Jádro aplikace obsahující bootstrap soubor s autoloaderem, správu databáze, košíku, DTO (Data Transfer Objects) a repozitáře s SQL dotazy.
- `partials/` - Společné části stránek (header a footer s toast notifikacemi) a opakující se komponenty (produktová karta).
- `imgs/` - Souborové úložiště obrázků produktů a uživatelských nahrávek z recenzí.
- `recenze/` - Adresář pro dynamickou stránku recenzí včetně jejích stylů.
- `style.css` - Kompletní designový systém e-shopu využívající luxusní dark-amber Stout-gold barevnou paletu a responzivní rozvržení.

© 2025 BEER 3D. Všechna práva vyhrazena.
