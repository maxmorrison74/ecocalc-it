/* ==========================================================================
   EcoCalc Hub - CAF Online, Insurance Hub & Energy Calculators
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initStipendioCalc();
  initPartitaIvaCalc();
  initMutuoCalc();
  initTFRNASpICalc();
  initInsuranceCalc();
  initEVCalc();
  initSolarCalc();
  initBolloCalc();
  initGDPRCookies();
});

/* --------------------------------------------------------------------------
   GDPR Cookie & Modal Handler
   -------------------------------------------------------------------------- */
function initGDPRCookies() {
  const consent = localStorage.getItem('ecocalc_cookie_consent');
  const banner = document.getElementById('cookie-banner');

  if (!consent && banner) {
    banner.style.display = 'block';
  } else if (banner) {
    banner.style.display = 'none';
  }
}

function openCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.style.display = 'block';
}

function acceptCookies(type) {
  let savedConsent = type;

  if (type === 'custom') {
    const analyticsChecked = document.getElementById('cookie-analytics-toggle')?.checked;
    savedConsent = analyticsChecked ? 'all' : 'necessary';
  }

  localStorage.setItem('ecocalc_cookie_consent', savedConsent);
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.style.display = 'none';
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
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
   CAF Calculator 1: Stipendio Netto RAL (IRPEF 2026)
   -------------------------------------------------------------------------- */
function applyRALPreset(ralValue) {
  const ralInput = document.getElementById('ral-val');
  document.querySelectorAll('#stipendio-calc .preset-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  ralInput.value = ralValue;
  ralInput.dispatchEvent(new Event('input'));
}

function initStipendioCalc() {
  const ralInput = document.getElementById('ral-val');
  const mensilitaSelect = document.getElementById('ral-mensilita');
  const regioneSelect = document.getElementById('ral-regione');
  const figliInput = document.getElementById('ral-figli');
  const contrattoSelect = document.getElementById('ral-tipo-contratto');

  const valRalSpan = document.getElementById('val-ral-display');

  function calculateStipendio() {
    const ral = parseFloat(ralInput.value) || 28000;
    const mensilita = parseInt(mensilitaSelect.value) || 13;
    const regione = regioneSelect.value;
    const figli = parseInt(figliInput.value) || 0;
    const tipoContratto = contrattoSelect.value;

    valRalSpan.textContent = `${ral.toLocaleString('it-IT')} €`;

    const inpsRate = tipoContratto === 'apprendistato' ? 0.0584 : 0.0919;
    const inpsAnnuo = ral * inpsRate;

    const imponibileIrpef = ral - inpsAnnuo;

    let irpefLorda = 0;
    if (imponibileIrpef <= 28000) {
      irpefLorda = imponibileIrpef * 0.23;
    } else if (imponibileIrpef <= 50000) {
      irpefLorda = (28000 * 0.23) + ((imponibileIrpef - 28000) * 0.35);
    } else {
      irpefLorda = (28000 * 0.23) + ((50000 - 28000) * 0.35) + ((imponibileIrpef - 50000) * 0.43);
    }

    let detrazioneLavoro = 0;
    if (imponibileIrpef <= 15000) {
      detrazioneLavoro = 1955;
    } else if (imponibileIrpef <= 28000) {
      detrazioneLavoro = 1955 + (700 * (28000 - imponibileIrpef) / 13000);
    } else if (imponibileIrpef <= 50000) {
      detrazioneLavoro = 1910 * ((50000 - imponibileIrpef) / 22000);
    }

    const irpefNetta = Math.max(0, irpefLorda - detrazioneLavoro);

    let addizionaleRate = 0.0173;
    if (regione === 'piemonte' || regione === 'campania') addizionaleRate = 0.0203;
    const addizionaliRegionali = imponibileIrpef * addizionaleRate;

    const nettoAnnuo = Math.max(0, ral - inpsAnnuo - irpefNetta - addizionaliRegionali);
    const nettoMensile = nettoAnnuo / mensilita;

    const aliquotaMedia = ral > 0 ? ((irpefNetta + addizionaliRegionali) / ral * 100).toFixed(1) : 0;
    const quotaNettaPct = ral > 0 ? (nettoAnnuo / ral * 100).toFixed(1) : 0;

    document.getElementById('res-netto-mensile').textContent = `${Math.round(nettoMensile).toLocaleString('it-IT')} €`;
    document.getElementById('res-mensilita-badge').textContent = `Su ${mensilita} mensilità ordinarie`;

    document.getElementById('res-netto-annuo').textContent = `${Math.round(nettoAnnuo).toLocaleString('it-IT')} €`;
    document.getElementById('res-inps-annuo').textContent = `${Math.round(inpsAnnuo).toLocaleString('it-IT')} €`;
    document.getElementById('res-inps-pct').textContent = `Aliquota INPS ${(inpsRate * 100).toFixed(2)}%`;

    document.getElementById('res-irpef-annua').textContent = `${Math.round(irpefNetta + addizionaliRegionali).toLocaleString('it-IT')} €`;
    document.getElementById('res-aliquota-media').textContent = `Aliquota Effettiva ~${aliquotaMedia}%`;

    document.getElementById('res-quota-netta-pct').textContent = `${quotaNettaPct.replace('.', ',')}%`;
  }

  [ralInput, mensilitaSelect, regioneSelect, figliInput, contrattoSelect].forEach(elem => {
    elem.addEventListener('input', calculateStipendio);
  });

  calculateStipendio();
}

function copyStipendioReport() {
  const mensile = document.getElementById('res-netto-mensile').textContent;
  const annuo = document.getElementById('res-netto-annuo').textContent;
  const textToCopy = `💼 Report Calcolo Stipendio Netto EcoCalc.it:\nNetto Mensile: ${mensile}\nNetto Annuo: ${annuo}\nCalcola il tuo stipendio su https://ecocalc.it`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('✅ Risultati Busta Paga copiati negli appunti!');
  }).catch(() => {
    alert(textToCopy);
  });
}

