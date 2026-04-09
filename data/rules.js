(function () {
  const yesNoUnknown = [
    { value: 'yes', label: 'Ja' },
    { value: 'no', label: 'Nee' },
    { value: 'unknown', label: 'Onzeker' }
  ];

  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function commonGuards(form) {
    const reasons = [];
    const warnings = [];
    const unknowns = [];

    if (form.requiresMer === 'yes') reasons.push('Een MER, passende beoordeling of mobiliteitsstudie is vereist.');
    if (form.requiresMer === 'unknown') unknowns.push('Onzeker of een MER, passende beoordeling of mobiliteitsstudie vereist is.');

    if (form.conflictsVerordening === 'yes') reasons.push('De handeling is strijdig met stedenbouwkundige verordeningen, voorschriften of vergunningsvoorwaarden.');
    if (form.conflictsVerordening === 'unknown') unknowns.push('Onzeker of de handeling strijdig is met verordeningen, RUP/BPA, verkavelingsvoorschriften of vergunningsvoorwaarden.');

    if (form.inWatercourseZone === 'yes' && form.watercourseApproved !== 'yes') {
      reasons.push('De handeling ligt in of langs een waterloop/gracht-zone zonder vereiste goedkeuring of machtiging.');
    }
    if (form.inWatercourseZone === 'unknown') unknowns.push('Onzeker of de handeling in een uitgesloten waterloop/gracht-zone ligt.');
    if (form.protectedRegulation === 'yes') warnings.push('Andere regelgeving (erfgoed, archeologie, natuur, publieke veiligheid, …) kan bijkomende toelatingen vereisen.');
    if (form.protectedRegulation === 'unknown') unknowns.push('Onzeker of er bijkomende regelgeving geldt (erfgoed, archeologie, natuur, ...).');

    return { reasons, warnings, unknowns };
  }

  function verdict(status, title, article, summary, reasons = [], warnings = [], unknowns = []) {
    return { status, title, article, summary, reasons, warnings, unknowns };
  }

  const baseFields = [
    {
      type: 'radio',
      name: 'requiresMer',
      label: 'Is een MER, passende beoordeling of mobiliteitsstudie vereist?',
      help: 'Als dat vereist is, geldt deze vrijstelling niet.',
      options: yesNoUnknown,
      default: 'unknown'
    },
    {
      type: 'radio',
      name: 'conflictsVerordening',
      label: 'Is de handeling volledig conform verordeningen, RUP/BPA, verkavelingsvoorschriften en bestaande vergunningsvoorwaarden?',
      help: 'Bij strijdigheid is de vrijstelling niet toepasbaar.',
      options: yesNoUnknown,
      default: 'unknown'
    },
    {
      type: 'radio',
      name: 'inWatercourseZone',
      label: 'Ligt de handeling geheel of deels in een uitgesloten zone langs waterlopen/grachten?',
      help: 'Denk aan bedding, 5m-strook of erfdienstbaarheidszone langs bepaalde waterlopen/grachten.',
      options: yesNoUnknown,
      default: 'unknown'
    },
    {
      type: 'radio',
      name: 'watercourseApproved',
      label: 'Zo ja: gebeurt de handeling door/in opdracht van/met goedkeuring van de waterloopbeheerder?',
      options: yesNoUnknown,
      default: 'unknown'
    },
    {
      type: 'radio',
      name: 'protectedRegulation',
      label: 'Kan andere regelgeving spelen (erfgoed, archeologie, natuur, beschermingen)?',
      options: yesNoUnknown,
      default: 'unknown'
    }
  ];

  const scenarios = [
    {
      id: 'woning-bijgebouw',
      title: 'Woning · vrijstaand bijgebouw / carport',
      chapter: 'Hoofdstuk 2',
      article: 'Art. 2.1, 11° + art. 2.2',
      description: 'Vrijstaand, niet voor verblijf bestemd bijgebouw of carport in zijtuin/achtertuin.',
      tags: ['woning', 'bijgebouw', 'carport', 'tuin'],
      fields: [
        ...baseFields,
        { type: 'number', name: 'distanceToHouse', label: 'Afstand tot de woning (meter)', min: 0, step: 0.1 },
        { type: 'number', name: 'distanceToBoundary', label: 'Kleinste afstand tot perceelsgrens (meter)', min: 0, step: 0.1 },
        { type: 'radio', name: 'againstExistingWall', label: 'Wordt het bijgebouw in de achtertuin op/tegen een bestaande scheidingsmuur geplaatst zonder die muur te wijzigen?', options: yesNoUnknown, default: 'no' },
        { type: 'number', name: 'existingTotalArea', label: 'Bestaande totale oppervlakte vrijstaande bijgebouwen op het goed (m²)', min: 0, step: 0.1 },
        { type: 'number', name: 'newArea', label: 'Oppervlakte van het nieuwe bijgebouw (m²)', min: 0, step: 0.1 },
        { type: 'number', name: 'height', label: 'Maximale hoogte (meter)', min: 0, step: 0.1 },
        { type: 'radio', name: 'forHabitation', label: 'Is het bijgebouw bedoeld voor verblijf/bewoning?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'runoffOwnTerrain', label: 'Blijft het hemelwater op eigen terrein?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'inSpatiallyVulnerableArea', label: 'Ligt het in ruimtelijk kwetsbaar gebied (uitz. parkgebied)?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'mainlyPermittedResidence', label: 'Is de woning hoofdzakelijk vergund of vergund geacht?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'changesFunction', label: 'Wordt een vergunningsplichtige functiewijziging doorgevoerd?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'changesDwellingCount', label: 'Wijzigt het aantal woongelegenheden?', options: yesNoUnknown, default: 'no' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];

        if (form.mainlyPermittedResidence === 'no') reasons.push('De woning is niet hoofdzakelijk vergund of vergund geacht.');
        if (form.mainlyPermittedResidence === 'unknown') unknowns.push('Onzeker of de woning hoofdzakelijk vergund of vergund geacht is.');
        if (form.changesFunction === 'yes') reasons.push('Er is een vergunningsplichtige functiewijziging.');
        if (form.changesDwellingCount === 'yes') reasons.push('Het aantal woongelegenheden wijzigt.');
        if (form.forHabitation === 'yes') reasons.push('Een vrijstaand bijgebouw onder deze vrijstelling mag niet voor verblijf bestemd zijn.');
        if (form.inSpatiallyVulnerableArea === 'yes') reasons.push('Bijgebouwen vallen hier niet onder de vrijstelling in ruimtelijk kwetsbaar gebied (behalve parkgebied).');
        if (form.runoffOwnTerrain === 'no') reasons.push('Hemelwater mag niet van het eigen terrein worden afgevoerd.');
        if (form.runoffOwnTerrain === 'unknown') unknowns.push('Onzeker of het hemelwater op eigen terrein blijft.');

        const distHouse = num(form.distanceToHouse);
        const distBoundary = num(form.distanceToBoundary);
        const existingArea = num(form.existingTotalArea) || 0;
        const newArea = num(form.newArea) || 0;
        const height = num(form.height);
        const totalArea = existingArea + newArea;

        if (distHouse != null && distHouse > 30) reasons.push('Het bijgebouw ligt niet volledig binnen 30 meter van de woning.');
        if (distBoundary != null) {
          if (distBoundary < 1 && form.againstExistingWall !== 'yes') reasons.push('In de achtertuin is minimaal 1 meter tot de perceelsgrens vereist, tenzij tegen een bestaande scheidingsmuur zonder wijziging ervan.');
          if (distBoundary < 0) reasons.push('Afstand tot perceelsgrens kan niet negatief zijn.');
        }
        if (totalArea > 40) reasons.push(`De totale oppervlakte van vrijstaande bijgebouwen overschrijdt 40 m² (${totalArea} m²).`);
        if (height != null && height > 3.5) reasons.push('De hoogte overschrijdt 3,5 meter.');

        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De opgegeven parameters botsen met minstens één harde voorwaarde.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'Er lijken geen harde tegenindicaties, maar enkele cruciale voorwaarden zijn onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'Deze handeling lijkt binnen de voorwaarden van de vrijstelling voor vrijstaande bijgebouwen bij woningen te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'woning-zonnepanelen',
      title: 'Woning · zonnepanelen / zonneboiler',
      chapter: 'Hoofdstuk 2',
      article: 'Art. 2.1, 3° + art. 2.2, 6°',
      description: 'Zonnepanelen of zonneboiler op woning.',
      tags: ['woning', 'dak', 'gevel', 'energie'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'mainlyPermittedResidence', label: 'Is de woning hoofdzakelijk vergund of vergund geacht?', options: yesNoUnknown, default: 'unknown' },
        { type: 'select', name: 'placement', label: 'Plaatsing', options: [
          { value: 'flat', label: 'Op plat dak (max 1 m boven dakrand)' },
          { value: 'pitched', label: 'Geïntegreerd in/op hellend dakvlak' },
          { value: 'facade', label: 'Op gevel' },
          { value: 'balcony', label: 'Aan balkonafsluiting' }
        ] },
        { type: 'number', name: 'aboveRoofEdge', label: 'Hoogte boven dakrand (meter, enkel relevant bij plat dak)', min: 0, step: 0.1 },
        { type: 'number', name: 'facadeArea', label: 'Totale oppervlakte per gevel (m², enkel relevant bij gevel)', min: 0, step: 0.1 },
        { type: 'radio', name: 'worldHeritageArea', label: 'Ligt het in werelderfgoedzone of bufferzone?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'inventoryBuilding', label: 'Is het gebouw opgenomen in de vastgestelde inventaris van bouwkundig erfgoed (maar niet beschermd)?', options: yesNoUnknown, default: 'unknown' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];

        if (form.mainlyPermittedResidence === 'no') reasons.push('De woning is niet hoofdzakelijk vergund of vergund geacht.');
        if (form.mainlyPermittedResidence === 'unknown') unknowns.push('Onzeker of de woning hoofdzakelijk vergund of vergund geacht is.');
        if (form.worldHeritageArea === 'yes') reasons.push('Voor deze plaatsing geldt de vrijstelling niet in werelderfgoedzones of bufferzones.');
        if (form.inventoryBuilding === 'yes') reasons.push('Voor gebouwen in de vastgestelde inventaris van bouwkundig erfgoed (niet beschermd) geldt de vrijstelling hier niet.');
        if (form.worldHeritageArea === 'unknown') unknowns.push('Onzeker of het perceel in een werelderfgoedzone/bufferzone ligt.');
        if (form.inventoryBuilding === 'unknown') unknowns.push('Onzeker of het gebouw in de inventaris van bouwkundig erfgoed is opgenomen.');

        const above = num(form.aboveRoofEdge);
        const area = num(form.facadeArea);
        if (form.placement === 'flat' && above != null && above > 1) reasons.push('Op een plat dak mag de installatie maximaal 1 meter boven de dakrand komen.');
        if (form.placement === 'facade' && area != null && area > 4) reasons.push('Op een gevel is maximaal 4 m² per gevel toegestaan.');

        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De plaatsing voldoet niet aan minstens één harde voorwaarde.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'De basisvoorwaarden lijken haalbaar, maar enkele cruciale contextvoorwaarden zijn onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'De zonnepanelen/zonneboiler lijken binnen de vrijstellingsvoorwaarden te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'woning-warmtepomp',
      title: 'Woning · bovengrondse warmtepomp / airco',
      chapter: 'Hoofdstuk 2',
      article: 'Art. 2.1, 8°/1',
      description: 'Bovengrondse onderdelen van warmtepompen en airco’s in tuin, op gevel of op plat dak.',
      tags: ['woning', 'warmtepomp', 'airco', 'energie'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'mainlyPermittedResidence', label: 'Is de woning hoofdzakelijk vergund of vergund geacht?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'locationType', label: 'Plaatsing', options: [
          { value: 'garden', label: 'In de tuin' },
          { value: 'facade', label: 'Op een gevel' },
          { value: 'flatroof', label: 'Op een plat dak' }
        ], default: 'garden' },
        { type: 'number', name: 'distanceToBoundary', label: 'Kleinste afstand tot perceelsgrens (meter)', min: 0, step: 0.1 },
        { type: 'radio', name: 'againstExistingWall', label: 'Tegen een bestaande scheidingsmuur?', options: yesNoUnknown, default: 'no' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];

        if (form.mainlyPermittedResidence === 'no') reasons.push('De woning is niet hoofdzakelijk vergund of vergund geacht.');
        if (form.mainlyPermittedResidence === 'unknown') unknowns.push('Onzeker of de woning hoofdzakelijk vergund of vergund geacht is.');
        const distBoundary = num(form.distanceToBoundary);
        if (distBoundary != null && distBoundary < 2 && form.againstExistingWall !== 'yes') reasons.push('De installatie moet ingeplant zijn tot op 2 meter van de perceelsgrens of tegen een bestaande scheidingsmuur.');

        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De opgegeven plaatsing voldoet niet aan de harde voorwaarden.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'De plaatsing lijkt mogelijk, maar enkele kernvoorwaarden zijn onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'De plaatsing van de warmtepomp/airco lijkt binnen de vrijstelling te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'andere-gebouwen-geveldak',
      title: 'Ander gebouw · handelingen aan gevel/dak zonder volume',
      chapter: 'Hoofdstuk 3',
      article: 'Art. 3.1, 2° en 2/1° + art. 3.2, 4°',
      description: 'Gevel- en dakwerken zonder volume-uitbreiding, incl. buitenisolatie tot 26 cm.',
      tags: ['gebouw', 'gevel', 'dak', 'isolatie'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'mainlyPermittedBuilding', label: 'Is het gebouw hoofdzakelijk vergund of vergund geacht?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'worsensEnergyPerformance', label: 'Verslechtert de energieprestatie?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'changesVolume', label: 'Wijzigt het fysieke bouwvolume?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'includesExteriorInsulation', label: 'Gaat het om buitenisolatie?', options: yesNoUnknown, default: 'no' },
        { type: 'number', name: 'insulationThicknessCm', label: 'Dikte buitenisolatie (cm)', min: 0, step: 0.1 },
        { type: 'radio', name: 'crossesBuildingLine', label: 'Wordt de rooilijn overschreden?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'worldHeritageArea', label: 'Ligt het in werelderfgoedzone of bufferzone?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'inventoryBuilding', label: 'Is het gebouw opgenomen in de vastgestelde inventaris van bouwkundig erfgoed (maar niet beschermd)?', options: yesNoUnknown, default: 'unknown' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];
        if (form.mainlyPermittedBuilding === 'no') reasons.push('Het gebouw is niet hoofdzakelijk vergund of vergund geacht.');
        if (form.mainlyPermittedBuilding === 'unknown') unknowns.push('Onzeker of het gebouw hoofdzakelijk vergund of vergund geacht is.');
        if (form.worsensEnergyPerformance === 'yes') reasons.push('De energieprestatie mag niet verslechteren.');
        if (form.changesVolume === 'yes') reasons.push('Het fysieke bouwvolume mag niet wijzigen.');
        if (form.includesExteriorInsulation === 'yes') {
          const cm = num(form.insulationThicknessCm);
          if (cm != null && cm > 26) reasons.push('Buitenzijde-isolatie is maximaal 26 cm toegestaan.');
          if (form.crossesBuildingLine === 'yes') reasons.push('De rooilijn mag niet overschreden worden.');
        }
        if (form.worldHeritageArea === 'yes') reasons.push('Voor deze handeling geldt de vrijstelling hier niet in werelderfgoedzone/bufferzone.');
        if (form.inventoryBuilding === 'yes') reasons.push('Voor gebouwen in de inventaris van bouwkundig erfgoed (niet beschermd) geldt de vrijstelling hier niet.');
        if (form.worldHeritageArea === 'unknown') unknowns.push('Onzeker of het perceel in een werelderfgoedzone/bufferzone ligt.');
        if (form.inventoryBuilding === 'unknown') unknowns.push('Onzeker of het gebouw in de inventaris van bouwkundig erfgoed is opgenomen.');

        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'Minstens één harde voorwaarde wordt niet gehaald.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'Er zijn geen harde conflictsignalen, maar cruciale contextinfo ontbreekt.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'De gevel-/dakhandeling lijkt binnen de vrijstelling te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'industrie-gebouw',
      title: 'Industriegebied · nieuw gebouw',
      chapter: 'Hoofdstuk 4',
      article: 'Art. 4.3 + art. 4.4',
      description: 'Nieuw gebouw in functie van bestaande industrie/bedrijvigheid.',
      tags: ['industrie', 'gebouw', 'bedrijvigheid'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'inIndustryArea', label: 'Ligt het in industriegebied in ruime zin?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'seaPortArea', label: 'Ligt het in afgebakend zeehavengebied?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'functionIndustry', label: 'Heeft het gebouw de functie industrie/bedrijvigheid en is het gelinkt aan bestaande industrie/bedrijvigheid?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'isBusinessDwelling', label: 'Betreft het een bedrijfswoning?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'hasBpaOrRup', label: 'Bestaat er voor de plaats een BPA of RUP?', options: yesNoUnknown, default: 'unknown' },
        { type: 'number', name: 'distanceToPermittedBuilding', label: 'Afstand tot hoofdzakelijk vergund/vergund geacht gebouw (meter)', min: 0, step: 0.1 },
        { type: 'radio', name: 'attached', label: 'Wordt het gebouw aangebouwd?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'fireCompartmentsOk', label: 'Blijven brandcompartimenteringsvoorwaarden gerespecteerd?', options: yesNoUnknown, default: 'unknown' },
        { type: 'number', name: 'distanceToOtherBuildings', label: 'Afstand tot andere gebouwen indien niet aangebouwd (meter)', min: 0, step: 0.1 },
        { type: 'number', name: 'existingPermittedBuildingArea', label: 'Bestaande vergunde grondoppervlakte gebouwen in projectzone (m²)', min: 0, step: 0.1 },
        { type: 'number', name: 'newBuildingArea', label: 'Nieuwe grondoppervlakte gebouw (m²)', min: 0, step: 0.1 },
        { type: 'number', name: 'distanceToResidentialOrVulnerable', label: 'Afstand tot woongebied/ruimtelijk kwetsbaar gebied (meter)', min: 0, step: 0.1 },
        { type: 'number', name: 'distanceToBoundary', label: 'Afstand tot perceelsgrens (meter)', min: 0, step: 0.1 },
        { type: 'number', name: 'height', label: 'Hoogte gebouw (meter)', min: 0, step: 0.1 },
        { type: 'number', name: 'buildingLayers', label: 'Aantal bouwlagen', min: 0, step: 1 },
        { type: 'number', name: 'fireLoad', label: 'Brandbelasting (MJ/m²)', min: 0, step: 1 },
        { type: 'radio', name: 'accessEmergencyReduced', label: 'Vermindert de bereikbaarheid voor hulpdiensten?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'deforestation', label: 'Gaat dit gepaard met ontbossing?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'ecologicalZone', label: 'Ligt het in een uitgesloten ecologische infrastructuurzone?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'beforeBuildingLine', label: 'Ligt het voor de rooilijn?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'runoffOwnTerrain', label: 'Blijft het hemelwater op eigen terrein?', options: yesNoUnknown, default: 'unknown' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];

        if (form.inIndustryArea === 'no') reasons.push('De vrijstelling geldt alleen in industriegebied in ruime zin.');
        if (form.inIndustryArea === 'unknown') unknowns.push('Onzeker of het terrein in industriegebied in ruime zin ligt.');
        if (form.functionIndustry === 'no') reasons.push('Het gebouw moet dienen voor industrie/bedrijvigheid en in relatie staan tot bestaande industrie/bedrijvigheid.');
        if (form.isBusinessDwelling === 'yes') reasons.push('Een bedrijfswoning valt niet onder deze vrijstelling.');
        if (form.hasBpaOrRup === 'no') reasons.push('Voor de plaats moet een BPA of RUP bestaan.');
        if (form.beforeBuildingLine === 'yes') reasons.push('Het gebouw mag niet voor de rooilijn liggen.');
        if (form.deforestation === 'yes') reasons.push('De vrijstelling geldt niet als ontbossing nodig is.');
        if (form.ecologicalZone === 'yes') reasons.push('De vrijstelling geldt niet in een uitgesloten ecologische infrastructuurzone.');
        if (form.accessEmergencyReduced === 'yes') reasons.push('De bereikbaarheid voor hulpdiensten mag niet verminderen.');
        if (form.runoffOwnTerrain === 'no') reasons.push('Hemelwater mag niet van het eigen terrein worden afgevoerd.');
        if (form.runoffOwnTerrain === 'unknown') unknowns.push('Onzeker of hemelwater op eigen terrein blijft.');
        if (form.ecologicalZone === 'unknown') unknowns.push('Onzeker of er een uitgesloten ecologische infrastructuurzone is.');

        const seaPort = form.seaPortArea === 'yes';
        const maxDist = seaPort ? 50 : 30;
        const maxArea = seaPort ? 500 : 100;
        const maxHeight = seaPort ? 20 : 10;
        const minResidential = 30;
        const minBoundary = 5;
        const dist = num(form.distanceToPermittedBuilding);
        const existing = num(form.existingPermittedBuildingArea) || 0;
        const area = num(form.newBuildingArea) || 0;
        const distRes = num(form.distanceToResidentialOrVulnerable);
        const distBoundary = num(form.distanceToBoundary);
        const height = num(form.height);
        const layers = num(form.buildingLayers);
        const fireLoad = num(form.fireLoad);
        const distOther = num(form.distanceToOtherBuildings);

        if (dist != null && dist > maxDist) reasons.push(`Het gebouw ligt verder dan ${maxDist} meter van een hoofdzakelijk vergund of vergund geacht gebouw.`);
        if (area > existing && existing > 0) reasons.push('De nieuwe grondoppervlakte overschrijdt 100% van de al vergunde grondoppervlakte van de gebouwen.');
        if (area > maxArea) reasons.push(`De nieuwe grondoppervlakte overschrijdt ${maxArea} m² per projectzone.`);
        if (distRes != null && distRes < minResidential) reasons.push('Minstens 30 meter afstand tot woongebied/ruimtelijk kwetsbaar gebied is vereist.');
        if (distBoundary != null && distBoundary < minBoundary) reasons.push('Minstens 5 meter afstand tot alle perceelsgrenzen is vereist.');
        if (height != null && height > maxHeight) reasons.push(`De hoogte overschrijdt ${maxHeight} meter.`);
        if (layers != null && layers > 1) reasons.push('Maximaal één bouwlaag is toegestaan.');
        if (fireLoad != null && fireLoad >= 350) reasons.push('De brandbelasting moet lager zijn dan 350 MJ/m².');
        if (form.attached === 'yes' && form.fireCompartmentsOk === 'no') reasons.push('Bij aanbouw moeten de voorwaarden voor brandcompartimentering behouden blijven.');
        if (form.attached === 'no' && distOther != null && distOther < 5) reasons.push('Niet-aangebouwde gebouwen moeten minstens 5 meter van andere gebouwen liggen.');

        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De opgegeven parameters botsen met harde randvoorwaarden uit het industriehoofdstuk.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'De contour lijkt mogelijk, maar enkele noodzakelijke feiten zijn onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'Dit industriegebouw lijkt binnen de vrijstellingsvoorwaarden te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'landbouw-schuilhok',
      title: 'Land- en tuinbouw · schuilhok voor weidedieren',
      chapter: 'Hoofdstuk 5',
      article: 'Art. 5.1, 3°',
      description: 'Schuilhok voor weidedieren buiten ruimtelijk kwetsbaar gebied (behalve parkgebied).',
      tags: ['landbouw', 'weidedieren', 'schuilhok'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'inSpatiallyVulnerableArea', label: 'Ligt het in ruimtelijk kwetsbaar gebied (uitz. parkgebied)?', options: yesNoUnknown, default: 'unknown' },
        { type: 'number', name: 'height', label: 'Hoogte schuilhok (meter)', min: 0, step: 0.1 },
        { type: 'number', name: 'existingArea', label: 'Bestaande totale oppervlakte schuilhokken per aaneengesloten groep percelen in één eigendom (m²)', min: 0, step: 0.1 },
        { type: 'number', name: 'newArea', label: 'Oppervlakte nieuw schuilhok (m²)', min: 0, step: 0.1 }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];
        if (form.inSpatiallyVulnerableArea === 'yes') reasons.push('Deze vrijstelling geldt hier niet in ruimtelijk kwetsbaar gebied (behalve parkgebied).');
        if (form.inSpatiallyVulnerableArea === 'unknown') unknowns.push('Onzeker of het goed in ruimtelijk kwetsbaar gebied ligt.');
        const height = num(form.height);
        const total = (num(form.existingArea) || 0) + (num(form.newArea) || 0);
        if (height != null && height > 3) reasons.push('De maximale hoogte is 3 meter.');
        if (total > 80) reasons.push(`De totale oppervlakte schuilhokken overschrijdt 80 m² (${total} m²).`);
        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'Minstens één harde voorwaarde wordt niet gehaald.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'De basis lijkt haalbaar, maar de context is niet volledig zeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'Het schuilhok lijkt binnen de vrijstellingsvoorwaarden te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'groen-boom-vellen',
      title: 'Groen · hoogstammige boom vellen nabij vergunde gebouwen',
      chapter: 'Hoofdstuk 6',
      article: 'Art. 6.1, 1°',
      description: 'Vellen van hoogstammige bomen binnen 15 meter rond vergunde woning/bedrijfsgebouwen onder voorwaarden.',
      tags: ['groen', 'boom', 'vellen'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'partOfForest', label: 'Maakt de boom deel uit van een bos?', options: yesNoUnknown, default: 'unknown' },
        { type: 'select', name: 'zoneType', label: 'Gebiedstype', options: [
          { value: 'woongebied', label: 'Woongebied in ruime zin' },
          { value: 'agrarisch', label: 'Agrarisch gebied in ruime zin' },
          { value: 'industrie', label: 'Industriegebied in ruime zin' },
          { value: 'woonpark', label: 'Woonparkgebied' },
          { value: 'ander', label: 'Ander' }
        ] },
        { type: 'number', name: 'distanceToPermittedBuilding', label: 'Afstand tot vergunde woning/bedrijfswoning/bedrijfsgebouw (meter)', min: 0, step: 0.1 },
        { type: 'radio', name: 'publicDomain', label: 'Ligt de boom op openbaar domein?', options: yesNoUnknown, default: 'unknown' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];
        if (form.partOfForest === 'yes') reasons.push('De boom mag geen deel uitmaken van een bos.');
        if (form.partOfForest === 'unknown') unknowns.push('Onzeker of de boom deel uitmaakt van een bos.');
        if (['ander', 'woonpark'].includes(form.zoneType)) reasons.push('Deze specifieke vrijstelling geldt niet in dit gebiedstype.');
        const dist = num(form.distanceToPermittedBuilding);
        if (dist != null && dist > 15) reasons.push('De boom moet binnen 15 meter rond het vergunde gebouw liggen.');
        if (form.publicDomain === 'yes') reasons.push('Deze specifieke vrijstelling geldt niet voor bomen op openbaar domein.');
        if (form.publicDomain === 'unknown') unknowns.push('Onzeker of de boom op openbaar domein ligt.');
        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De opgegeven situatie past niet binnen deze vrijstelling voor hoogstammige bomen.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'De situatie kan passen, maar enkele basisfeiten zijn onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'Het vellen van de hoogstammige boom lijkt binnen deze vrijstellingsregeling te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'tijdelijk-constructie',
      title: 'Tijdelijk · tijdelijke constructie',
      chapter: 'Hoofdstuk 7',
      article: 'Art. 7.2',
      description: 'Tijdelijke plaatsing van constructies (geen publiciteit) tot vier periodes van 30 dagen per kalenderjaar.',
      tags: ['tijdelijk', 'constructie', 'evenement'],
      fields: [
        ...baseFields,
        { type: 'number', name: 'periodsThisYear', label: 'Aantal periodes van 30 aaneengesloten dagen in dit kalenderjaar (incl. deze)', min: 0, step: 1 },
        { type: 'radio', name: 'isAdvertisement', label: 'Betreft het een publiciteitsinrichting?', options: yesNoUnknown, default: 'no' },
        { type: 'radio', name: 'inSpatiallyVulnerableArea', label: 'Ligt het in ruimtelijk kwetsbaar gebied (uitz. parkgebied)?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'jeopardizesAreaPurpose', label: 'Brengt dit de verwezenlijking van de algemene bestemming van het gebied in het gedrang?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'deforestationOrVegetationChange', label: 'Gaat dit gepaard met ontbossing, wijziging van vegetatie/KLE, aanmerkelijke reliëfwijziging of wijziging van waterlichamen?', options: yesNoUnknown, default: 'unknown' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];
        const periods = num(form.periodsThisYear);
        if (form.isAdvertisement === 'yes') reasons.push('Publiciteitsinrichtingen vallen niet onder deze tijdelijke constructievrijstelling.');
        if (periods != null && periods > 4) reasons.push('Maximaal vier periodes van 30 aaneengesloten dagen per kalenderjaar zijn toegestaan.');
        if (form.inSpatiallyVulnerableArea === 'yes') reasons.push('Deze vrijstelling geldt hier niet in ruimtelijk kwetsbaar gebied (behalve parkgebied).');
        if (form.jeopardizesAreaPurpose === 'yes') reasons.push('De constructie mag de algemene bestemming van het gebied niet in het gedrang brengen.');
        if (form.deforestationOrVegetationChange === 'yes') reasons.push('Er mag geen ontbossing, vegetatiewijziging/KLE-wijziging, aanmerkelijke reliëfwijziging of wijziging van waterlichamen zijn.');
        if (form.inSpatiallyVulnerableArea === 'unknown') unknowns.push('Onzeker of het terrein in ruimtelijk kwetsbaar gebied ligt.');
        if (form.jeopardizesAreaPurpose === 'unknown') unknowns.push('Onzeker of de algemene bestemming van het gebied in het gedrang komt.');
        if (form.deforestationOrVegetationChange === 'unknown') unknowns.push('Onzeker of er vegetatie-, reliëf- of waterwijzigingen zijn.');
        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De tijdelijke constructie botst met minstens één harde voorwaarde.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'Er zijn geen harde blockers, maar enkele cruciale voorwaarden blijven onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'De tijdelijke constructie lijkt binnen de vrijstelling te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'openbaar-domein-verharding',
      title: 'Openbaar domein · aanleg verharding',
      chapter: 'Hoofdstuk 10',
      article: 'Art. 10, 1°',
      description: 'Aanleg van verhardingen op openbaar domein of toekomstig openbaar domein.',
      tags: ['openbaar domein', 'verharding'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'publicDomain', label: 'Gaat het om openbaar domein of terrein dat openbaar domein wordt?', options: yesNoUnknown, default: 'unknown' },
        { type: 'number', name: 'additionalArea', label: 'Totale bijkomende oppervlakte ruimtelijk samenhangende handelingen (m²)', min: 0, step: 0.1 },
        { type: 'number', name: 'reliefChangeCm', label: 'Maximale reliëfwijziging (cm)', min: 0, step: 1 }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];
        if (form.publicDomain === 'no') reasons.push('Deze vrijstelling geldt alleen op openbaar domein of terrein dat openbaar domein wordt.');
        if (form.publicDomain === 'unknown') unknowns.push('Onzeker of het terrein (toekomstig) openbaar domein is.');
        const area = num(form.additionalArea);
        const relief = num(form.reliefChangeCm);
        if (area != null && area > 300) reasons.push('De totale bijkomende oppervlakte mag maximaal 300 m² bedragen.');
        if (relief != null && relief >= 50) reasons.push('De reliëfwijziging moet minder dan 50 cm bedragen.');
        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De verharding voldoet niet aan de grenzen van deze vrijstelling.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'De maatvoering lijkt haalbaar, maar enkele contextvoorwaarden zijn onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'De verharding op openbaar domein lijkt binnen de vrijstelling te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'algemeen-belang-technisch',
      title: 'Algemeen belang · technische constructie',
      chapter: 'Hoofdstuk 11',
      article: 'Art. 11.1 + art. 11.9',
      description: 'Kleinschalige technische infrastructuur / technische constructie van algemeen belang.',
      tags: ['algemeen belang', 'technische infrastructuur'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'byGovernment', label: 'Wordt de infrastructuur door of in opdracht van de overheid geplaatst?', options: yesNoUnknown, default: 'unknown' },
        { type: 'number', name: 'height', label: 'Hoogte boven maaiveld (meter)', min: 0, step: 0.1 },
        { type: 'radio', name: 'domainType', label: 'Domein', options: [
          { value: 'private', label: 'Privaat domein' },
          { value: 'public', label: 'Openbaar domein' }
        ], default: 'private' },
        { type: 'number', name: 'aboveGroundVolume', label: 'Maximaal bovengronds volume (m³)', min: 0, step: 0.1 },
        { type: 'radio', name: 'worldHeritageArea', label: 'Ligt de constructie op privaat domein in werelderfgoed(zone/bufferzone)?', options: yesNoUnknown, default: 'unknown' },
        { type: 'number', name: 'distanceToInventoryBuilding', label: 'Afstand tot gebouw in vastgestelde inventaris bouwkundig erfgoed (meter)', min: 0, step: 0.1 },
        { type: 'radio', name: 'onMerAnnex1', label: 'Komt de handeling voor op bijlage 1 MER-besluit van 24 oktober 2025?', options: yesNoUnknown, default: 'unknown' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];
        const height = num(form.height);
        const vol = num(form.aboveGroundVolume);
        const dist = num(form.distanceToInventoryBuilding);
        if (height != null && height > 5) reasons.push('De maximale hoogte is 5 meter boven maaiveld.');
        if (form.domainType === 'private' && vol != null && vol > 30) reasons.push('Op privaat domein is maximaal 30 m³ bovengronds volume toegestaan.');
        if (form.domainType === 'public' && vol != null && vol > 60) reasons.push('Op openbaar domein is maximaal 60 m³ bovengronds volume toegestaan.');
        if (form.domainType === 'private' && form.worldHeritageArea === 'yes') reasons.push('Op privaat domein geldt de vrijstelling niet in werelderfgoed(zone/bufferzone).');
        if (form.domainType === 'private' && dist != null && dist < 30) reasons.push('Op privaat domein geldt de vrijstelling niet binnen 30 meter van een gebouw in de vastgestelde inventaris bouwkundig erfgoed (niet beschermd).');
        if (form.onMerAnnex1 === 'yes') reasons.push('De vrijstelling geldt niet voor handelingen op bijlage 1 van het MER-uitvoeringsbesluit van 24 oktober 2025.');
        if (form.onMerAnnex1 === 'unknown') unknowns.push('Onzeker of de handeling voorkomt op bijlage 1 van het MER-uitvoeringsbesluit van 24 oktober 2025.');
        if (form.worldHeritageArea === 'unknown') unknowns.push('Onzeker of de constructie in een werelderfgoedzone/bufferzone ligt.');
        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De technische constructie voldoet niet aan alle harde voorwaarden.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'De maatvoering lijkt in orde, maar enkele juridische contextvragen zijn onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'De technische constructie lijkt binnen de vrijstellingsvoorwaarden te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'telecom-installatie-binnen',
      title: 'Telecommunicatie · installatie in bestaand gebouw/constructie',
      chapter: 'Hoofdstuk 12',
      article: 'Art. 12.1, 1°',
      description: 'Volledige zend- en ontvangstinstallatie binnen in bestaand gebouw of constructie.',
      tags: ['telecom', 'zendinstallatie'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'insideExistingStructure', label: 'Wordt de volledige installatie binnen in een bestaand gebouw/constructie geplaatst?', options: yesNoUnknown, default: 'unknown' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];
        if (form.insideExistingStructure === 'no') reasons.push('Deze specifieke vrijstelling geldt enkel voor de volledige installatie binnen in een bestaand gebouw/constructie.');
        if (form.insideExistingStructure === 'unknown') unknowns.push('Onzeker of de volledige installatie binnen een bestaand gebouw/constructie wordt geplaatst.');
        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De opgegeven telecominstallatie valt niet onder deze specifieke vrijstelling.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'De installatie kan vrijgesteld zijn, maar cruciale basisinfo is onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'Deze telecominstallatie lijkt onder de vrijstelling te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'divers-laadpaal',
      title: 'Diverse · elektrische laadpaal op/aan bestaande verharding',
      chapter: 'Hoofdstuk 12/1',
      article: 'Art. 12/1.2',
      description: 'Elektrische laadpalen op of aan bestaande, hoofdzakelijk vergunde of vergund geachte verhardingen.',
      tags: ['laadpaal', 'elektrisch', 'verharding'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'onExistingPermittedPavement', label: 'Komt de laadpaal op/aan bestaande, hoofdzakelijk vergunde of vergund geachte verharding?', options: yesNoUnknown, default: 'unknown' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];
        if (form.onExistingPermittedPavement === 'no') reasons.push('Deze vrijstelling geldt alleen op/aan bestaande, hoofdzakelijk vergunde of vergund geachte verhardingen.');
        if (form.onExistingPermittedPavement === 'unknown') unknowns.push('Onzeker of de verharding hoofdzakelijk vergund of vergund geacht is.');
        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De laadpaal valt niet onder deze specifieke vrijstelling.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'Het kan vrijgesteld zijn, maar de status van de bestaande verharding is onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'De laadpaal lijkt binnen deze vrijstelling te vallen.', reasons, warnings, unknowns);
      }
    },
    {
      id: 'afbraak-vrijstaand-bouwwerk',
      title: 'Afbraak · volledig slopen vrijstaand bouwwerk/constructie',
      chapter: 'Hoofdstuk 13',
      article: 'Art. 13.2',
      description: 'Volledige afbraak van vrijstaande bouwwerken of constructies onder voorwaarden.',
      tags: ['afbraak', 'sloop'],
      fields: [
        ...baseFields,
        { type: 'radio', name: 'hasLocalValue', label: 'Gaat het om een element/constructie met volkskundige, historische, esthetische of referentiewaarde?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'inventoryBuilding', label: 'Is het opgenomen in de inventaris van bouwkundig erfgoed of gelegen in gebied met culturele/historische/esthetische waarde?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'mainlyResidential', label: 'Is het in hoofdzaak residentieel?', options: yesNoUnknown, default: 'unknown' },
        { type: 'radio', name: 'singleFamilyHome', label: 'Is het een eengezinswoning?', options: yesNoUnknown, default: 'unknown' },
        { type: 'number', name: 'volumeM3', label: 'Totaal bouwvolume (m³)', min: 0, step: 1 },
        { type: 'radio', name: 'isInfrastructureWorks', label: 'Gaat het om afbraak in het kader van infrastructuurwerken?', options: yesNoUnknown, default: 'no' }
      ],
      evaluate(form) {
        const g = commonGuards(form);
        const reasons = [...g.reasons];
        const warnings = [...g.warnings];
        const unknowns = [...g.unknowns];
        const vol = num(form.volumeM3);
        if (form.hasLocalValue === 'yes') reasons.push('Constructies met volkskundige, historische, esthetische of referentiewaarde vallen hier niet onder.');
        if (form.inventoryBuilding === 'yes') reasons.push('Constructies in de inventaris bouwkundig erfgoed of in cultuurhistorisch/esthetisch gebied vallen hier niet onder.');
        if (form.hasLocalValue === 'unknown') unknowns.push('Onzeker of de constructie een bijzondere lokale/erfgoedwaarde heeft.');
        if (form.inventoryBuilding === 'unknown') unknowns.push('Onzeker of de constructie in de erfgoedinventaris of een beschermd waardegebied ligt.');
        if (form.isInfrastructureWorks === 'yes' && vol != null && vol > 250) reasons.push('Afbraak in kader van infrastructuurwerken mag maximaal 250 m³ bedragen.');
        if (form.mainlyResidential === 'yes' && form.singleFamilyHome !== 'yes' && vol != null && vol > 5000) reasons.push('Voor in hoofdzaak residentiële gebouwen (uitgezonderd eengezinswoningen) is maximaal 5000 m³ toegestaan.');
        if (form.mainlyResidential === 'no' && vol != null && vol > 1000) reasons.push('Voor niet-residentiële gebouwen/constructies is maximaal 1000 m³ toegestaan.');
        if (reasons.length) return verdict('bad', 'Niet vrijgesteld', this.article, 'De afbraak valt niet binnen de grenzen van deze vrijstelling.', reasons, warnings, unknowns);
        if (unknowns.length) return verdict('warn', 'Manuele check nodig', this.article, 'De volumemaatstaf lijkt mogelijk, maar erfgoed/contextvragen zijn onzeker.', reasons, warnings, unknowns);
        return verdict('ok', 'Waarschijnlijk vrijgesteld', this.article, 'De afbraak lijkt binnen de vrijstellingsvoorwaarden te vallen.', reasons, warnings, unknowns);
      }
    }
  ];

  window.VRIJSTELLINGSCHECKER_RULES = { scenarios, yesNoUnknown };
})();
