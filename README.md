# Vrijstellingschecker

Een **GitHub Pages-vriendelijke** checker voor het Vlaamse **Vrijstellingsbesluit** rond stedenbouwkundige handelingen.

## Wat zit in deze repo?

- **Pure frontend**: geen build stap nodig, werkt gewoon via `index.html`
- **Data-gedreven regels** in `data/rules.js`
- **Conservatieve beslislogica** met drie uitkomsten:
  - `Waarschijnlijk vrijgesteld`
  - `Niet vrijgesteld`
  - `Manuele check nodig`
- **Repo-structuur** die makkelijk uitbreidbaar is voor bijkomende artikels, lokale overlays of een API

## Waarom deze aanpak?

Het Vrijstellingsbesluit bevat veel **contextvoorwaarden** die je niet veilig volledig automatisch kan afleiden zonder:

- perceel- en plangegevens (RUP/BPA/verkaveling)
- erfgoed- en beschermingslagen
- watertoets / waterlopen
- MER-screening
- bestaande vergunningstoestand

Daarom is deze checker bewust **voorzichtig**: zodra cruciale context onzeker is, krijg je `Manuele check nodig`.

## Inhoudelijke dekking in deze eerste repo

Deze eerste werkende versie bevat een set van **belangrijke scenario's**:

1. Woning · vrijstaand bijgebouw / carport
2. Woning · zonnepanelen / zonneboiler
3. Woning · bovengrondse warmtepomp / airco
4. Ander gebouw · gevel/dak zonder volume
5. Industriegebied · nieuw gebouw
6. Land- en tuinbouw · schuilhok voor weidedieren
7. Groen · hoogstammige boom vellen nabij vergunde gebouwen
8. Tijdelijk · tijdelijke constructie
9. Openbaar domein · aanleg verharding
10. Algemeen belang · technische constructie
11. Telecommunicatie · installatie binnen bestaand gebouw
12. Diverse · laadpaal op/aan bestaande verharding
13. Afbraak · volledig slopen vrijstaand bouwwerk/constructie

## Starten

### Optie 1 — lokaal openen

Open `index.html` in je browser.

### Optie 2 — via simpele lokale server

```bash
python3 -m http.server 8080
```

Open daarna `http://localhost:8080`.

## Deployen naar GitHub Pages

1. Maak een nieuwe GitHub repository aan
2. Push deze bestanden naar de `main` branch
3. Zet **Settings → Pages → Deploy from a branch** aan
4. Kies branch `main` en folder `/ (root)`

De meegeleverde workflow `.github/workflows/static.yml` ondersteunt ook deployment via GitHub Actions.

## Belangrijke disclaimer

Deze tool is:

- **geen juridisch bindend advies**
- **geen vervanging** voor een dossierbeoordeling
- **geen automatische check** van lokale plannen/verordeningen, erfgoed of waterlopen

Gebruik hem dus als:

- eerste intake
- triage
- self-service voor eenvoudige vragen
- interne beslissingsondersteuning met manuele validatie

## Volgende logische uitbreidingen

### 1. Juridische dekking uitbreiden
- Meer artikels uit het Vrijstellingsbesluit modelleren
- Lokale overlays toevoegen (gemeentelijke verordeningen, beleidskeuzes)

### 2. Geo-validatie toevoegen
- Perceel op kaart selecteren
- RUP/BPA/verkaveling ophalen
- Erfgoed, waterlopen, overstromingsgevoeligheid en kwetsbare gebieden valideren

### 3. Uitlegbaarheid verbeteren
- Motivering met artikels en voorwaarden per antwoord
- Export naar PDF of dossiernota

### 4. Governance / overheid
- Logging van beslissingen
- versiebeheer van juridische regels
- audit trail
- content owner / juridische owner

## Technische structuur

```text
vrijstellingschecker-repo/
├── index.html
├── styles.css
├── app.js
├── data/
│   └── rules.js
├── .github/
│   └── workflows/
│       └── static.yml
├── RULES_COVERAGE.md
├── ARCHITECTURE.md
└── README.md
```

## Licentie

Kies zelf een licentie passend bij je organisatiecontext. In deze voorbeeldrepo heb ik nog geen expliciete licentie toegevoegd.