/* --------------------------------------------------------------------------
   Calculator: Partita IVA Forfettaria
   -------------------------------------------------------------------------- */
function applyPIVAPreset(fatturato) {
  const input = document.getElementById('piva-fatturato');
  document.querySelectorAll('#piva-calc .preset-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');

  input.value = fatturato;
  input.dispatchEvent(new Event('input'));
}

function initPartitaIvaCalc() {
  const fatInput = document.getElementById('piva-fatturato');
  const coeffSelect = document.getElementById('piva-coeff');
  const impostaSelect = document.getElementById('piva-imposta');
  const cassaSelect = document.getElementById('piva-cassa');
  const valFatSpan = document.getElementById('val-piva-fatturato');

  function calculatePIVA() {
    const fatturato = parseFloat(fatInput.value) || 30000;
    const coeff = parseFloat(coeffSelect.value) || 0.78;
    const impostaRate = parseFloat(impostaSelect.value) || 0.05;
    const cassa = cassaSelect.value;

    valFatSpan.textContent = `${fatturato.toLocaleString('it-IT')} €`;

    const imponibile = fatturato * coeff;

    let inps = 0;
    let inpsLabel = '';

    if (cassa === 'gestione_separata') {
      inps = imponibile * 0.2607;
      inpsLabel = 'INPS Gestione Separata (26,07%)';
    } else if (cassa === 'artigiani_commercianti') {
      const minimale = 18415;
      const fisso = 4515;
      if (imponibile <= minimale) {
        inps = fisso;
      } else {
        inps = fisso + ((imponibile - minimale) * 0.2448);
      }
      inpsLabel = 'INPS Artigiani/Commercianti';
    } else {
      inps = imponibile * 0.15;
      inpsLabel = 'Cassa Professionale (es. 15%)';
    }

    const impostaSostitutiva = imponibile * impostaRate;
    const nettoAnnuo = fatturato - inps - impostaSostitutiva;
    const nettoMensile = nettoAnnuo / 12;

    document.getElementById('res-piva-netto-annuo').textContent = `${Math.round(nettoAnnuo).toLocaleString('it-IT')} €`;
    document.getElementById('res-piva-netto-mensile').textContent = `≈ ${Math.round(nettoMensile).toLocaleString('it-IT')} € / mese netti`;
    
    document.getElementById('res-piva-tasse').textContent = `${Math.round(impostaSostitutiva).toLocaleString('it-IT')} €`;
    document.getElementById('res-piva-inps').textContent = `${Math.round(inps).toLocaleString('it-IT')} €`;
    document.getElementById('res-piva-inps-tipo').textContent = inpsLabel;
  }

  [fatInput, coeffSelect, impostaSelect, cassaSelect].forEach(elem => {
    elem.addEventListener('input', calculatePIVA);
  });

  calculatePIVA();
}

/* --------------------------------------------------------------------------
   Calculator: Mutui & Prestiti
   -------------------------------------------------------------------------- */
