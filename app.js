/* ==========================================================================
   EcoCalc Hub - Logic & Interactive Calculations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initEVCalc();
  initSolarCalc();
  initBolloCalc();
});

/* --------------------------------------------------------------------------
   Tab Navigation Handler
   -------------------------------------------------------------------------- */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    const isActive = btn.getAttribute('data-tab') === tabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
}

/* --------------------------------------------------------------------------
   Calculator 1: EV vs Gas
   -------------------------------------------------------------------------- */
function initEVCalc() {
  const kmInput = document.getElementById('ev-km');
  const gasConsInput = document.getElementById('gas-consumption');
  const gasPriceInput = document.getElementById('gas-price');
  const evConsInput = document.getElementById('ev-consumption');
  const evHomeCostInput = document.getElementById('ev-home-cost');
  const evHomePctInput = document.getElementById('ev-home-pct');
  const evPublicCostInput = document.getElementById('ev-public-cost');

  const valKmSpan = document.getElementById('val-ev-km');
  const valHomePctSpan = document.getElementById('val-ev-home-pct');

  function calculateEV() {
    const km = parseFloat(kmInput.value) || 15000;
    const gasCons = parseFloat(gasConsInput.value) || 6.5;
    const gasPrice = parseFloat(gasPriceInput.value) || 1.82;
    const evCons = parseFloat(evConsInput.value) || 15.5;
    const evHomeCost = parseFloat(evHomeCostInput.value) || 0.22;
    const evHomePct = parseFloat(evHomePctInput.value) || 80;
    const evPublicCost = parseFloat(evPublicCostInput.value) || 0.55;

    // Format slider labels
    valKmSpan.textContent = `${km.toLocaleString('it-IT')} km`;
    valHomePctSpan.textContent = `${evHomePct}% Casa / ${100 - evHomePct}% Colonnina`;

    // Gas calculations
    const gasTotalLiters = (km / 100) * gasCons;
    const gasAnnualCost = gasTotalLiters * gasPrice;
    const gasCostPer100km = gasCons * gasPrice;

    // EV calculations
    const weightedEvCostPerKwh = ((evHomePct / 100) * evHomeCost) + (((100 - evHomePct) / 100) * evPublicCost);
    const evTotalKwh = (km / 100) * evCons;
    const evAnnualCost = evTotalKwh * weightedEvCostPerKwh;
    const evCostPer100km = evCons * weightedEvCostPerKwh;

    // Savings
    const netAnnualSavings = Math.max(0, gasAnnualCost - evAnnualCost);
    const pctSaved = gasAnnualCost > 0 ? Math.round((netAnnualSavings / gasAnnualCost) * 100) : 0;
    const co2SavedTons = ((km * 0.145) / 1000).toFixed(1);

    // Update DOM
    document.getElementById('res-ev-annual-savings').textContent = `${Math.round(netAnnualSavings).toLocaleString('it-IT')} €`;
    document.getElementById('res-ev-pct-saved').textContent = `-${pctSaved}% sui costi di pieno`;

    document.getElementById('res-gas-annual').textContent = `${Math.round(gasAnnualCost).toLocaleString('it-IT')} €`;
    document.getElementById('res-gas-100km').textContent = `${gasCostPer100km.toFixed(2).replace('.', ',')} € / 100 km`;

    document.getElementById('res-ev-annual').textContent = `${Math.round(evAnnualCost).toLocaleString('it-IT')} €`;
    document.getElementById('res-ev-100km').textContent = `${evCostPer100km.toFixed(2).replace('.', ',')} € / 100 km`;

    document.getElementById('res-co2-saved').textContent = `${co2SavedTons.replace('.', ',')} tonnellate`;

    // Update Chart Bars
    const sav1y = Math.round(netAnnualSavings);
    const sav5y = Math.round(netAnnualSavings * 5);
    const sav10y = Math.round(netAnnualSavings * 10);

    document.getElementById('bar-val-1y').textContent = `${sav1y.toLocaleString('it-IT')}€`;
    document.getElementById('bar-val-5y').textContent = `${sav5y.toLocaleString('it-IT')}€`;
    document.getElementById('bar-val-10y').textContent = `${sav10y.toLocaleString('it-IT')}€`;

    const maxSav = Math.max(1, sav10y);
    document.getElementById('bar-1y').style.height = `${Math.max(15, (sav1y / maxSav) * 100)}%`;
    document.getElementById('bar-5y').style.height = `${Math.max(15, (sav5y / maxSav) * 100)}%`;
    document.getElementById('bar-10y').style.height = `100%`;
  }

  [kmInput, gasConsInput, gasPriceInput, evConsInput, evHomeCostInput, evHomePctInput, evPublicCostInput].forEach(elem => {
    elem.addEventListener('input', calculateEV);
  });

  calculateEV();
}

