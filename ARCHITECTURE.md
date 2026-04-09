# Architecture

## Keuzes

Deze repo gebruikt **plain HTML/CSS/JavaScript** zodat je meteen kan deployen op GitHub Pages.

### Waarom geen framework?

- laagdrempelig
- geen build pipeline nodig
- eenvoudig te reviewen door niet-developers
- makkelijk over te dragen in overheidscontext

## Componenten

### `index.html`
UI-shell met scenarioselectie, form en resultpaneel.

### `styles.css`
Eenvoudige, toegankelijke styling.

### `data/rules.js`
Bevat:
- scenario metadata
- velden per scenario
- evaluatiefuncties
- generieke prechecks

### `app.js`
Runtime voor:
- scenario laden
- dynamische formulieren renderen
- input ophalen
- evaluatie uitvoeren
- resultaat tonen

## Uitbreidpad

### Fase 2
- regels naar JSON-schema
- betere explainability
- unit tests
- exportfunctie

### Fase 3
- koppeling met geo-lagen
- koppeling met erfgoed/watertoets/planregister
- lokale overlay voor Stad/Gemeente
- audit logging

## Compliance-aandachtspunten

- **privacy-by-design**: vermijd persoonsgegevens zolang niet nodig
- **security-by-default**: geen externe scripts nodig
- **toegankelijkheid**: semantische formulieren, voldoende contrast, keyboardvriendelijk
- **governance**: definieer juridische owner voor wijzigingen aan de regels