function initMutuoCalc() {
  const importoInput = document.getElementById('mutuo-importo');
  const durataInput = document.getElementById('mutuo-durata');
  const tassoInput = document.getElementById('mutuo-tasso');

  const valImportoSpan = document.getElementById('val-mutuo-importo');
  const valDurataSpan = document.getElementById('val-mutuo-durata');
  const valTassoSpan = document.getElementById('val-mutuo-tasso');

  function calculateMutuo() {
    const importo = parseFloat(importoInput.value) || 150000;
    const durataAnni = parseInt(durataInput.value) || 20;
    const tassoAnnuo = parseFloat(tassoInput.value) || 3.5;

    valImportoSpan.textContent = `${importo.toLocaleString('it-IT')} €`;
    valDurataSpan.textContent = `${durataAnni} Anni`;
    valTassoSpan.textContent = `${tassoAnnuo.toFixed(1).replace('.', ',')} %`;

    const mesi = durataAnni * 12;
    const tassoMensile = (tassoAnnuo / 100) / 12;

    let rataMensile = 0;
    if (tassoMensile > 0) {
      rataMensile = importo * (tassoMensile * Math.pow(1 + tassoMensile, mesi)) / (Math.pow(1 + tassoMensile, mesi) - 1);
    } else {
      rataMensile = importo / mesi;
    }

    const totaleRestituito = rataMensile * mesi;
    const totaleInteressi = totaleRestituito - importo;

    document.getElementById('res-mutuo-rata').textContent = `${Math.round(rataMensile).toLocaleString('it-IT')} €`;
    document.getElementById('res-mutuo-capitale').textContent = `${importo.toLocaleString('it-IT')} €`;
    document.getElementById('res-mutuo-interessi').textContent = `${Math.round(totaleInteressi).toLocaleString('it-IT')} €`;
    document.getElementById('res-mutuo-totale').textContent = `${Math.round(totaleRestituito).toLocaleString('it-IT')} €`;
  }

  [importoInput, durataInput, tassoInput].forEach(elem => {
    elem.addEventListener('input', calculateMutuo);
  });

  calculateMutuo();
}

/* --------------------------------------------------------------------------
   CAF Calculator 2: TFR & NASpI Disoccupazione
   -------------------------------------------------------------------------- */
function initTFRNASpICalc() {
  const tfrStipendioInput = document.getElementById('tfr-stipendio-lordo');
  const tfrAnniInput = document.getElementById('tfr-anni-servizio');
  const naspiSettimaneInput = document.getElementById('naspi-settimane');

  const valTfrStipendSpan = document.getElementById('val-tfr-stipendio');
  const valTfrAnniSpan = document.getElementById('val-tfr-anni');
  const valNaspiSettimaneSpan = document.getElementById('val-naspi-settimane');

  function calculateTFRNASpI() {
    const stipendioLordo = parseFloat(tfrStipendioInput.value) || 2150;
    const anniServizio = parseInt(tfrAnniInput.value) || 5;
    const settimaneLavorate = parseInt(naspiSettimaneInput.value) || 104;

    valTfrStipendSpan.textContent = `${stipendioLordo.toLocaleString('it-IT')} €/mese`;
    valTfrAnniSpan.textContent = `${anniServizio} Anni`;

    const mesiLavorati = Math.round(settimaneLavorate / 4.33);
    valNaspiSettimaneSpan.textContent = `${settimaneLavorate} Settimane (~${mesiLavorati} Mesi)`;

    const tfrAnnoLordo = (stipendioLordo * 13.5) / 13.5;
    const tfrLordoTotale = tfrAnnoLordo * anniServizio;
    const tfrNettoTotale = tfrLordoTotale * 0.77;

    const sogliaNaspi = 1425;
    let primoMeseNaspi = 0;
    if (stipendioLordo <= sogliaNaspi) {
      primoMeseNaspi = stipendioLordo * 0.75;
    } else {
      primoMeseNaspi = (sogliaNaspi * 0.75) + ((stipendioLordo - sogliaNaspi) * 0.25);
    }
    primoMeseNaspi = Math.min(1550, primoMeseNaspi);

    const durataNaspiSettimane = Math.min(104, Math.round(settimaneLavorate / 2));
    const durataNaspiMesi = Math.round(durataNaspiSettimane / 4.33);

    document.getElementById('res-tfr-netto').textContent = `${Math.round(tfrNettoTotale).toLocaleString('it-IT')} €`;
    document.getElementById('res-tfr-lordo-badge').textContent = `TFR Lordo Accantonato ~${Math.round(tfrLordoTotale).toLocaleString('it-IT')}€`;

    document.getElementById('res-naspi-primo-mese').textContent = `${Math.round(primoMeseNaspi).toLocaleString('it-IT')} €`;
    document.getElementById('res-naspi-durata').textContent = `${durataNaspiSettimane} Settimane (~${durataNaspiMesi} Mesi)`;
  }

  [tfrStipendioInput, tfrAnniInput, naspiSettimaneInput].forEach(elem => {
    elem.addEventListener('input', calculateTFRNASpI);
  });

  calculateTFRNASpI();
}

