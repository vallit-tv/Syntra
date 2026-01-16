# Vallit Website – Content Guide

Dieses Dokument erklärt, wie du Inhalte auf der Vallit Website anpassen kannst.

## Dateien und Struktur

```
templates/
├── base.html           # Header, Footer, Navigation
├── index.html          # Homepage
├── features.html       # Features-Seite
├── solutions.html      # Use Cases
├── pricing.html        # Pricing + Kontaktformular
├── about.html          # Über uns
└── legal/
    ├── impressum.html  # Impressum (MUSS ERSETZT WERDEN)
    └── datenschutz.html # Datenschutz (MUSS ERSETZT WERDEN)

static/
├── css/vallit.css      # Design System
└── js/vallit.js        # Interaktionen
```

## Texte ändern

Alle Texte sind direkt in den HTML-Templates. Einfach die `.html` Datei öffnen und ändern.

### Beispiel: Hero-Headline ändern
In `templates/index.html`:
```html
<h1>Dein Business.<br>Automatisiert.</h1>
```

### Beispiel: Pricing ändern
In `templates/pricing.html`:
```html
<span class="price-amount">50€</span>
<span class="price-period">/Monat</span>
```

## E-Mail Adresse ändern

Die E-Mail `hello@vallit.network` erscheint an mehreren Stellen:

1. `templates/pricing.html` – Kontaktformular Hinweis
2. `templates/base.html` – Footer (falls vorhanden)
3. `templates/legal/impressum.html` – Kontaktdaten

Suche nach `hello@vallit.network` und ersetze überall.

## Kontaktformular

Das Formular in `pricing.html` sendet aktuell an `/api/contact`. 

**Backend-Integration erforderlich:**
- Erstelle einen Endpunkt `/api/contact` in `app.py`
- Implementiere E-Mail-Versand (z.B. mit Resend, SendGrid, oder SMTP)

## Legal Pages (Wichtig!)

⚠️ **Die Impressum und Datenschutz Seiten enthalten PLATZHALTER!**

Du musst ersetzen:
- `[Straße und Hausnummer]`
- `[PLZ Ort]`
- `[Name des Geschäftsführers]`
- `[HRB XXXXX]`
- `[DE Nummer]`

## Farben anpassen

Alle Farben sind in `static/css/vallit.css` definiert:

```css
:root {
    --color-black: #000000;
    --color-gray-900: #111111;
    /* ... weitere Graustufen */
}
```

## Deployment

```bash
# Lokal testen
python app.py

# Vercel Build
vercel --prod
```

## Checkliste vor Go-Live

- [ ] Impressum vollständig ausgefüllt
- [ ] Datenschutzerklärung rechtlich geprüft
- [ ] Kontaktformular-Backend implementiert
- [ ] E-Mail Adressen aktualisiert
- [ ] Domain konfiguriert
