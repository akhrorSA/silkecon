// ─── BUDGET CALCULATOR ───────────────────────────────────────────────────────
 
const TASHKENT_BENCHMARKS = {
  food: 0.28,       // 28% of income on groceries
  transport: 0.10,  // 10% transport
  utilities: 0.08,  // 8% utilities + internet
  personal: 0.09,   // 9% personal/leisure
};
 
function fmt(n) {
  return new Intl.NumberFormat('ru-UZ').format(Math.round(n)) + ' UZS';
}
 
function calcBudget() {
  const salary = parseFloat(document.getElementById('salary').value) || 0;
  const rent = parseFloat(document.getElementById('rent').value) || 0;
  const savingsPct = parseFloat(document.getElementById('savings-pct').value) || 10;
 
  if (salary <= 0) { document.getElementById('budget-result').style.display = 'none'; return; }
 
  const savingsAmt = salary * (savingsPct / 100);
  const rentPct = (rent / salary) * 100;
  const foodAmt = salary * TASHKENT_BENCHMARKS.food;
  const transportAmt = salary * TASHKENT_BENCHMARKS.transport;
  const utilitiesAmt = salary * TASHKENT_BENCHMARKS.utilities;
  const personalAmt = salary * TASHKENT_BENCHMARKS.personal;
 
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
 
  document.getElementById('budget-result').style.display = 'block';
 
  const barsHtml = bars.map(b => `
    <div class="bar-row">
      <div class="bar-label">${b.label}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.min(b.pct, 100)}%; background:${b.color}"></div>
      </div>
      <div class="bar-pct" style="color:${b.color}">${Math.round(b.pct)}%</div>
    </div>
    <div style="font-size:12px; color:#9B9690; margin:-6px 0 4px 112px">${fmt(b.amt)}</div>
  `).join('');
 
  document.getElementById('budget-bars').innerHTML = barsHtml;
 
  let verdict, cls;
  if (leftover < 0) {
    verdict = `⚠️ <strong>Your expenses exceed your income by ${fmt(Math.abs(leftover))}.</strong> Based on Tashkent averages, your rent is ${rentPct > 40 ? 'very high — ideally rent should be under 30% of income' : 'manageable'}. Consider reducing personal spending first.`;
    cls = 'verdict-bad';
  } else if (leftoverPct < 5) {
    verdict = `🟡 <strong>You're breaking even, but barely.</strong> You have only ${fmt(leftover)} left after essentials. One unexpected expense could put you in deficit. Try to cut 5% from food or personal spending.`;
    cls = 'verdict-warn';
  } else {
    verdict = `✅ <strong>Your budget is sustainable.</strong> You have ${fmt(leftover)} (${Math.round(leftoverPct)}%) free each month. Consider increasing your savings rate or building a 3-month emergency fund (${fmt(totalFixed * 3)}).`;
    cls = 'verdict-ok';
  }
 
  document.getElementById('budget-verdict').innerHTML = verdict;
  document.getElementById('budget-verdict').className = 'result-verdict ' + cls;
}
 
// ─── LOAN TRAP DETECTOR ──────────────────────────────────────────────────────
 