/* --------------------------------------------------------------------------
   Calculator 3: Insurance Hub (Auto, Moto, Casa, Vita, Pet)
   -------------------------------------------------------------------------- */
let currentInsCategory = 'auto';

function switchInsuranceCategory(category) {
  currentInsCategory = category;
  document.querySelectorAll('#insurance-calc .preset-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');

  renderInsuranceFields();
  calculateInsurance();
}

function initInsuranceCalc() {
  renderInsuranceFields();
  calculateInsurance();
}

function renderInsuranceFields() {
  const container = document.getElementById('ins-fields-container');
  const titleElem = document.getElementById('ins-form-title');
  if (!container) return;

  if (currentInsCategory === 'auto') {
    titleElem.textContent = '🚗 Calcolo Polizza Auto RCA';
    container.innerHTML = `
      <div class="form-group">
        <label for="ins-auto-cu">Classe di Merito CU (1 - 14):</label>
        <select id="ins-auto-cu" class="select-input">
          <option value="1" selected>Classe CU 1 (Massimo sconto / Legge Bersani)</option>
          <option value="4">Classe CU 4 (Guidatore esperto)</option>
          <option value="9">Classe CU 9 (Media)</option>
          <option value="14">Classe CU 14 (Prima assicurazione / Neopatentato)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="ins-auto-garanzie">Garanzie Aggiuntive Desiderate:</label>
        <select id="ins-auto-garanzie" class="select-input">
          <option value="rca" selected>Solo RCA Base + Assistenza Stradale</option>
          <option value="theft">RCA + Furto e Incendio</option>
          <option value="full">Kasko Completa + Cristalli + Infortuni</option>
        </select>
      </div>
    `;
  } else if (currentInsCategory === 'moto') {
    titleElem.textContent = '🏍️ Calcolo Polizza Moto & Scooter';
    container.innerHTML = `
      <div class="form-group">
        <label for="ins-moto-cc">Cilindrata Veicolo (cc):</label>
        <select id="ins-moto-cc" class="select-input">
          <option value="125" selected>Scooter 125 cc - 150 cc</option>
          <option value="300">Maxi Scooter 300 cc - 500 cc</option>
          <option value="600">Moto 600 cc - 1000 cc</option>
        </select>
      </div>
      <div class="form-group">
        <label for="ins-moto-suspension">Sospensione Invernale Gratuita?</label>
        <select id="ins-moto-suspension" class="select-input">
          <option value="yes" selected>Sì - Sospendibile (Sconto nei mesi freddi)</option>
          <option value="no">No - Guida 12 mesi all'anno</option>
        </select>
      </div>
    `;
  } else if (currentInsCategory === 'casa') {
    titleElem.textContent = '🏠 Calcolo Polizza Casa & Capofamiglia';
    container.innerHTML = `
      <div class="form-group">
        <label for="ins-casa-type">Tipo di Immobile:</label>
        <select id="ins-casa-type" class="select-input">
          <option value="apt" selected>Appartamento in Condominio (~90 mq)</option>
          <option value="house">Villetta Indipendente (~150 mq)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="ins-casa-cover">Livello di Copertura:</label>
        <select id="ins-casa-cover" class="select-input">
          <option value="rc" selected>RC Capofamiglia & Danni Terzi (da 60€/anno)</option>
          <option value="full">RC Casa + Incendio + Furto + Calamità Naturali</option>
        </select>
      </div>
    `;
  } else if (currentInsCategory === 'vita') {
    titleElem.textContent = '❤️ Calcolo Polizza Vita & Protezione Famiglia';
    container.innerHTML = `
      <div class="form-group">
        <label for="ins-vita-capital">Capitale Assicurato per la Famiglia (€):</label>
        <select id="ins-vita-capital" class="select-input">
          <option value="100000" selected>100.000 € (Protezione Base / Mutuo)</option>
          <option value="200000">200.000 € (Protezione Completa)</option>
          <option value="300000">300.000 € (Copertura Elevata)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="ins-vita-age">Età dell'Assicurato:</label>
        <input type="number" id="ins-vita-age" value="35" min="18" max="70" class="num-input">
      </div>
    `;
  } else if (currentInsCategory === 'pet') {
    titleElem.textContent = '🐾 Calcolo Polizza Animali Domestici (Cane / Gatto)';
    container.innerHTML = `
      <div class="form-group">
        <label for="ins-pet-type">Tipo di Animale Domestico:</label>
        <select id="ins-pet-type" class="select-input">
          <option value="dog" selected>Cane (Qualsiasi Razza/Taglia)</option>
          <option value="cat">Gatto</option>
        </select>
      </div>
      <div class="form-group">
        <label for="ins-pet-cover">Copertura Sanitaria & RC:</label>
        <select id="ins-pet-cover" class="select-input">
          <option value="basic" selected>Spese Chirurgiche + RC Danni a Terzi</option>
          <option value="full">Spese Veterinarie Complete + Esami + RC</option>
        </select>
      </div>
    `;
  }

  // Attach event listeners to new elements
  container.querySelectorAll('input, select').forEach(elem => {
    elem.addEventListener('input', calculateInsurance);
  });
}

