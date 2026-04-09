(function () {
  const { scenarios, yesNoUnknown } = window.VRIJSTELLINGSCHECKER_RULES;
  const scenarioSelect = document.getElementById('scenarioSelect');
  const scenarioMeta = document.getElementById('scenarioMeta');
  const checkerForm = document.getElementById('checkerForm');
  const resultEl = document.getElementById('result');
  const evaluateBtn = document.getElementById('evaluateBtn');
  const resetBtn = document.getElementById('resetBtn');

  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    });
    ([]).concat(children).forEach((child) => child && el.appendChild(child));
    return el;
  }

  function renderScenarioOptions() {
    scenarioSelect.innerHTML = '';
    scenarios.forEach((s) => {
      const option = h('option', { value: s.id, text: `${s.title} (${s.article})` });
      scenarioSelect.appendChild(option);
    });
  }

  function fieldWrapper(field) {
    return h('div', { class: 'field', 'data-name': field.name });
  }

  function renderField(field, currentValue) {
    const wrap = fieldWrapper(field);
    const label = h('label', { for: field.name, text: field.label });
    wrap.appendChild(label);
    if (field.help) wrap.appendChild(h('div', { class: 'help', text: field.help }));

    if (field.type === 'number' || field.type === 'text') {
      const input = h('input', {
        id: field.name,
        name: field.name,
        type: field.type,
        min: field.min ?? '',
        step: field.step ?? 'any',
        value: currentValue ?? ''
      });
      wrap.appendChild(input);
      return wrap;
    }

    if (field.type === 'select') {
      const select = h('select', { id: field.name, name: field.name });
      field.options.forEach((opt) => {
        const option = h('option', { value: opt.value, text: opt.label });
        if ((currentValue ?? field.default) === opt.value) option.selected = true;
        select.appendChild(option);
      });
      wrap.appendChild(select);
      return wrap;
    }

    const container = h('div', { class: field.type === 'checkbox' ? 'check-group' : 'radio-group' });
    field.options.forEach((opt) => {
      const id = `${field.name}-${opt.value}`;
      const line = h('label');
      const input = h('input', {
        id,
        name: field.name,
        type: field.type === 'checkbox' ? 'checkbox' : 'radio',
        value: opt.value
      });
      if ((currentValue ?? field.default) === opt.value) input.checked = true;
      line.appendChild(input);
      line.appendChild(document.createTextNode(` ${opt.label}`));
      container.appendChild(line);
    });
    wrap.appendChild(container);
    return wrap;
  }

  function currentScenario() {
    return scenarios.find((s) => s.id === scenarioSelect.value) || scenarios[0];
  }

  function renderScenario() {
    const scenario = currentScenario();
    checkerForm.innerHTML = '';
    scenarioMeta.innerHTML = `
      <div><strong>${scenario.chapter}</strong></div>
      <div>${scenario.article}</div>
      <div class="small">${scenario.description}</div>
      <div class="chips">${scenario.tags.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
    `;

    const infoFieldset = h('fieldset');
    infoFieldset.appendChild(h('legend', { text: 'Context en basisvoorwaarden' }));
    const specificFieldset = h('fieldset');
    specificFieldset.appendChild(h('legend', { text: 'Specifieke scenario-invoer' }));

    scenario.fields.forEach((field, index) => {
      const target = index < 5 ? infoFieldset : specificFieldset;
      target.appendChild(renderField(field));
    });

    checkerForm.appendChild(infoFieldset);
    checkerForm.appendChild(specificFieldset);
    resultEl.className = 'result hidden';
    resultEl.innerHTML = '';
  }

  function collectFormData() {
    const scenario = currentScenario();
    const form = {};
    scenario.fields.forEach((field) => {
      if (field.type === 'number' || field.type === 'text' || field.type === 'select') {
        form[field.name] = document.getElementById(field.name)?.value ?? '';
      } else {
        const checked = checkerForm.querySelector(`[name="${field.name}"]:checked`);
        form[field.name] = checked ? checked.value : (field.default ?? '');
      }
    });
    return form;
  }

  function list(items) {
    if (!items || !items.length) return '<p class="small muted">Geen.</p>';
    return `<ul class="clean">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  }

  function renderResult(output) {
    const cls = output.status === 'ok' ? 'ok' : output.status === 'bad' ? 'bad' : 'warn';
    const badgeText = output.status === 'ok' ? 'Waarschijnlijk vrijgesteld' : output.status === 'bad' ? 'Niet vrijgesteld' : 'Manuele check nodig';
    resultEl.className = `result ${cls}`;
    resultEl.innerHTML = `
      <div class="badge ${cls}">${badgeText}</div>
      <h3>${output.title}</h3>
      <p><strong>Juridische basis:</strong> ${output.article}</p>
      <p>${output.summary}</p>
      <h4>Harde tegenindicaties</h4>
      ${list(output.reasons)}
      <h4>Waarschuwingen</h4>
      ${list(output.warnings)}
      <h4>Onzekere punten</h4>
      ${list(output.unknowns)}
      <hr />
      <p class="small muted">
        Let op: de checker is bewust conservatief. Bij onzekere antwoorden of complexe context krijg je
        <strong>manuele check nodig</strong> in plaats van een te stellige conclusie.
      </p>
    `;
  }

  scenarioSelect.addEventListener('change', renderScenario);
  evaluateBtn.addEventListener('click', () => {
    const scenario = currentScenario();
    const data = collectFormData();
    const output = scenario.evaluate(data);
    renderResult(output);
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  resetBtn.addEventListener('click', renderScenario);

  renderScenarioOptions();
  renderScenario();
})();