function calcLoan() {
  const principal = parseFloat(document.getElementById('loan-amount').value) || 0;
  const monthly = parseFloat(document.getElementById('loan-payment').value) || 0;
  const months = parseFloat(document.getElementById('loan-months').value) || 0;
 
  if (principal <= 0 || monthly <= 0 || months <= 0) {
    document.getElementById('loan-result').style.display = 'none'; return;
  }
 
  const totalPaid = monthly * months;
  const totalInterest = totalPaid - principal;
  const interestPct = (totalInterest / principal) * 100;
 
  // Approximate APR using Newton's method
  let r = 0.01;
  for (let i = 0; i < 100; i++) {
    const f = r * Math.pow(1+r, months) / (Math.pow(1+r,months)-1) - monthly/principal;
    const df = (Math.pow(1+r,months)*(1+r*months) - Math.pow(1+r,months)*r*months - 1) /
               Math.pow(Math.pow(1+r,months)-1, 2);
    r = r - f/df;
    if (Math.abs(f) < 1e-10) break;
  }
  const aprPct = r * 12 * 100;
 
  document.getElementById('loan-result').style.display = 'block';
 
  document.getElementById('loan-facts').innerHTML = `
    <div class="loan-fact">
      <div class="loan-fact-label">Total you pay</div>
      <div class="loan-fact-val" style="color:#C0392B">${fmt(totalPaid)}</div>
    </div>
    <div class="loan-fact">
      <div class="loan-fact-label">Total interest</div>
      <div class="loan-fact-val" style="color:#C0392B">${fmt(totalInterest)}</div>
    </div>
    <div class="loan-fact">
      <div class="loan-fact-label">Interest rate</div>
      <div class="loan-fact-val" style="color:#C0392B">${interestPct.toFixed(1)}%</div>
    </div>
    <div class="loan-fact">
      <div class="loan-fact-label">True APR</div>
      <div class="loan-fact-val" style="color:${aprPct > 30 ? '#C0392B' : '#0A6B5E'}">${aprPct.toFixed(1)}%</div>
    </div>
  `;
 
  let verdict, cls;
  if (aprPct > 50) {
    verdict = `🚨 <strong>This loan is extremely expensive.</strong> A ${aprPct.toFixed(0)}% annual rate means you're paying ${fmt(totalInterest)} just in interest. This is common with Uzum Nasiya and Payme installments. If possible, save up instead or find a bank loan below 25% APR.`;
    cls = 'verdict-bad';
  } else if (aprPct > 25) {
    verdict = `⚠️ <strong>This loan is expensive but common in Uzbekistan.</strong> Try to pay it off early if possible — every month you save reduces total interest. Avoid taking another loan while this is active.`;
    cls = 'verdict-warn';
  } else {
    verdict = `✅ <strong>This is a reasonable loan by Uzbek standards.</strong> A ${aprPct.toFixed(0)}% APR is below average. Just make sure your monthly payment (${fmt(monthly)}) is under 20% of your income.`;
    cls = 'verdict-ok';
  }
 
  document.getElementById('loan-verdict').innerHTML = verdict;
  document.getElementById('loan-verdict').className = 'result-verdict ' + cls;
}
 
// ─── CAN I AFFORD IT SIMULATOR ───────────────────────────────────────────────
 
function calcSim() {
  const income = parseFloat(document.getElementById('sim-income').value) || 0;
  const goal = parseFloat(document.getElementById('sim-goal').value) || 0;
  const expenses = parseFloat(document.getElementById('sim-expenses').value) || 0;
 
  if (income <= 0 || goal <= 0) { document.getElementById('sim-result').style.display = 'none'; return; }
 
  const monthlySavings = income - expenses;
  if (monthlySavings <= 0) {
    document.getElementById('sim-result').style.display = 'block';
    document.getElementById('sim-facts').innerHTML = `
      <div class="sim-fact" style="background:var(--red-light); border-color:rgba(192,57,43,0.2)">
        <div class="sim-fact-label" style="color:var(--red)">Problem</div>
        <div class="sim-fact-val" style="color:var(--red); font-size:16px">Expenses exceed income</div>
      </div>
      <div class="sim-fact" style="background:var(--red-light); border-color:rgba(192,57,43,0.2)">
        <div class="sim-fact-label" style="color:var(--red)">Deficit/month</div>
        <div class="sim-fact-val" style="color:var(--red); font-size:18px">${fmt(Math.abs(monthlySavings))}</div>
      </div>
    `;
    return;
  }
 
  const monthsNeeded = Math.ceil(goal / monthlySavings);
  const yearsNeeded = (monthsNeeded / 12).toFixed(1);
  const savingsRate = ((monthlySavings / income) * 100).toFixed(0);
 
  // With 10% savings boost
  const boostedSavings = monthlySavings * 1.1;
  const boostedMonths = Math.ceil(goal / boostedSavings);
 
  document.getElementById('sim-result').style.display = 'block';
  document.getElementById('sim-facts').innerHTML = `
    <div class="sim-fact">
      <div class="sim-fact-label">Monthly surplus</div>
      <div class="sim-fact-val">${fmt(monthlySavings)}</div>
    </div>
    <div class="sim-fact">
      <div class="sim-fact-label">Time to goal</div>
      <div class="sim-fact-val">${monthsNeeded} months</div>
    </div>
    <div class="sim-fact">
      <div class="sim-fact-label">That's</div>
      <div class="sim-fact-val">${yearsNeeded} years</div>
    </div>
    <div class="sim-fact" style="background:rgba(10,107,94,0.2)">
      <div class="sim-fact-label">Cut 10% expenses → save in</div>
      <div class="sim-fact-val">${boostedMonths} months</div>
    </div>
  `;
}
 