function calculateInsurance() {
  const labelElem = document.getElementById('ins-res-label');
  const premiumElem = document.getElementById('res-ins-premium');
  const monthlyElem = document.getElementById('res-ins-monthly');
  const coverageElem = document.getElementById('res-ins-coverage');
  const detailElem = document.getElementById('res-ins-detail');
  const savingsElem = document.getElementById('res-ins-savings');

  if (!premiumElem) return;

  let annualPremium = 340;
  let coverageText = 'Base RCA + Assistenza';
  let detailText = 'Copertura Standard';
  let savingsText = '-180 €';

  if (currentInsCategory === 'auto') {
    labelElem.textContent = 'Premio Annuo Polizza Auto';
    const cu = document.getElementById('ins-auto-cu')?.value || '1';
    const garanzie = document.getElementById('ins-auto-garanzie')?.value || 'rca';

    let baseCost = 280;
    if (cu === '4') baseCost = 380;
    if (cu === '9') baseCost = 520;
    if (cu === '14') baseCost = 790;

    if (garanzie === 'theft') baseCost += 120;
    if (garanzie === 'full') baseCost += 290;

    annualPremium = baseCost;
    coverageText = garanzie === 'full' ? 'Kasko + Furto + Cristalli' : (garanzie === 'theft' ? 'RCA + Furto/Incendio' : 'RCA Base + Assistenza');
    detailText = `Classe CU ${cu}`;
  } else if (currentInsCategory === 'moto') {
    labelElem.textContent = 'Premio Annuo Polizza Moto';
    const cc = document.getElementById('ins-moto-cc')?.value || '125';
    const susp = document.getElementById('ins-moto-suspension')?.value || 'yes';

    let baseCost = 210;
    if (cc === '300') baseCost = 290;
    if (cc === '600') baseCost = 390;

    if (susp === 'yes') baseCost = Math.round(baseCost * 0.75);

    annualPremium = baseCost;
    coverageText = 'RCA Moto + Sospendibile';
    detailText = `Cilindrata ${cc} cc`;
    savingsText = '-120 €';
  } else if (currentInsCategory === 'casa') {
    labelElem.textContent = 'Premio Annuo Polizza Casa';
    const type = document.getElementById('ins-casa-type')?.value || 'apt';
    const cover = document.getElementById('ins-casa-cover')?.value || 'rc';

    let baseCost = cover === 'full' ? 160 : 75;
    if (type === 'house') baseCost = Math.round(baseCost * 1.3);

    annualPremium = baseCost;
    coverageText = cover === 'full' ? 'Casa Multi-Rischio' : 'RC Capofamiglia';
    detailText = type === 'apt' ? 'Appartamento' : 'Villetta';
    savingsText = '-60 €';
  } else if (currentInsCategory === 'vita') {
    labelElem.textContent = 'Premio Annuo Polizza Vita (TCM)';
    const capital = parseFloat(document.getElementById('ins-vita-capital')?.value || 100000);
    const age = parseInt(document.getElementById('ins-vita-age')?.value || 35);

    let baseCost = (capital / 100000) * 120;
    if (age > 45) baseCost *= 1.5;

    annualPremium = Math.round(baseCost);
    coverageText = `Capitale ${capital.toLocaleString('it-IT')} €`;
    detailText = `Età assicurato: ${age} anni`;
    savingsText = '-90 €';
  } else if (currentInsCategory === 'pet') {
    labelElem.textContent = 'Premio Annuo Polizza Pet';
    const petType = document.getElementById('ins-pet-type')?.value || 'dog';
    const cover = document.getElementById('ins-pet-cover')?.value || 'basic';

    let baseCost = cover === 'full' ? 150 : 85;
    if (petType === 'cat') baseCost = Math.round(baseCost * 0.85);

    annualPremium = baseCost;
    coverageText = cover === 'full' ? 'Veterinaria + Chirurgia + RC' : 'Chirurgia + RC Danni';
    detailText = petType === 'dog' ? 'Cane' : 'Gatto';
    savingsText = '-45 €';
  }

  premiumElem.textContent = `${annualPremium.toLocaleString('it-IT')} €`;
  monthlyElem.textContent = `≈ ${(annualPremium / 12).toFixed(2).replace('.', ',')} € / mese`;
  coverageElem.textContent = coverageText;
  detailElem.textContent = detailText;
  savingsElem.textContent = savingsText;
}

