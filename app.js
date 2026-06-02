// ─── SILKECON SAFE ENGINE (FIXED) ───────────────────────────────────────────

// =====================
// UTIL
// =====================
function fmt(n) {
  return new Intl.NumberFormat('ru-UZ').format(Math.round(n)) + ' UZS';
}

function el(id) {
  return document.getElementById(id);
}

// =====================
// BUDGET CALCULATOR
// =====================
const TASHKENT_BENCHMARKS = {
  food: 0.28,
  transport: 0.10,
  utilities: 0.08,
  personal: 0.09,
};

function calcBudget() {
  const salary = parseFloat(el('salary')?.value) || 0;
  const rent = parseFloat(el('rent')?.value) || 0;
  const savingsPct = parseFloat(el('savings-pct')?.value) || 10;

  const resultBox = el('budget-result');
  const barsBox = el('budget-bars');
  const verdictBox = el('budget-verdict');

  if (!resultBox || !barsBox || !verdictBox) return;

  if (salary <= 0) {
    resultBox.style.display = 'none';
    return;
  }

  const savingsAmt = salary * (savingsPct / 100);

  const foodAmt = salary * TASHKENT_BENCHMARKS.food;
  const transportAmt = salary * TASHKENT_BENCHMARKS.transport;
  const utilitiesAmt = salary * TASHKENT_BENCHMARKS.utilities;
  const personalAmt = salary * TASHKENT_BENCHMARKS.personal;

  const rentPct = (rent / salary) * 100 || 0;

  const totalFixed = rent + savingsAmt + foodAmt + transportAmt + utilitiesAmt + personalAmt;
  const leftover = salary - totalFixed;
  const leftoverPct = (leftover / salary) * 100;

  const bars = [
    { label: 'Rent', amt: rent, pct: rentPct, color: '#C8A96E' },
    { label: 'Food', amt: foodAmt, pct: TASHKENT_BENCHMARKS.food * 100, color: '#0A6B5E' },
    { label: 'Transport', amt: transportAmt, pct: TASHKENT_BENCHMARKS.transport * 100, color: '#5B8DB8' },
    { label: 'Utilities', amt: utilitiesAmt, pct: TASHKENT_BENCHMARKS.utilities * 100, color: '#8B7355' },
    { label: 'Personal', amt: personalAmt, pct: TASHKENT_BENCHMARKS.personal * 100, color: '#9B6B9B' },
    { label: 'Savings', amt: savingsAmt, pct: savingsPct, color: '#2ECC71' },
    { label: 'Free', amt: Math.max(leftover, 0), pct: Math.max(leftoverPct, 0), color: '#E8E4DC' },
  ];

  resultBox.style.display = 'block';

  barsBox.innerHTML = bars.map(b => `
    <div class="bar-row">
      <div class="bar-label">${b.label}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.min(b.pct, 100)}%; background:${b.color}"></div>
      </div>
      <div class="bar-pct">${Math.round(b.pct)}%</div>
    </div>
    <div style="font-size:12px; margin-left:112px; color:#999;">
      ${fmt(b.amt)}
    </div>
  `).join('');

  if (leftover < 0) {
    verdictBox.className = 'result-verdict verdict-bad';
    verdictBox.innerHTML = `⚠️ Expenses exceed income by ${fmt(Math.abs(leftover))}`;
  } else if (leftoverPct < 5) {
    verdictBox.className = 'result-verdict verdict-warn';
    verdictBox.innerHTML = `🟡 Very tight budget — only ${fmt(leftover)} left`;
  } else {
    verdictBox.className = 'result-verdict verdict-ok';
    verdictBox.innerHTML = `✅ Healthy budget — ${fmt(leftover)} free monthly`;
  }
}

// =====================
// LOAN (SAFE SIMPLE VERSION)
// =====================
function calcLoan() {
  const principal = parseFloat(el('loan-amount')?.value) || 0;
  const monthly = parseFloat(el('loan-payment')?.value) || 0;
  const months = parseFloat(el('loan-months')?.value) || 0;

  const result = el('loan-result');
  const facts = el('loan-facts');
  const verdict = el('loan-verdict');

  if (!result || !facts || !verdict) return;

  if (!principal || !monthly || !months) {
    result.style.display = 'none';
    return;
  }

  const total = monthly * months;
  const interest = total - principal;
  const pct = (interest / principal) * 100;

  result.style.display = 'block';

  facts.innerHTML = `
    <div class="loan-fact">
      <div class="loan-fact-label">Total pay</div>
      <div class="loan-fact-val">${fmt(total)}</div>
    </div>
    <div class="loan-fact">
      <div class="loan-fact-label">Interest</div>
      <div class="loan-fact-val">${fmt(interest)}</div>
    </div>
    <div class="loan-fact">
      <div class="loan-fact-label">Markup</div>
      <div class="loan-fact-val">${pct.toFixed(1)}%</div>
    </div>
  `;

  if (pct > 50) {
    verdict.className = 'result-verdict verdict-bad';
    verdict.innerHTML = `🚨 Very expensive loan`;
  } else if (pct > 25) {
    verdict.className = 'result-verdict verdict-warn';
    verdict.innerHTML = `⚠️ Moderate risk loan`;
  } else {
    verdict.className = 'result-verdict verdict-ok';
    verdict.innerHTML = `✅ Reasonable loan`;
  }
}

// =====================
// SIMULATOR
// =====================
function calcSim() {
  const income = parseFloat(el('sim-income')?.value) || 0;
  const goal = parseFloat(el('sim-goal')?.value) || 0;
  const expenses = parseFloat(el('sim-expenses')?.value) || 0;

  const result = el('sim-result');
  const facts = el('sim-facts');

  if (!result || !facts) return;

  if (!income || !goal) {
    result.style.display = 'none';
    return;
  }

  const save = income - expenses;

  result.style.display = 'block';

  if (save <= 0) {
    facts.innerHTML = `
      <div class="sim-fact">
        <div class="sim-fact-label">Problem</div>
        <div class="sim-fact-val">Negative cashflow</div>
      </div>
    `;
    return;
  }

  const months = Math.ceil(goal / save);

  facts.innerHTML = `
    <div class="sim-fact">
      <div class="sim-fact-label">Monthly save</div>
      <div class="sim-fact-val">${fmt(save)}</div>
    </div>
    <div class="sim-fact">
      <div class="sim-fact-label">Time</div>
      <div class="sim-fact-val">${months} months</div>
    </div>
  `;
}

// =====================
// IMPORTANT
// =====================
// Make sure your HTML buttons call:
// onchange="calcBudget()"
// onchange="calcLoan()"
// onchange="calcSim()"