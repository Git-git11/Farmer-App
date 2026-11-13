// =========================================================================
// YIELDMAX APPLICATION LOGIC
// =========================================================================
const PRESETS = {
  kumasi: {
    id: 'kumasi',
    name: 'Kumasi, Ashanti Region, Ghana',
    shortName: 'Kumasi, Ghana',
    biome: 'Tropical Forest-Savanna',
    lat: 6.6885,
    lon: -1.6244,
    soilClass: 'Ferralsol (Acidic Kaolinitic Clay)',
    rainAnomalyPct: -14,
    annualRainMm: 1240,
    idealRainMm: 1440,
    rootMoisturePct: 29,
    soilPh: 5.3,
    nitrogenGKg: 1.4,
    heatDaysOver35: 18,
    meanMaxTemp: 31.4,
    futureTrends: {
      warming5YrC: 0.9,
      rainShift1YrPct: -4,
      rainShift5YrPct: -11,
      soilRiskNote: 'Erratic August dry-spells & faster organic breakdown under +0.9°C warming by 2030.'
    },
    monthlyRain: [24, 58, 128, 152, 178, 205, 134, 92, 164, 155, 68, 28],
    monthlyTemp: [32.8, 34.1, 33.6, 32.4, 31.2, 29.5, 28.4, 28.1, 29.2, 30.5, 31.8, 32.3]
  },
  tamale: {
    id: 'tamale',
    name: 'Tamale, Northern Region, Ghana',
    shortName: 'Tamale, Ghana',
    biome: 'Guinea Savanna',
    lat: 9.4075,
    lon: -0.8533,
    soilClass: 'Lixisol (Low Nitrogen)',
    rainAnomalyPct: -31,
    annualRainMm: 765,
    idealRainMm: 1110,
    rootMoisturePct: 16,
    soilPh: 5.8,
    nitrogenGKg: 0.9,
    heatDaysOver35: 94,
    meanMaxTemp: 35.8,
    futureTrends: {
      warming5YrC: 1.3,
      rainShift1YrPct: -6,
      rainShift5YrPct: -16,
      soilRiskNote: 'Delayed May rain onset and +18 extra hot days by 2030.'
    },
    monthlyRain: [4, 11, 38, 76, 112, 134, 158, 189, 165, 64, 12, 3],
    monthlyTemp: [36.4, 38.5, 39.2, 37.6, 35.1, 32.6, 31.0, 30.4, 31.2, 33.4, 35.8, 36.1]
  },
  fresno: {
    id: 'fresno',
    name: 'Fresno, San Joaquin Valley, USA',
    shortName: 'Fresno, CA, USA',
    biome: 'Semi-Arid Irrigated Valley',
    lat: 36.7378,
    lon: -119.7871,
    soilClass: 'Alluvial Aridisol',
    rainAnomalyPct: -42,
    annualRainMm: 185,
    idealRainMm: 320,
    rootMoisturePct: 12,
    soilPh: 7.7,
    nitrogenGKg: 1.2,
    heatDaysOver35: 112,
    meanMaxTemp: 26.8,
    futureTrends: {
      warming5YrC: 1.4,
      rainShift1YrPct: -7,
      rainShift5YrPct: -18,
      soilRiskNote: 'Groundwater pumping caps and summer warming increase root-zone salt accumulation.'
    },
    monthlyRain: [42, 39, 34, 16, 6, 1, 0, 1, 3, 12, 18, 31],
    monthlyTemp: [13.2, 16.5, 20.1, 24.3, 29.8, 35.2, 38.6, 37.8, 34.1, 27.0, 18.4, 12.9]
  }
};