/* --------------------------------------------------------------------------
   EV Presets & Calculator
   -------------------------------------------------------------------------- */
function applyEVPreset(type) {
  const kmInput = document.getElementById('ev-km');
  const gasConsInput = document.getElementById('gas-consumption');
  const evConsInput = document.getElementById('ev-consumption');

  document.querySelectorAll('#ev-calc .preset-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');

  if (type === 'city') {
    kmInput.value = 10000;
    gasConsInput.value = 7.2;
    evConsInput.value = 14.0;
  } else if (type === 'family') {
    kmInput.value = 18000;
    gasConsInput.value = 6.5;
    evConsInput.value = 15.5;
  } else if (type === 'traveler') {
    kmInput.value = 30000;
    gasConsInput.value = 5.8;
    evConsInput.value = 17.5;
  }

  kmInput.dispatchEvent(new Event('input'));
}

function initEVCalc() {
  const kmInput = document.getElementById('ev-km');
  const fuelTypeSelect = document.getElementById('gas-fuel-type');
  const gasConsInput = document.getElementById('gas-consumption');
  const gasPriceInput = document.getElementById('gas-price');
  const evConsInput = document.getElementById('ev-consumption');
  const evHomeCostInput = document.getElementById('ev-home-cost');
  const evHomePctInput = document.getElementById('ev-home-pct');
  const evPublicCostInput = document.getElementById('ev-public-cost');
  const evMaintSavingsInput = document.getElementById('ev-maint-savings');

  const valKmSpan = document.getElementById('val-ev-km');
  const valHomePctSpan = document.getElementById('val-ev-home-pct');
  const kmLHint = document.getElementById('gas-km-l-hint');

  fuelTypeSelect.addEventListener('change', () => {
    gasPriceInput.value = fuelTypeSelect.value;
    calculateEV();
  });

  function calculateEV() {
    const km = parseFloat(kmInput.value) || 15000;
    const gasCons = parseFloat(gasConsInput.value) || 6.5;
    const gasPrice = parseFloat(gasPriceInput.value) || 1.82;
    const evCons = parseFloat(evConsInput.value) || 15.5;
    const evHomeCost = parseFloat(evHomeCostInput.value) || 0.22;
    const evHomePct = parseFloat(evHomePctInput.value) || 80;
    const evPublicCost = parseFloat(evPublicCostInput.value) || 0.55;
    const maintSavings = parseFloat(evMaintSavingsInput.value) || 350;

    valKmSpan.textContent = `${km.toLocaleString('it-IT')} km`;
    valHomePctSpan.textContent = `${evHomePct}% Casa / ${100 - evHomePct}% Colonnina`;

    if (gasCons > 0) {
      const kmPerL = (100 / gasCons).toFixed(1);
      kmLHint.textContent = `≈ ${kmPerL} km/L`;
    }

    const gasTotalLiters = (km / 100) * gasCons;
    const gasAnnualCost = gasTotalLiters * gasPrice;
    const gasCostPer100km = gasCons * gasPrice;

    const weightedEvCostPerKwh = ((evHomePct / 100) * evHomeCost) + (((100 - evHomePct) / 100) * evPublicCost);
    const evTotalKwh = (km / 100) * evCons;
    const evAnnualCost = evTotalKwh * weightedEvCostPerKwh;
    const evCostPer100km = evCons * weightedEvCostPerKwh;

    const fuelSavings = Math.max(0, gasAnnualCost - evAnnualCost);
    const netAnnualSavings = fuelSavings + maintSavings;
    const co2SavedTons = ((km * 0.145) / 1000).toFixed(1);

    document.getElementById('res-ev-annual-savings').textContent = `${Math.round(netAnnualSavings).toLocaleString('it-IT')} €`;

    document.getElementById('res-gas-annual').textContent = `${Math.round(gasAnnualCost).toLocaleString('it-IT')} €`;
    document.getElementById('res-gas-100km').textContent = `${gasCostPer100km.toFixed(2).replace('.', ',')} € / 100 km`;

    document.getElementById('res-ev-annual').textContent = `${Math.round(evAnnualCost).toLocaleString('it-IT')} €`;
    document.getElementById('res-ev-100km').textContent = `${evCostPer100km.toFixed(2).replace('.', ',')} € / 100 km`;

    document.getElementById('res-co2-saved').textContent = `${co2SavedTons.replace('.', ',')} tonnellate`;

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

  [kmInput, gasConsInput, gasPriceInput, evConsInput, evHomeCostInput, evHomePctInput, evPublicCostInput, evMaintSavingsInput].forEach(elem => {
    elem.addEventListener('input', calculateEV);
  });

  calculateEV();
}

function copyCalculationReport() {
  const savings = document.getElementById('res-ev-annual-savings').textContent;
  const gasCost = document.getElementById('res-gas-annual').textContent;
  const evCost = document.getElementById('res-ev-annual').textContent;

  const textToCopy = `⚡ Report Calcolo EcoCalc.it:\nRisparmio Annuo stimato passando a un'Auto Elettrica: ${savings}\n(Costo Carburante: ${gasCost} vs Costo Elettrico: ${evCost})\nCalcola il tuo risparmio su https://ecocalc.it`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('✅ Risultati copiati negli appunti!');
  }).catch(() => {
    alert(textToCopy);
  });
}

