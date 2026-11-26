// =====================================================================
// NOMOR SURAT TUGAS (ST) PREFIX & SUFFIX HANDLER
// =====================================================================
function getStYear() {
  const tgl = document.getElementById('tglST')?.value;
  if (tgl) {
    const yr = new Date(tgl + 'T00:00:00').getFullYear();
    if (yr && !isNaN(yr)) return yr;
  }
  return 2026;
}

function updateStSuffixOptions() {
  const yr = getStYear();
  const sel = document.getElementById('noSTSuffix');
  const opt1Val = `/ST/Sj.07/${yr}`;
  const opt2Val = `/ST/Sj/${yr}`;

  if (sel && sel.options && sel.options.length >= 2) {
    const curVal = sel.value;
    const isSjOnly = curVal.includes('/ST/Sj/') && !curVal.includes('/ST/Sj.');
    sel.options[0].value = opt1Val;
    sel.options[0].textContent = opt1Val;
    sel.options[1].value = opt2Val;
    sel.options[1].textContent = opt2Val;
    sel.value = isSjOnly ? opt2Val : opt1Val;
  }
}

function setStSuffix(suffixPattern) {
  const yr = getStYear();
  const sel = document.getElementById('noSTSuffix');
  const actualSuffix = suffixPattern.replace(/\/\d{4}$/, `/${yr}`);
  if (sel) {
    sel.value = actualSuffix;
    onStSuffixSelectChange();
  }
}

function onStSuffixSelectChange() {
  syncNoSTFromInputs();
}

function syncNoSTFromInputs() {
  const numInput = document.getElementById('noSTNum');
  const suffixSel = document.getElementById('noSTSuffix');
  const fullInput = document.getElementById('noST');
  if (!fullInput) return;

  const num = (numInput?.value || '').trim();
  const suffix = suffixSel?.value || '/ST/Sj.07/2026';

  if (!num) {
    fullInput.value = '';
  } else if (num.includes('/')) {
    fullInput.value = num;
  } else {
    fullInput.value = `${num}${suffix}`;
  }

  const group = fullInput.closest('.form-group');
  if (group) {
    if (fullInput.value) {
      group.classList.remove('has-error');
      const wrap = group.querySelector('.st-prefix-wrap');
      if (wrap) wrap.classList.remove('has-error');
    }
  }
}

function syncInputsFromFullNoST(fullVal) {
  const numInput = document.getElementById('noSTNum');
  const suffixSel = document.getElementById('noSTSuffix');
  const fullInput = document.getElementById('noST');
  if (!fullInput) return;

  const raw = String(fullVal || '').trim();
  fullInput.value = raw;

  if (!numInput || !suffixSel) return;
  if (!raw) {
    numInput.value = '';
    return;
  }

  const match = raw.match(/^([^\/]+)(\/.*)$/);
  if (match) {
    numInput.value = match[1].trim();
    const matchedSuffix = match[2].trim();
    let found = false;
    for (let i = 0; i < suffixSel.options.length; i++) {
      if (suffixSel.options[i].value === matchedSuffix) {
        suffixSel.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = matchedSuffix;
      opt.textContent = matchedSuffix;
      suffixSel.appendChild(opt);
      suffixSel.value = matchedSuffix;
    }
  } else {
    numInput.value = raw;
  }
  onStSuffixSelectChange();
}

window.getStYear = getStYear;
window.updateStSuffixOptions = updateStSuffixOptions;
window.setStSuffix = setStSuffix;
window.onStSuffixSelectChange = onStSuffixSelectChange;
window.syncNoSTFromInputs = syncNoSTFromInputs;
window.syncInputsFromFullNoST = syncInputsFromFullNoST;

function updateFieldFilledStatus(el) {
  if (!el) return;
  const ctrl = el.closest('.field-control');
  if (!ctrl) return;
  const icon = ctrl.querySelector('.field-inner-icon');
  const val = (el.value || '').trim();
  if (val) {
    ctrl.classList.add('is-filled');
    if (icon) {
      icon.style.display = 'none';
      icon.textContent = '';
      icon.title = '';
    }
  } else {
    ctrl.classList.remove('is-filled');
    if (icon) {
      icon.style.display = 'inline-flex';
      icon.textContent = '!';
      icon.title = 'Wajib diisi';
    }
  }
}

function setupRealtimeValidation() {
  REQUIRED_FIELDS.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el) return;
    const group = el.closest('.form-group');
    // Set initial status
    updateFieldFilledStatus(el);

    ['input', 'change'].forEach(evt => {
      el.addEventListener(evt, () => {
        updateFieldFilledStatus(el);
        if ((el.value || '').trim()) {
          if (group) group.classList.remove('has-error');
        }
      });
    });
    el.addEventListener('blur', () => {
      updateFieldFilledStatus(el);
      if (!(el.value || '').trim()) {
        if (group) group.classList.add('has-error');
      }
    });
  });

  const stNum = document.getElementById('noSTNum');
  if (stNum) {
    ['input', 'change'].forEach(evt => {
      stNum.addEventListener(evt, () => {
        syncNoSTFromInputs();
      });
    });
    stNum.addEventListener('blur', () => {
      syncNoSTFromInputs();
      const el = document.getElementById('noST');
      const group = el?.closest('.form-group');
      if (group && !(el?.value || '').trim()) {
        group.classList.add('has-error');
      }
    });
  }

  ['provinsiTujuan1', 'provinsiTujuan2'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const group = el.closest('.form-group');
    updateFieldFilledStatus(el);
    ['input', 'change'].forEach(evt => {
      el.addEventListener(evt, () => {
        updateFieldFilledStatus(el);
        if ((el.value || '').trim()) {
          if (group) group.classList.remove('has-error');
        }
      });
    });
    el.addEventListener('blur', () => {
      updateFieldFilledStatus(el);
      if (!(el.value || '').trim() && typeof isMultiProvActive === 'function' && isMultiProvActive()) {
        if (group) group.classList.add('has-error');
      }
    });
  });
}