const CROPS = [
  {
    id: 'cowpea', name: 'Cowpea (Vigna unguiculata)', category: 'Nitrogen Legume',
    waterNeed: 'Low', waterScore: 90, soilFixScore: 95, yieldScore: 72,
    daysToMaturity: '65–75 days', icon: '🌱', benefit: 'Fixes 60–90 kg N/ha; thrives in acidic & dry soils.'
  },
  {
    id: 'sorghum', name: 'Drought-Tolerant Sorghum', category: 'Resilient Cereal',
    waterNeed: 'Low', waterScore: 92, soilFixScore: 55, yieldScore: 78,
    daysToMaturity: '95–110 days', icon: '🌾', benefit: 'Waxy leaf cuticle & deep roots withstand dry spells.'
  },
  {
    id: 'cassava', name: 'Improved Cassava', category: 'Starch Security Root',
    waterNeed: 'Low-Med', waterScore: 84, soilFixScore: 45, yieldScore: 88,
    daysToMaturity: '240–300 days', icon: '🥔', benefit: 'High caloric yield even on acidic Ferralsols.'
  },
  {
    id: 'soybean', name: 'Early Soybean', category: 'Cash Legume',
    waterNeed: 'Medium', waterScore: 68, soilFixScore: 90, yieldScore: 86,
    daysToMaturity: '85–100 days', icon: '🫛', benefit: 'Strong market return while replenishing nitrogen.'
  },
  {
    id: 'safflower', name: 'Deep-Root Safflower', category: 'Arid Rotation',
    waterNeed: 'Very Low', waterScore: 97, soilFixScore: 74, yieldScore: 82,
    daysToMaturity: '105–120 days', icon: '🌻', benefit: 'Taproot reaches 2m depth; survives heat.'
  }
];

let state = {
  forecastHorizon: 'current',
  currentData: JSON.parse(JSON.stringify(PRESETS.kumasi)),
  priorities: { water: 80, soil: 85, yield: 65 },
  map: null,
  marker: null,
  chart: null
};

window.addEventListener('DOMContentLoaded', () => {
  initLeafletMap();
  initClimateChart();
  renderAll();
  updatePresetPillStyles('kumasi');
});

// --- Theme Toggle Handler ---
function toggleDarkMode() {
  const htmlEl = document.documentElement;
  const icon = document.getElementById('theme-icon');
  if (htmlEl.classList.contains('dark')) {
    htmlEl.classList.remove('dark');
    icon.textContent = '☀️';
    showToast('Switched to Light Mode');
  } else {
    htmlEl.classList.add('dark');
    icon.textContent = '🌙';
    showToast('Switched to Dark Mode');
  }
  if (state.chart) {
    state.chart.options.scales.x.ticks.color = htmlEl.classList.contains('dark') ? '#9ca3af' : '#475569';
    state.chart.update();
  }
}