/* --------------------------------------------------------------------------
   Solar Presets & Calculator
   -------------------------------------------------------------------------- */
function applySolarPreset(type) {
  const billInput = document.getElementById('solar-bill');
  document.querySelectorAll('#solar-calc .preset-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');

  if (type === 'small') {
    billInput.value = 80;
  } else if (type === 'medium') {
    billInput.value = 150;
  } else if (type === 'large') {
    billInput.value = 280;
  }

  billInput.dispatchEvent(new Event('input'));
}

function initSolarCalc() {
  const billInput = document.getElementById('solar-bill');
  const zoneSelect = document.getElementById('solar-zone');
  const profileSelect = document.getElementById('solar-day-profile');
  const batterySelect = document.getElementById('solar-battery');
  const costInput = document.getElementById('solar-cost');
  const taxCreditInput = document.getElementById('solar-tax-credit');

  const valBillSpan = document.getElementById('val-solar-bill');

  function calculateSolar() {
    const monthlyBill = parseFloat(billInput.value) || 120;
    const insolationZone = parseFloat(zoneSelect.value) || 1400;
    const dayProfile = profileSelect.value;
    const hasBattery = batterySelect.value === 'yes';
    const totalCost = parseFloat(costInput.value) || 7500;
    const taxCreditPct = parseFloat(taxCreditInput.value) || 50;

    valBillSpan.textContent = `${monthlyBill} €/mese`;

    const annualBill = monthlyBill * 12;

    let baseAutoconsumption = 0.35;
    if (dayProfile === 'daytime') baseAutoconsumption = 0.50;
    if (dayProfile === 'evening') baseAutoconsumption = 0.25;

    const autoconsumptionRate = hasBattery ? Math.min(0.85, baseAutoconsumption + 0.45) : baseAutoconsumption;

    const annualKwhNeeded = annualBill / 0.27;
    let kwpRecommended = (annualKwhNeeded / insolationZone);
    kwpRecommended = Math.max(2.0, Math.min(15.0, Math.round(kwpRecommended * 2) / 2));

    const batterySizeKwh = hasBattery ? Math.round(kwpRecommended * 1.5) : 0;

    const selfConsumedKwh = (annualKwhNeeded * autoconsumptionRate);
    const exportedKwh = Math.max(0, (kwpRecommended * insolationZone) - selfConsumedKwh);
    const gridRevenue = exportedKwh * 0.08;

    const annualBillSavings = annualBill * autoconsumptionRate;
    const totalAnnualBenefit = annualBillSavings + gridRevenue;

    const netCost = totalCost * (1 - (taxCreditPct / 100));

    const paybackYears = totalAnnualBenefit > 0 ? (netCost / totalAnnualBenefit).toFixed(1) : 0;
    const savings20y = Math.round((totalAnnualBenefit * 20) - netCost);

    document.getElementById('res-solar-payback').textContent = `${paybackYears.replace('.', ',')} Anni`;
    document.getElementById('res-solar-kwp').textContent = `${kwpRecommended.toFixed(1).replace('.', ',')} kWp`;
    document.getElementById('res-solar-battery-size').textContent = hasBattery ? `+ Accumulo ${batterySizeKwh} kWh` : 'Senza Accumulo';
    
    document.getElementById('res-solar-annual-savings').textContent = `${Math.round(totalAnnualBenefit).toLocaleString('it-IT')} €`;
    document.getElementById('res-solar-autoconsump').textContent = `Autoconsumo stimato ${Math.round(autoconsumptionRate * 100)}%`;

    document.getElementById('res-solar-net-cost').textContent = `${Math.round(netCost).toLocaleString('it-IT')} €`;
    document.getElementById('res-solar-20y-savings').textContent = `${Math.max(0, savings20y).toLocaleString('it-IT')} €`;
  }

  [billInput, zoneSelect, profileSelect, batterySelect, costInput, taxCreditInput].forEach(elem => {
    elem.addEventListener('input', calculateSolar);
  });

  calculateSolar();
}

