# Rules coverage

Deze repo bevat een **eerste werkende modellering** van een selectie uit het Vrijstellingsbesluit.

## Gemodelleerde scenario's

| Scenario | Juridische basis | Status |
|---|---|---|
| Woning · vrijstaand bijgebouw / carport | Art. 2.1, 11° + art. 2.2 | Uitgewerkt |
| Woning · zonnepanelen / zonneboiler | Art. 2.1, 3° + art. 2.2, 6° | Uitgewerkt |
| Woning · bovengrondse warmtepomp / airco | Art. 2.1, 8°/1 | Uitgewerkt |
| Ander gebouw · gevel/dak zonder volume | Art. 3.1, 2° en 2/1° + art. 3.2, 4° | Uitgewerkt |
| Industriegebied · nieuw gebouw | Art. 4.3 + art. 4.4 | Uitgewerkt |
| Land- en tuinbouw · schuilhok | Art. 5.1, 3° | Uitgewerkt |
| Groen · hoogstammige boom vellen | Art. 6.1, 1° | Uitgewerkt |
| Tijdelijk · tijdelijke constructie | Art. 7.2 | Uitgewerkt |
| Openbaar domein · verharding | Art. 10, 1° | Uitgewerkt |
| Algemeen belang · technische constructie | Art. 11.1 + 11.9 | Uitgewerkt |
| Telecommunicatie · installatie binnen bestaand gebouw | Art. 12.1, 1° | Uitgewerkt |
| Diverse · laadpaal op/aan verharding | Art. 12/1.2 | Uitgewerkt |
| Afbraak · vrijstaand bouwwerk | Art. 13.2 | Uitgewerkt |

## Generieke prechecks

Voor alle scenario's zijn generieke blockers/warnings voorzien voor:

- MER / passende beoordeling / mobiliteitsstudie
- strijdigheid met verordeningen / RUP / BPA / verkaveling / vergunningsvoorwaarden
- ligging in uitgesloten waterloop-/grachtzones
- mogelijke impact van andere regelgeving (erfgoed, archeologie, natuur, ...)

## Nog niet volledig gemodelleerd

De repo is uitbreidbaar maar bevat nog geen volledige dekking van élk artikel en élke uitzondering uit het besluit.
Specifiek nog uit te breiden:

- meer woning-scenario's (afsluitingen, opritten, niet-overdekte constructies)
- meer landbouwscenario's
- hoofdstuk 8 (wijzigingen van al ingerichte terreinen)
- hoofdstuk 9 (publiciteitsinrichtingen)
- meer telecomsubscenario's
- hoofdstuk 12/1 reliëfwijzigingen, baangrachten, jachtkansels, vogelkijkhutten
- hoofdstuk 13.1 en 13.3

## Aanbevolen volgende stap

Migreren van `data/rules.js` naar:

- JSON + evaluatie-engine, of
- TypeScript met testbare condition evaluators

zodat juridisch inhoudelijke updates makkelijker versioneerbaar worden.