/* --------------------------------------------------------------------------
   Calculator 2: Solar & Battery ROI
   -------------------------------------------------------------------------- */
function initSolarCalc() {
  const billInput = document.getElementById('solar-bill');
  const zoneSelect = document.getElementById('solar-zone');
  const batterySelect = document.getElementById('solar-battery');
  const costInput = document.getElementById('solar-cost');
  const taxCreditInput = document.getElementById('solar-tax-credit');

  const valBillSpan = document.getElementById('val-solar-bill');

  function calculateSolar() {
    const monthlyBill = parseFloat(billInput.value) || 120;
    const insolationZone = parseFloat(zoneSelect.value) || 1400;
    const hasBattery = batterySelect.value === 'yes';
    const totalCost = parseFloat(costInput.value) || 7500;
    const taxCreditPct = parseFloat(taxCreditInput.value) || 50;

    valBillSpan.textContent = `${monthlyBill} €/mese`;

    const annualBill = monthlyBill * 12;

    // Estimate autoconsumption %
    const autoconsumptionRate = hasBattery ? 0.75 : 0.40;

    // Estimate required kWp: (annual kWh needed = annualBill / 0.28€ per kWh) / insolationZone
    const annualKwhNeeded = annualBill / 0.27;
    let kwpRecommended = (annualKwhNeeded / insolationZone);
    kwpRecommended = Math.max(2.0, Math.min(15.0, Math.round(kwpRecommended * 2) / 2)); // Round to nearest 0.5 kWp

    const batterySizeKwh = hasBattery ? Math.round(kwpRecommended * 1.5) : 0;

    // Annual savings in bill
    const annualSavings = annualBill * autoconsumptionRate;

    // Net cost after tax deduction
    const netCost = totalCost * (1 - (taxCreditPct / 100));

    // ROI Payback
    const paybackYears = annualSavings > 0 ? (netCost / annualSavings).toFixed(1) : 0;
    const savings20y = Math.round((annualSavings * 20) - netCost);

    // Update DOM
    document.getElementById('res-solar-payback').textContent = `${paybackYears.replace('.', ',')} Anni`;
    document.getElementById('res-solar-kwp').textContent = `${kwpRecommended.toFixed(1).replace('.', ',')} kWp`;
    document.getElementById('res-solar-battery-size').textContent = hasBattery ? `+ Accumulo ${batterySizeKwh} kWh` : 'Senza Accumulo';
    
    document.getElementById('res-solar-annual-savings').textContent = `${Math.round(annualSavings).toLocaleString('it-IT')} €`;
    document.getElementById('res-solar-autoconsump').textContent = `Autoconsumo stimato ${Math.round(autoconsumptionRate * 100)}%`;

    document.getElementById('res-solar-net-cost').textContent = `${Math.round(netCost).toLocaleString('it-IT')} €`;
    document.getElementById('res-solar-20y-savings').textContent = `${Math.max(0, savings20y).toLocaleString('it-IT')} €`;
  }

  [billInput, zoneSelect, batterySelect, costInput, taxCreditInput].forEach(elem => {
    elem.addEventListener('input', calculateSolar);
  });

  calculateSolar();
}

/* --------------------------------------------------------------------------
   Calculator 3: Bollo Auto & TCO
   -------------------------------------------------------------------------- */