/* --------------------------------------------------------------------------
   Bollo Auto Calculator
   -------------------------------------------------------------------------- */
function initBolloCalc() {
  const regionSelect = document.getElementById('car-region');
  const powerTypeSelect = document.getElementById('car-power-type');
  const powerValInput = document.getElementById('car-power-val');
  const fuelTypeSelect = document.getElementById('car-fuel-type');
  const euroSelect = document.getElementById('car-euro');
  const insuranceInput = document.getElementById('car-insurance');
  const maintInput = document.getElementById('car-maintenance');

  const convertedSpan = document.getElementById('power-converted');
  const bolloNote = document.getElementById('bollo-note');

  function calculateBollo() {
    const region = regionSelect.value;
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

    const baseKw = Math.min(kw, 100);
    const extraKw = Math.max(0, kw - 100);
    const standardCost = (baseKw * baseRateKwp100) + (extraKw * extraRateKwpOver100);

    if (fuel === 'electric') {
      if (region === 'lombardia' || region === 'piemonte') {
        bolloAmount = 0;
        bolloNote.innerHTML = `💡 <strong>Regione ${region.toUpperCase()}:</strong> Esenzione dal bollo auto 100% permanente per veicoli elettrici.`;
      } else {
        bolloAmount = 0;
        bolloNote.innerHTML = `💡 <strong>Esenzione Elettrica:</strong> Bollo gratuito per i primi 5 anni, poi sconto del 75%.`;
      }
    } else if (fuel === 'hybrid') {
      if (region === 'lombardia') {
        bolloAmount = standardCost * 0.50;
        bolloNote.innerHTML = `💡 <strong>Regione Lombardia:</strong> Sconto del 50% sul bollo per auto ibride.`;
      } else if (region === 'veneto' || region === 'puglia' || region === 'campania') {
        bolloAmount = 0;
        bolloNote.innerHTML = `💡 <strong>Regione ${region.toUpperCase()}:</strong> Esenzione totale nei primi anni di immatricolazione.`;
      } else {
        bolloAmount = standardCost * 0.75;
        bolloNote.innerHTML = `💡 <strong>Auto Ibrida:</strong> Agevolazione media del 25% sul bollo auto.`;
      }
    } else {
      bolloAmount = standardCost;
      bolloNote.innerHTML = `💡 <strong>Tariffa Ordinaria:</strong> Calcolata sulla classe Euro e kW del veicolo.`;
    }

    if (kw > 185 && fuel !== 'electric') {
      superbollo = (kw - 185) * 20;
    }

    const totalBolloPlusSuper = Math.round(bolloAmount + superbollo);
    const tcoTotal = totalBolloPlusSuper + insurance + maint;
    const tcoMonthly = (tcoTotal / 12).toFixed(2);

    document.getElementById('res-bollo-amount').textContent = `${totalBolloPlusSuper.toLocaleString('it-IT')} €`;

    const superBadge = document.getElementById('res-superbollo-badge');
    if (superbollo > 0) {
      superBadge.textContent = `Incluso Superbollo di ${superbollo}€ (${kw - 185} kW eccedenti)`;
      superBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      superBadge.style.color = 'var(--accent-red)';
    } else if (fuel === 'electric') {
      superBadge.textContent = `Esenzione Bollo Auto Elettrica`;
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

  [regionSelect, powerTypeSelect, powerValInput, fuelTypeSelect, euroSelect, insuranceInput, maintInput].forEach(elem => {
    elem.addEventListener('input', calculateBollo);
  });

  calculateBollo();
}