// ─── AI CHAT ─────────────────────────────────────────────────────────────────
 
const SYSTEM = `You are SilkEcon Advisor, an AI personal finance assistant built specifically for people living in Uzbekistan. You were created by a young Uzbek economics student as a free public tool.
 
Your expertise:
- You speak about money in UZS (Uzbek sum), and understand local fintech: Payme, Click, Uzum, Hambi, Oson.
- You know local banks: Kapitalbank, Ipoteka Bank, Hamkorbank, TBC UZ, Xalq Bank.
- You understand that average Uzbek salaries are 4-6 million UZS/month, rent in Tashkent is 1.5-3.5M UZS/month, and inflation is ~7-8% annually.
- You give practical, specific, actionable advice rooted in Uzbek economic reality — not generic Western advice about 401Ks or dollar-denominated investments.
- You can respond in English or Uzbek depending on what the user writes.
- You are warm, non-judgmental, and encouraging. Many users have never received financial guidance.
- Keep responses concise: 2-4 short paragraphs max. Use simple language.
- End each response with one concrete action the person can take today.
- Never make up specific interest rates or bank offers — say "check the current rate" when needed.`;
 
let chatHistory = [];
let chatLoading = false;
 
function scrollChat() {
  const box = document.getElementById('chat-box');
  box.scrollTop = box.scrollHeight;
}
 
function addMsg(role, text) {
  const box = document.getElementById('chat-box');
  const d = document.createElement('div');
  d.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
  const label = role === 'user' ? 'You' : 'SE';
  d.innerHTML = `<div class="avatar">${label}</div><div class="bubble">${text.replace(/\n/g,'<br/>')}</div>`;
  box.appendChild(d);
  scrollChat();
}
 
function showTyping() {
  const box = document.getElementById('chat-box');
  const d = document.createElement('div');
  d.className = 'msg bot'; d.id = 'typing';
  d.innerHTML = `<div class="avatar">SE</div><div class="bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
  box.appendChild(d); scrollChat();
}
 
function removeTyping() {
  const el = document.getElementById('typing');
  if (el) el.remove();
}
 
function fillSend(text) {
  document.getElementById('chat-input').value = text;
  sendChat();
}
 
async function sendChat() {
  if (chatLoading) return;
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
 
  input.value = '';
  chatLoading = true;
  document.getElementById('send-btn').disabled = true;
  document.getElementById('chat-chips').style.display = 'none';
 
  addMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  showTyping();
 
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM,
        messages: chatHistory
      })
    });
    const data = await res.json();
    removeTyping();
    const reply = data.content?.[0]?.text || 'Sorry, I had trouble responding. Please try again.';
    chatHistory.push({ role: 'assistant', content: reply });
    addMsg('bot', reply);
  } catch {
    removeTyping();
    addMsg('bot', 'Connection issue. Please try again.');
  }
 
  chatLoading = false;
  document.getElementById('send-btn').disabled = false;
}