// =====================================================================
// STATE
// =====================================================================
let selectedEmpIds = new Set();
let currentFilter = '';
let currentRateProvinceId = '';
let dprAutoCheckedForDki = false;
let spdPerEmployee = {};
let provinceFoodRates = {};
try {
  provinceFoodRates = JSON.parse(localStorage.getItem('provinceFoodRates') || '{}');
} catch (error) {
  provinceFoodRates = {};
}