function initBolloCalc() {
  const powerTypeSelect = document.getElementById('car-power-type');
  const powerValInput = document.getElementById('car-power-val');
  const fuelTypeSelect = document.getElementById('car-fuel-type');
  const euroSelect = document.getElementById('car-euro');
  const insuranceInput = document.getElementById('car-insurance');
  const maintInput = document.getElementById('car-maintenance');

  const convertedSpan = document.getElementById('power-converted');

  function calculateBollo() {
    const pType = powerTypeSelect.value;
    let powerVal = parseFloat(powerValInput.value) || 100;
    const fuel = fuelTypeSelect.value;
    const euro = euroSelect.value;
    const insurance = parseFloat(insuranceInput.value) || 0;
    const maint = parseFloat(maintInput.value) || 0;

    let kw = powerVal;
    let cv = powerVal;

    if (pType === 'cv') {
      kw = Math.round(powerVal / 1.35962);
      convertedSpan.textContent = `≈ ${kw} kW`;
    } else {
      cv = Math.round(powerVal * 1.35962);
      convertedSpan.textContent = `≈ ${cv} CV`;
    }

    let baseRateKwp100 = 2.58;
    let extraRateKwpOver100 = 3.87;

    switch (euro) {
      case 'euro6': baseRateKwp100 = 2.58; extraRateKwpOver100 = 3.87; break;
      case 'euro5': baseRateKwp100 = 2.70; extraRateKwpOver100 = 4.05; break;
      case 'euro4': baseRateKwp100 = 2.90; extraRateKwpOver100 = 4.35; break;
      case 'euro3': baseRateKwp100 = 3.10; extraRateKwpOver100 = 4.65; break;
      case 'euro0-2': baseRateKwp100 = 3.50; extraRateKwpOver100 = 5.25; break;
    }

    let bolloAmount = 0;
    let superbollo = 0;

    if (fuel === 'electric') {
      bolloAmount = 0; // Esenzione 5 anni
    } else if (fuel === 'hybrid') {
      // 50% discount in many regions
      const baseKw = Math.min(kw, 100);
      const extraKw = Math.max(0, kw - 100);
      bolloAmount = ((baseKw * baseRateKwp100) + (extraKw * extraRateKwpOver100)) * 0.5;
    } else {
      const baseKw = Math.min(kw, 100);
      const extraKw = Math.max(0, kw - 100);
      bolloAmount = (baseKw * baseRateKwp100) + (extraKw * extraRateKwpOver100);
    }

    // Superbollo (> 185 kW)
    if (kw > 185 && fuel !== 'electric') {
      superbollo = (kw - 185) * 20;
    }

    const totalBolloPlusSuper = Math.round(bolloAmount + superbollo);
    const tcoTotal = totalBolloPlusSuper + insurance + maint;
    const tcoMonthly = (tcoTotal / 12).toFixed(2);

    // Update DOM
    document.getElementById('res-bollo-amount').textContent = `${totalBolloPlusSuper.toLocaleString('it-IT')} €`;

    const superBadge = document.getElementById('res-superbollo-badge');
    if (superbollo > 0) {
      superBadge.textContent = `Incluso Superbollo di ${superbollo}€ (${kw - 185} kW eccedenti)`;
      superBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      superBadge.style.color = 'var(--accent-red)';
    } else if (fuel === 'electric') {
      superBadge.textContent = `Esenzione 100% Bollo (Primi 5 Anni)`;
      superBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      superBadge.style.color = 'var(--accent-green)';
    } else {
      superBadge.textContent = `Superbollo non dovuto (≤ 185 kW)`;
      superBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      superBadge.style.color = 'var(--accent-green)';
    }

    document.getElementById('res-tco-total').textContent = `${tcoTotal.toLocaleString('it-IT')} € / anno`;
    document.getElementById('res-tco-monthly').textContent = `${tcoMonthly.replace('.', ',')} € / mese`;
  }

  [powerTypeSelect, powerValInput, fuelTypeSelect, euroSelect, insuranceInput, maintInput].forEach(elem => {
    elem.addEventListener('input', calculateBollo);
  });

  calculateBollo();
}