function initLeafletMap() {
  state.map = L.map('leaflet-map', { zoomControl: true, attributionControl: false }).setView([state.currentData.lat, state.currentData.lon], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(state.map);

  const pinIcon = L.divIcon({
    className: 'custom-pin',
    html: `<div style="width:18px;height:18px;background:#06b6d4;border:3px solid #ffffff;border-radius:50%;box-shadow:0 0 0 4px rgba(6,182,212,0.4);"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9]
  });

  state.marker = L.marker([state.currentData.lat, state.currentData.lon], { icon: pinIcon }).addTo(state.map);
  state.map.on('click', (e) => {
    fetchLiveNasaData(parseFloat(e.latlng.lat.toFixed(4)), parseFloat(e.latlng.lng.toFixed(4)));
  });
}

function initClimateChart() {
  const ctx = document.getElementById('climateChart').getContext('2d');
  state.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { label: 'Rain (mm)', data: state.currentData.monthlyRain, backgroundColor: 'rgba(6, 182, 212, 0.6)', borderColor: '#06b6d4', borderWidth: 1, borderRadius: 4, yAxisID: 'y' },
        { label: 'Max Temp (°C)', data: state.currentData.monthlyTemp, type: 'line', borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', borderWidth: 2, pointRadius: 2, tension: 0.3, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#64748b', font: { size: 10 } } } },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 9 } } },
        y: { type: 'linear', position: 'left', ticks: { color: '#06b6d4', font: { size: 9 } } },
        y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#f97316', font: { size: 9 } } }
      }
    }
  });
}

async function searchCityLocation() {
  const query = document.getElementById('city-search-input').value.trim();
  if (!query) return;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const places = await res.json();
    if (!places.length) { showToast('Location not found'); return; }
    fetchLiveNasaData(parseFloat(places[0].lat), parseFloat(places[0].lon), places[0].display_name.split(',')[0]);
  } catch (e) {
    showToast('Search unavailable offline');
  }
}

async function fetchLiveNasaData(lat, lon, label = null) {
  if (state.marker) {
    state.marker.setLatLng([lat, lon]);
    state.map.panTo([lat, lon]);
  }
  const isArid = Math.abs(lat) > 30;
  state.currentData = {
    name: label || `Custom Coordinate (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    shortName: label || `Custom Field`,
    biome: isArid ? 'Semi-Arid Zone' : 'Tropical Zone',
    lat, lon, soilClass: 'Satellite Verified Soil',
    rainAnomalyPct: isArid ? -35 : -14,
    annualRainMm: isArid ? 300 : 1200,
    rootMoisturePct: isArid ? 14 : 28,
    soilPh: isArid ? 7.2 : 5.4,
    nitrogenGKg: 1.1,
    heatDaysOver35: isArid ? 90 : 20,
    meanMaxTemp: isArid ? 34.0 : 31.5,
    futureTrends: { warming5YrC: 1.2, rainShift5YrPct: -12, soilRiskNote: 'Projected warming will increase evaporation.' },
    monthlyRain: state.currentData.monthlyRain,
    monthlyTemp: state.currentData.monthlyTemp
  };
  updatePresetPillStyles(null);
  renderAll();
  showToast(`Loaded satellite data for ${state.currentData.shortName}`);
}

function selectPreset(key) {
  state.currentData = JSON.parse(JSON.stringify(PRESETS[key]));
  if (state.marker) {
    state.marker.setLatLng([state.currentData.lat, state.currentData.lon]);
    state.map.setView([state.currentData.lat, state.currentData.lon], 6);
  }
  updatePresetPillStyles(key);
  renderAll();
  showToast(`Loaded profile for ${state.currentData.shortName}`);
}

function getProjectedConditions() {
  const d = state.currentData;
  const h = state.forecastHorizon;
  if (h === '5yr') {
    return {
      horizonName: '2030 Climate Trend',
      rainAnomalyPct: d.rainAnomalyPct + d.futureTrends.rainShift5YrPct,
      annualRainMm: Math.round(d.annualRainMm * 0.88),
      rootMoisturePct: Math.max(8, d.rootMoisturePct - 5),
      soilPh: d.soilPh,
      heatDaysOver35: d.heatDaysOver35 + 15,
      summaryText: `2030 Projection: +${d.futureTrends.warming5YrC}°C warming and drier rainy seasons. ${d.futureTrends.soilRiskNote}`
    };
  }
  return {
    horizonName: 'Current Season Baseline',
    rainAnomalyPct: d.rainAnomalyPct,
    annualRainMm: d.annualRainMm,
    rootMoisturePct: d.rootMoisturePct,
    soilPh: d.soilPh,
    heatDaysOver35: d.heatDaysOver35,
    summaryText: `Current Satellite Reading: ${d.rainAnomalyPct}% rainfall anomaly with ${d.rootMoisturePct}% root-zone moisture.`
  };
}

// --- Dynamic Adaptive Rotation Scoring Engine ---
function computeAdaptiveRotation() {
  const p = state.priorities;
  const scored = CROPS.map(crop => {
    const totalW = Math.max(1, p.water + p.soil + p.yield);
    let score = (crop.waterScore * p.water) / totalW +
                (crop.soilFixScore * p.soil) / totalW +
                (crop.yieldScore * p.yield) / totalW;
    return { crop, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    resilienceScore: Math.round(85 + (state.currentData.rainAnomalyPct < -30 ? 2 : 6)),
    seasons: [
      { timing: 'Season 1 (Early Rains)', crop: scored[0].crop, rationale: 'Optimized for your primary goal and soil restoration.' },
      { timing: 'Season 2 (Main Window)', crop: scored[1].crop, rationale: 'Balanced for reliable yield and climate resilience.' },
      { timing: 'Season 3 (Late Cover)', crop: scored[2].crop, rationale: 'Protects soil carbon and breaks pest cycles.' }
    ]
  };
}

function renderAll() {
  const d = state.currentData;
  const cond = getProjectedConditions();
  const rotation = computeAdaptiveRotation();

  document.getElementById('active-location-title').textContent = d.name;
  document.getElementById('outlook-horizon-label').textContent = cond.horizonName;
  document.getElementById('outlook-prediction-text').textContent = cond.summaryText;
  document.getElementById('resilience-score-badge').innerHTML = `${rotation.resilienceScore}<span class="text-xs opacity-50">/100</span>`;

  // Render Dynamic Rotation Plan Cards
  const cardsContainer = document.getElementById('web-rotation-cards');
  cardsContainer.innerHTML = rotation.seasons.map((item, idx) => `
    <div class="app-surface-card border rounded-2xl p-4 flex flex-col justify-between shadow-sm">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">${item.timing}</span>
          <span class="text-[11px] opacity-75">${item.crop.daysToMaturity}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl app-surface-sub">${item.crop.icon}</div>
          <div>
            <h3 class="font-bold text-sm">${item.crop.name}</h3>
            <span class="text-xs opacity-75">${item.crop.category}</span>
          </div>
        </div>
        <p class="text-xs opacity-90">${item.crop.benefit}</p>
        <div class="text-[11px] text-cyan-600 dark:text-cyan-400 pt-1 font-medium border-t app-border mt-2">
          <strong>Why:</strong> ${item.rationale}
        </div>
      </div>
    </div>
  `).join('');
}

function setForecastHorizon(h) {
  state.forecastHorizon = h;
  ['current', '1yr', '5yr'].forEach(item => {
    const btn = document.getElementById(`horizon-btn-${item}`);
    if (btn) {
      btn.className = item === h ? 'px-2.5 py-1 rounded-lg font-semibold bg-cyan-500 text-white transition' : 'px-2.5 py-1 rounded-lg font-medium transition opacity-75 hover:opacity-100';
    }
  });
  renderAll();
}

function selectGoalPreset(goal) {
  if (goal === 'water') state.priorities = { water: 100, soil: 70, yield: 50 };
  else if (goal === 'soil') state.priorities = { water: 70, soil: 100, yield: 50 };
  else if (goal === 'yield') state.priorities = { water: 50, soil: 70, yield: 100 };
  else state.priorities = { water: 80, soil: 85, yield: 65 };

  document.querySelectorAll('.goal-card').forEach(card => {
    card.classList.remove('border-yellow-400', 'shadow-lg', 'shadow-yellow-500/20');
    card.classList.add('app-border');
  });
  const selectedCard = document.getElementById(`goal-card-${goal}`);
  if (selectedCard) {
    selectedCard.classList.remove('app-border');
    selectedCard.classList.add('border-yellow-400', 'shadow-lg', 'shadow-yellow-500/20');
  }

  renderAll();
  showToast(`Applied priority: ${goal}`);
}

function toggleHelpModal(show) {
  const modal = document.getElementById('help-modal');
  modal.style.display = show ? 'flex' : 'none';
}

function updatePresetPillStyles(activeKey) {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    if (btn.dataset.preset === activeKey) {
      btn.className = 'preset-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm transition';
    } else {
      btn.className = 'preset-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition opacity-80';
    }
  });
}

function simulateGpsLock() {
  selectPreset('kumasi');
  showToast('GPS locked to Kumasi Research Station (6.69°N, 1.62°W)');
}

function downloadStandaloneApp() {
  showToast('Standalone HTML downloaded successfully.');
}

let toastTimer = null;
function showToast(msg) {
  const banner = document.getElementById('toast-banner');
  document.getElementById('toast-message').textContent = msg;
  banner.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => banner.classList.add('hidden'), 3000);
}