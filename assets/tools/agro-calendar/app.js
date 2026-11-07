/* Agro Calendar Visualization
   Turns a 12-month catch table (one row per species) into a circular seasonal calendar:
   month 12 at the top, months clockwise, one ring per species, colour = catch per day.
   Everything runs in the browser; the data never leaves the page. */
(function () {
  'use strict';

  // ---------- Constants ----------

  const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const MONTHS = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  };
  const MONTHS_FULL = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
  };
  // Paul Tol's "muted" palette (colour-blind safe), ordered so the first rings come from different hue families
  // (rose/wine, sand/olive, cyan/teal and indigo/purple are kept far apart).
  const PALETTE = ['#CC6677', '#332288', '#DDCC77', '#117733', '#88CCEE', '#AA4499', '#999933', '#44AA99', '#882255'];
  const FONT = "'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
  const FONT_BASE = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-thai@5.1.1/files/';
  const RANGE_THAI = 'U+02D7,U+0303,U+0331,U+0E01-0E5B,U+200C-200D,U+25CC';
  const RANGE_LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
  const FONT_FILES = [
    { w: 400, file: 'noto-sans-thai-thai-400-normal.woff2', range: RANGE_THAI },
    { w: 400, file: 'noto-sans-thai-latin-400-normal.woff2', range: RANGE_LATIN },
    { w: 600, file: 'noto-sans-thai-thai-600-normal.woff2', range: RANGE_THAI },
    { w: 600, file: 'noto-sans-thai-latin-600-normal.woff2', range: RANGE_LATIN },
  ];
  const SHEETJS_URL = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
  const THAI_RE = /[฀-๿]/;
  const EXPORT_WIDTH = 820;
  const PNG_SCALE = 3;

  // Invented example data, so the tool shows a working calendar on first visit.
  const SAMPLE = {
    title: 'ปฏิทินการจับสัตว์น้ำ — ตัวอย่าง',
    subtitle: 'ข้อมูลสมมติเพื่อสาธิต (กก./เดือน)',
    rows: [
      ['ปูดำ', 20, 35, 40, 0, 0, 0, 10, 25, 30, 30, 15, 10],
      ['กุ้งแชบ๊วย', 0, 0, 5, 15, 30, 40, 20, 0, 0, 0, 0, 0],
      ['ปลากะพงขาว', 12, 10, 0, 0, 0, 8, 15, 22, 18, 10, 0, 0],
      ['หอยแครง', 30, 30, 25, 20, 0, 0, 0, 0, 0, 10, 25, 30],
      ['ปลาทู', 0, 0, 0, 0, 18, 25, 30, 28, 12, 0, 0, 0],
      ['หมึกกล้วย', 0, 8, 15, 22, 18, 0, 0, 0, 0, 0, 5, 6],
    ],
  };

  const I18N = {
    en: {
      appTitle: 'Agro Calendar Visualization',
      appIntro: 'Turn a monthly catch table into a circular seasonal calendar. Your data stays in your browser.',
      language: 'Language', auto: 'Auto',
      titlePh: 'Title (e.g. village name)', subtitlePh: 'Subtitle (e.g. data year)',
      downloadPng: 'Download PNG', downloadSvg: 'Download SVG', downloadCsv: 'Download table (CSV)',
      options: 'Display options',
      values: 'Values', modeAuto: 'Auto-detect', absolute: 'Absolute amounts (per month)', percent: 'Percent / relative',
      detected: 'Detected: {x}', detAbs: 'absolute amounts', detPct: 'percentages',
      unit: 'Unit of the values', unitHint: 'e.g. kg, tonnes, individuals. Used for absolute values.',
      scale: 'Colour scale',
      global: 'Global: one scale for all species (compare species)',
      perAnimal: 'Per species: each ring scaled to its own peak (see each season)',
      more: 'More',
      leap: 'Leap year (February = 29 days)',
      reverse: 'Reverse species order (wheel: first row outermost; bars: first row at the bottom)',
      layout: 'Layout', layoutWheel: 'Wheel', layoutBar: 'Horizontal bars',
      track: 'Show a faint track for months without catch',
      data: 'Data', tabTable: 'Edit table', tabPaste: 'Paste', tabUpload: 'Upload file',
      tableHelp: 'One row per species. Leave a cell blank, or type 0 or -, for months with no catch. Values may end with %. You can paste a block of cells copied from a spreadsheet straight into the table.',
      animal: 'Animal', addRow: '+ Add row', loadSample: 'Load sample data', clear: 'Clear table',
      pasteHelp: 'Paste a table copied from Excel / Google Sheets, or CSV text. The first row must be headers: the animal column, then the months as 1–12, Jan–Dec or ม.ค.–ธ.ค.',
      pasteBtn: 'Use pasted data',
      uploadHelp: 'Choose or drop a CSV or Excel file (.csv, .xlsx, .xls). The first sheet is used, with the same layout as the table.',
      sampleLink: 'Download sample CSV',
      deleteRow: 'Delete row',
      perDayUnit: '{u}/day', pctUnit: '%',
      legendTitleAbs: 'Catch per day ({u})', legendTitlePct: 'Relative catch (%)',
      legendGlobal: 'Shared scale: pale = low, strong = high. Bars run from 0 to {max}.',
      legendPer: 'Each species is scaled to its own peak: pale = low, strong = high.',
      peak: 'peak {x}',
      tipValue: 'Value', tipPerDay: 'Per day', tipDays: '{d} days', tipRel: 'Relative intensity (not converted to per day)',
      noData: 'Add at least one species with a name to draw the calendar.',
      loaded: 'Loaded {n} species.',
      errorsTitle: 'Please check these cells (they are drawn as no catch until fixed):',
      errNoHeader: 'Could not find the month columns. The first row must contain the animal column and 12 month headers (1–12, Jan–Dec or ม.ค.–ธ.ค.).',
      errMissing: 'Missing month column(s): {x}.',
      errDup: 'Month {x} appears in more than one column.',
      errNumber: 'Row {r} ({name}), {m}: "{v}" is not a number.',
      errNegative: 'Row {r} ({name}), {m}: negative values are not allowed.',
      errNoName: 'Row {r} has values but no animal name.',
      errEmpty: 'No data rows found.',
      errFile: 'Could not read the file: {x}',
      errFileType: 'Unsupported file type. Use .csv, .xlsx or .xls.',
      errSheetJs: 'Could not load the Excel reader. Check your internet connection, or save the file as CSV.',
      moreErrors: '…and {n} more.',
      credit: 'Agro Calendar · movephutthaphaiboon.github.io/tools',
    },
    th: {
      appTitle: 'แผนภาพปฏิทินฤดูกาล (Agro Calendar)',
      appIntro: 'แปลงตารางปริมาณการจับรายเดือนให้เป็นปฏิทินฤดูกาลแบบวงกลม ข้อมูลของคุณอยู่ในเบราว์เซอร์เท่านั้น',
      language: 'ภาษา', auto: 'อัตโนมัติ',
      titlePh: 'ชื่อแผนภาพ (เช่น ชื่อหมู่บ้าน)', subtitlePh: 'คำอธิบายรอง (เช่น ปีของข้อมูล)',
      downloadPng: 'ดาวน์โหลด PNG', downloadSvg: 'ดาวน์โหลด SVG', downloadCsv: 'ดาวน์โหลดตาราง (CSV)',
      options: 'ตัวเลือกการแสดงผล',
      values: 'ประเภทค่า', modeAuto: 'ตรวจหาอัตโนมัติ', absolute: 'ปริมาณจริง (ต่อเดือน)', percent: 'ร้อยละ / ค่าสัมพัทธ์',
      detected: 'ตรวจพบ: {x}', detAbs: 'ปริมาณจริง', detPct: 'ร้อยละ',
      unit: 'หน่วยของค่า', unitHint: 'เช่น kg, ตัน, ตัว ใช้กับค่าปริมาณจริง',
      scale: 'สเกลสี',
      global: 'รวม: ใช้สเกลเดียวกันทุกชนิด (เปรียบเทียบระหว่างชนิด)',
      perAnimal: 'แยกรายชนิด: แต่ละวงใช้ค่าสูงสุดของตัวเอง (เห็นฤดูกาลชัดขึ้น)',
      more: 'เพิ่มเติม',
      leap: 'ปีอธิกสุรทิน (กุมภาพันธ์ = 29 วัน)',
      reverse: 'สลับลำดับชนิด (วงล้อ: แถวแรกอยู่วงนอกสุด / แถบ: แถวแรกอยู่ล่างสุด)',
      layout: 'รูปแบบ', layoutWheel: 'วงล้อ', layoutBar: 'แถบแนวนอน',
      track: 'แสดงวงสีจางในเดือนที่ไม่มีการจับ',
      data: 'ข้อมูล', tabTable: 'แก้ไขตาราง', tabPaste: 'วางข้อมูล', tabUpload: 'อัปโหลดไฟล์',
      tableHelp: 'หนึ่งแถวต่อหนึ่งชนิด เดือนที่ไม่มีการจับให้เว้นว่าง หรือใส่ 0 หรือ - ใส่ค่าที่ลงท้ายด้วย % ได้ และสามารถคัดลอกช่วงเซลล์จากสเปรดชีตมาวางในตารางได้โดยตรง',
      animal: 'ชนิดสัตว์', addRow: '+ เพิ่มแถว', loadSample: 'โหลดข้อมูลตัวอย่าง', clear: 'ล้างตาราง',
      pasteHelp: 'วางตารางที่คัดลอกจาก Excel / Google Sheets หรือข้อความ CSV แถวแรกต้องเป็นหัวตาราง: คอลัมน์ชื่อสัตว์ ตามด้วยเดือน 1–12, Jan–Dec หรือ ม.ค.–ธ.ค.',
      pasteBtn: 'ใช้ข้อมูลที่วาง',
      uploadHelp: 'เลือกหรือลากไฟล์ CSV หรือ Excel (.csv, .xlsx, .xls) มาวาง ระบบใช้ชีตแรก รูปแบบเดียวกับตาราง',
      sampleLink: 'ดาวน์โหลดไฟล์ CSV ตัวอย่าง',
      deleteRow: 'ลบแถว',
      perDayUnit: '{u}/วัน', pctUnit: '%',
      legendTitleAbs: 'ปริมาณการจับต่อวัน ({u})', legendTitlePct: 'ปริมาณการจับสัมพัทธ์ (%)',
      legendGlobal: 'สเกลร่วม: สีอ่อน = น้อย สีเข้ม = มาก แถบสีเริ่มจาก 0 ถึง {max}',
      legendPer: 'แต่ละชนิดใช้ค่าสูงสุดของตัวเอง: สีอ่อน = น้อย สีเข้ม = มาก',
      peak: 'สูงสุด {x}',
      tipValue: 'ค่า', tipPerDay: 'ต่อวัน', tipDays: '{d} วัน', tipRel: 'ค่าสัมพัทธ์ (ไม่แปลงเป็นต่อวัน)',
      noData: 'เพิ่มอย่างน้อยหนึ่งชนิดที่มีชื่อ เพื่อวาดปฏิทิน',
      loaded: 'โหลดข้อมูล {n} ชนิดแล้ว',
      errorsTitle: 'กรุณาตรวจสอบเซลล์ต่อไปนี้ (จะแสดงเป็นไม่มีการจับจนกว่าจะแก้ไข):',
      errNoHeader: 'ไม่พบคอลัมน์เดือน แถวแรกต้องมีคอลัมน์ชื่อสัตว์และหัวคอลัมน์เดือน 12 เดือน (1–12, Jan–Dec หรือ ม.ค.–ธ.ค.)',
      errMissing: 'ไม่พบคอลัมน์เดือน: {x}',
      errDup: 'เดือน {x} ซ้ำกันมากกว่าหนึ่งคอลัมน์',
      errNumber: 'แถว {r} ({name}) เดือน {m}: "{v}" ไม่ใช่ตัวเลข',
      errNegative: 'แถว {r} ({name}) เดือน {m}: ค่าติดลบไม่ได้',
      errNoName: 'แถว {r} มีค่าแต่ไม่มีชื่อสัตว์',
      errEmpty: 'ไม่พบแถวข้อมูล',
      errFile: 'อ่านไฟล์ไม่ได้: {x}',
      errFileType: 'ไม่รองรับไฟล์ประเภทนี้ ใช้ .csv, .xlsx หรือ .xls',
      errSheetJs: 'โหลดตัวอ่านไฟล์ Excel ไม่ได้ ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือบันทึกไฟล์เป็น CSV',
      moreErrors: '…และอีก {n} รายการ',
      credit: 'Agro Calendar · movephutthaphaiboon.github.io/tools',
    },
  };

  // ---------- State ----------

  const state = {
    rows: [],            // [{ name: string, cells: string[12] }] — raw text, the table is the source of truth
    mode: 'auto',        // 'auto' | 'absolute' | 'percent'
    unit: 'kg',
    leap: false,
    scale: 'global',     // 'global' | 'per'
    reverse: false,
    track: true,
    layout: 'wheel',     // 'wheel' | 'bar'
    langSetting: 'auto', // 'auto' | 'th' | 'en'
    title: '',
    subtitle: '',
  };
  let analysis = { values: [], errors: [], detected: 'absolute' };
  let model = null;      // what the chart currently shows (used by tooltips and exports)
  let loadMsg = null;    // { type: 'info' | 'error', key, vars }
  let renderedWidth = 0;

  const $ = (sel) => document.querySelector(sel);
  const chartEl = $('#chart');
  const tooltipEl = $('#tooltip');

  // ---------- i18n ----------

  function lang() {
    if (state.langSetting !== 'auto') return state.langSetting;
    return state.rows.some((r) => THAI_RE.test(r.name)) ? 'th' : 'en';
  }

  function t(key, vars) {
    const s = I18N[lang()][key] ?? I18N.en[key] ?? key;
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? '')) : s;
  }

  function applyI18n() {
    const L = lang();
    document.documentElement.lang = L;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll('#lang-switch button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === state.langSetting));
    });
    document.querySelectorAll('#layout-switch button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.layout === state.layout));
    });
    const head = $('#data-table thead');
    head.innerHTML = '<tr><th class="name-col">' + esc(t('animal')) + '</th>' +
      MONTHS[L].map((m) => '<th>' + esc(m) + '</th>').join('') + '<th></th></tr>';
    document.querySelectorAll('.del-btn').forEach((b) => { b.title = t('deleteRow'); b.setAttribute('aria-label', t('deleteRow')); });
    $('#detected').textContent = t('detected', { x: t(analysis.detected === 'percent' ? 'detPct' : 'detAbs') });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- Parsing ----------

  function norm(s) { return String(s).toLowerCase().replace(/[\s.]/g, ''); }

  const MONTH_ALIASES = (() => {
    const map = new Map();
    MONTHS_FULL.en.forEach((name, i) => { map.set(norm(name), i); map.set(norm(name).slice(0, 3), i); });
    map.set('sept', 8);
    MONTHS.th.forEach((a, i) => map.set(norm(a), i));
    MONTHS_FULL.th.forEach((a, i) => map.set(norm(a), i));
    return map;
  })();

  // Header text -> month index 0..11, or -1.
  function monthIndex(h) {
    const raw = String(h ?? '').trim();
    if (/^\d+(\.0+)?$/.test(raw)) { const n = parseInt(raw, 10); return n >= 1 && n <= 12 ? n - 1 : -1; }
    const k = norm(raw);
    if (!k) return -1;
    let m = k.match(/^(?:month|m|เดือน(?:ที่)?)(\d{1,2})$/);
    if (m) { const n = +m[1]; return n >= 1 && n <= 12 ? n - 1 : -1; }
    if (MONTH_ALIASES.has(k)) return MONTH_ALIASES.get(k);
    m = k.match(/^([a-z]+)[-/]?\d{2,4}$/); // Excel date headers such as "Jan-24"
    if (m && MONTH_ALIASES.has(m[1])) return MONTH_ALIASES.get(m[1]);
    return -1;
  }

  // One cell of the table -> { v } | { empty } | { error, negative }.
  function parseCell(raw) {
    let s = String(raw ?? '').trim();
    if (s === '' || /^[-–—]$/.test(s)) return { v: 0, empty: true };
    let pct = false;
    if (s.endsWith('%')) { pct = true; s = s.slice(0, -1).trim(); }
    s = s.replace(/\s/g, '');
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');   // 1,234.5
    else if (/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.');             // 12,5 (decimal comma)
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return { error: true };
    const v = Number(s);
    if (!isFinite(v)) return { error: true };
    if (v < 0) return { error: true, negative: true };
    return { v, pct };
  }

  // CSV / TSV / semicolon text -> 2-D array of strings. Handles quoted fields.
  function parseDelimited(text) {
    text = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    const firstLine = text.split('\n').find((l) => l.trim() !== '') || '';
    let delim = ',';
    if (text.includes('\t')) delim = '\t';
    else if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delim = ';';
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
        } else field += ch;
      } else if (ch === '"' && field === '') quoted = true;
      else if (ch === delim) { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += ch;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function i18nError(key, vars) { return { i18n: key, vars }; }

  // 2-D array (first row = headers) -> { rows, hasHeader }. Throws i18nError for structural problems.
  function gridToTable(grid) {
    grid = grid.map((r) => r.map((c) => (c == null ? '' : String(c).trim())))
      .filter((r) => r.some((c) => c !== ''));
    if (!grid.length) throw i18nError('errEmpty');

    const header = grid[0];
    const monthCols = new Array(12).fill(-1);
    let found = 0;
    for (let j = 1; j < header.length; j++) {
      const m = monthIndex(header[j]);
      if (m < 0) continue; // extra columns such as "Total" are ignored
      if (monthCols[m] >= 0) throw i18nError('errDup', { x: MONTHS[lang()][m] });
      monthCols[m] = j;
      found++;
    }

    let start = 1, hasHeader = true;
    if (found === 0) {
      // No header row: accept it if the first row already looks like "name + 12 numbers".
      const looksLikeData = header.length >= 13 && header.slice(1, 13).every((c) => !parseCell(c).error);
      if (!looksLikeData) throw i18nError('errNoHeader');
      for (let m = 0; m < 12; m++) monthCols[m] = m + 1;
      start = 0;
      hasHeader = false;
    } else if (found < 12) {
      const missing = monthCols.map((c, m) => (c < 0 ? MONTHS[lang()][m] : null)).filter(Boolean);
      throw i18nError('errMissing', { x: missing.join(', ') });
    }

    const rows = grid.slice(start).map((r) => ({
      name: r[0] || '',
      cells: monthCols.map((j) => r[j] ?? ''),
    }));
    if (!rows.length) throw i18nError('errEmpty');
    return { rows, hasHeader };
  }

  // Validate the table and detect absolute vs percentage values.
  function analyse(rows) {
    const errors = [];
    let pctCells = 0;
    const values = rows.map((row, r) => {
      const vals = row.cells.map((c, m) => {
        const p = parseCell(c);
        if (p.error) {
          errors.push({ row: r, col: m, key: p.negative ? 'errNegative' : 'errNumber', raw: c });
          return 0;
        }
        if (p.pct) pctCells++;
        return p.v;
      });
      if (!row.name.trim() && vals.some((v) => v > 0)) errors.push({ row: r, col: -1, key: 'errNoName' });
      return vals;
    });
    const named = values.filter((_, i) => rows[i].name.trim());
    let detected = 'absolute';
    if (pctCells > 0) detected = 'percent';
    else if (named.length && named.every((v) => { const s = d3.sum(v); return s > 0 && Math.abs(s - 100) <= 1.5; })) detected = 'percent';
    return { values, errors, detected };
  }

  function effectiveMode() { return state.mode === 'auto' ? analysis.detected : state.mode; }

  // ---------- Model ----------

  function fmtNum(x) {
    const a = Math.abs(x);
    const d = a >= 100 ? 0 : a >= 10 ? 1 : a >= 0.1 ? 2 : 3;
    return x.toLocaleString('en-US', { maximumFractionDigits: d });
  }

  function buildModel() {
    const mode = effectiveMode();
    const days = MONTH_DAYS.slice();
    if (state.leap) days[1] = 29;
    const series = [];
    state.rows.forEach((row, i) => {
      const name = row.name.trim();
      if (!name) return;
      const values = analysis.values[i];
      const perDay = values.map((v, m) => (mode === 'percent' ? v : v / days[m]));
      series.push({
        name, rowIndex: i, values, perDay,
        max: d3.max(perDay) || 0,
        color: PALETTE[series.length % PALETTE.length],
      });
    });
    const unit = state.unit.trim() || (lang() === 'th' ? 'หน่วย' : 'units');
    return {
      series, mode, days, unit,
      L: lang(),
      globalMax: d3.max(series, (s) => s.max) || 0,
      rateUnit: mode === 'percent' ? t('pctUnit') : t('perDayUnit', { u: unit }),
      title: state.title.trim(),
      subtitle: state.subtitle.trim(),
      scale: state.scale,
      reverse: state.reverse,
      layout: state.layout,
      track: state.track,
    };
  }

  // Pale tint of the hue (low catch per day) -> strong, slightly darkened hue (high).
  function ramp(base) {
    const pale = d3.interpolateRgb('#ffffff', base)(0.12);
    const strong = d3.color(base).darker(0.4);
    const i = d3.interpolateLab(pale, strong);
    return (x) => i(0.08 + 0.92 * Math.max(0, Math.min(1, x)));
  }

  function labelColor(base) {
    const c = d3.hsl(base);
    c.l = Math.min(c.l, 0.32);
    return c.formatHex();
  }

  // ---------- Text measurement ----------

  const measureCtx = document.createElement('canvas').getContext('2d');
  function textWidth(text, size, weight) {
    measureCtx.font = `${weight || 400} ${size}px ${FONT}`;
    return measureCtx.measureText(text).width;
  }
  function graphemes(s) {
    if (window.Intl && Intl.Segmenter) return Array.from(new Intl.Segmenter().segment(s), (x) => x.segment);
    return Array.from(s);
  }
  function fitText(text, size, weight, maxW) {
    if (textWidth(text, size, weight) <= maxW) return text;
    const g = graphemes(text);
    while (g.length > 1 && textWidth(g.join('') + '…', size, weight) > maxW) g.pop();
    return g.join('') + '…';
  }

  // ---------- Wheel geometry ----------

  const TAU = Math.PI * 2;
  const SEG = TAU / 12;
  // Clock position p (0 = top) holds month (p + 11) % 12, so month 12 sits at the top and months run clockwise.
  const monthAt = (p) => (p + 11) % 12;
  const segStart = (p) => p * SEG - SEG / 2;
  const polar = (r, a) => [r * Math.sin(a), -r * Math.cos(a)];

  // Split the 12 clock positions into runs of catch / no catch, never splitting a run across the top.
  function runs(active) {
    const out = { on: [], off: [] };
    if (active.every(Boolean)) { out.on.push([0, 12]); return out; }
    if (!active.some(Boolean)) { out.off.push([0, 12]); return out; }
    const s = active.findIndex((a, i) => a !== active[(i + 11) % 12]);
    for (let i = 0; i < 12;) {
      const p = (s + i) % 12, val = active[p];
      let len = 0;
      while (i < 12 && active[(s + i) % 12] === val) { len++; i++; }
      out[val ? 'on' : 'off'].push([p, len]);
    }
    return out;
  }

  // ---------- Drawing ----------

  // Wheel layout: month 12 at the top, months clockwise, first species innermost. Returns the bottom y.
  function drawWheel(svg, defs, m, W, y, idp, compact) {
    const pad = 16;
    const n = m.series.length;
    const labelSpace = compact ? 28 : 38;
    const R = (W - 2 * pad) / 2 - labelSpace;
    const cx = W / 2, cy = y + labelSpace + R;
    const wheel = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    const r0 = R * 0.2;
    const step = Math.min((R - r0) / Math.max(n, 1), R * 0.17);
    const gap = Math.max(1, Math.min(4, step * 0.14));
    const band = step - gap;
    const innermost = R - n * step + gap;

    // Spokes at month boundaries
    for (let p = 0; p < 12; p++) {
      const a = segStart(p);
      const [x1, y1] = polar(Math.max(innermost - 6, 0), a);
      const [x2, y2] = polar(R + 6, a);
      wheel.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .attr('stroke', '#e3e7eb').attr('stroke-width', 1);
    }

    // Month labels around the outside
    const mfs = compact ? 13 : 15;
    for (let p = 0; p < 12; p++) {
      const [x, yy] = polar(R + labelSpace / 2 + 3, p * SEG);
      wheel.append('text').attr('x', x).attr('y', yy).attr('dy', '0.35em')
        .attr('text-anchor', 'middle').attr('font-size', mfs).attr('font-weight', 600)
        .attr('fill', '#3a434c').text(MONTHS[m.L][monthAt(p)]);
    }

    const arc = d3.arc();
    const ordered = m.reverse ? m.series.slice().reverse() : m.series;
    ordered.forEach((s, k) => {
      const ro = R - (n - 1 - k) * step;
      const ri = ro - band;
      const sIndex = m.series.indexOf(s);
      const max = m.scale === 'global' ? m.globalMax : s.max;
      const col = ramp(s.color);
      const ring = wheel.append('g');

      if (m.track) {
        ring.append('path').attr('d', arc({ innerRadius: ri, outerRadius: ro, startAngle: 0, endAngle: TAU }))
          .attr('fill', '#f1f3f5');
      }

      const active = [];
      for (let p = 0; p < 12; p++) {
        const mi = monthAt(p);
        const v = s.perDay[mi];
        active.push(v > 0);
        if (!(v > 0)) continue;
        ring.append('path')
          .attr('d', arc({ innerRadius: ri, outerRadius: ro, startAngle: segStart(p), endAngle: segStart(p) + SEG }))
          .attr('fill', col(max ? v / max : 1))
          .attr('stroke', '#fff').attr('stroke-width', 1)
          .attr('data-k', sIndex).attr('data-m', mi);
      }

      // Outline each run of consecutive months so it reads as one arc; the white strokes stay as separators.
      const rr = runs(active);
      const edge = d3.color(s.color).darker(0.8).formatHex();
      rr.on.forEach(([p, len]) => {
        const a0 = len === 12 ? 0 : segStart(p);
        ring.append('path').attr('d', arc({ innerRadius: ri, outerRadius: ro, startAngle: a0, endAngle: a0 + len * SEG }))
          .attr('fill', 'none').attr('stroke', edge).attr('stroke-width', 1.2).attr('pointer-events', 'none');
      });

      // Name label on the ring: as in the hand sketch, it starts just after the end of an arc (in the longest gap).
      const rc = (ri + ro) / 2;
      let fs = Math.max(8, Math.min(compact ? 12 : 15, band * 0.55));
      const maxAng = TAU * 0.8;
      while (fs > 8 && (textWidth(s.name, fs, 600) + 8) / rc > maxAng) fs -= 0.5;
      const label = fitText(s.name, fs, 600, rc * maxAng - 8);
      const ang = (textWidth(label, fs, 600) + 8) / rc;
      const longestGap = rr.off.slice().sort((a, b) => b[1] - a[1])[0];
      let a0;
      if (longestGap) {
        const gStart = segStart(longestGap[0]), gLen = longestGap[1] * SEG, padA = 4 / rc;
        a0 = ang <= gLen - 2 * padA ? gStart + padA : gStart + gLen / 2 - ang / 2;
      } else {
        a0 = -ang / 2;
      }
      const a1 = a0 + ang;
      const mid = ((((a0 + a1) / 2) % TAU) + TAU) % TAU;
      const flip = mid > Math.PI / 2 && mid < Math.PI * 1.5; // keep text upright on the bottom half
      const large = ang > Math.PI ? 1 : 0;
      const [x0, y0] = polar(rc, flip ? a1 : a0);
      const [x1, y1] = polar(rc, flip ? a0 : a1);
      const pid = `${idp}-lbl-${k}`;
      defs.append('path').attr('id', pid)
        .attr('d', `M${x0},${y0} A${rc},${rc} 0 ${large} ${flip ? 0 : 1} ${x1},${y1}`);
      ring.append('text')
        .attr('font-size', fs).attr('font-weight', 600).attr('fill', labelColor(s.color))
        .attr('stroke', '#fff').attr('stroke-width', 3).attr('stroke-linejoin', 'round')
        .attr('paint-order', 'stroke').attr('dy', '0.35em').attr('pointer-events', 'none')
        .append('textPath').attr('href', '#' + pid).attr('xlink:href', '#' + pid)
        .attr('startOffset', 4).text(label);
    });
    return cy + R + labelSpace;
  }

  // Bar layout: one row per species, months Jan–Dec left to right, first species at the top. Returns the bottom y.
  function drawBars(svg, m, W, y, compact) {
    const pad = 16;
    const ordered = m.reverse ? m.series.slice().reverse() : m.series;
    const nameFs = compact ? 12 : 14;
    const longest = d3.max(ordered, (s) => textWidth(s.name, nameFs, 600)) || 0;
    const labelW = Math.min(W * (compact ? 0.3 : 0.26), Math.max(60, longest));
    const x0 = pad + labelW + 10;
    const colW = (W - pad - x0) / 12;
    const rowH = compact ? 26 : 32;
    const barH = Math.round(rowH * 0.66);
    const headH = compact ? 22 : 26;
    const top = y + headH;
    const bottom = top + ordered.length * rowH;
    const g = svg.append('g');

    // Month headers and gridlines at month boundaries
    let mfs = compact ? 11 : 13;
    while (mfs > 8 && d3.max(MONTHS[m.L], (s) => textWidth(s, mfs, 600)) > colW - 3) mfs -= 0.5;
    for (let mi = 0; mi <= 12; mi++) {
      const x = x0 + mi * colW;
      g.append('line').attr('x1', x).attr('x2', x).attr('y1', top - 4).attr('y2', bottom)
        .attr('stroke', '#e3e7eb').attr('stroke-width', 1);
      if (mi === 12) break;
      g.append('text').attr('x', x + colW / 2).attr('y', top - 9).attr('text-anchor', 'middle')
        .attr('font-size', mfs).attr('font-weight', 600).attr('fill', '#3a434c').text(MONTHS[m.L][mi]);
    }

    ordered.forEach((s, k) => {
      const sIndex = m.series.indexOf(s);
      const max = m.scale === 'global' ? m.globalMax : s.max;
      const col = ramp(s.color);
      const yb = top + k * rowH + (rowH - barH) / 2;
      const row = g.append('g');

      if (m.track) {
        row.append('rect').attr('x', x0).attr('y', yb).attr('width', 12 * colW).attr('height', barH)
          .attr('fill', '#f1f3f5');
      }

      const active = s.perDay.map((v) => v > 0);
      s.perDay.forEach((v, mi) => {
        if (!(v > 0)) return;
        row.append('rect').attr('x', x0 + mi * colW).attr('y', yb).attr('width', colW).attr('height', barH)
          .attr('fill', col(max ? v / max : 1))
          .attr('stroke', '#fff').attr('stroke-width', 1)
          .attr('data-k', sIndex).attr('data-m', mi);
      });

      // Outline each run of consecutive months so it reads as one bar (runs do not wrap from Dec to Jan here).
      const edge = d3.color(s.color).darker(0.8).formatHex();
      for (let a = 0; a < 12;) {
        if (!active[a]) { a++; continue; }
        let b = a;
        while (b < 12 && active[b]) b++;
        row.append('rect').attr('x', x0 + a * colW).attr('y', yb).attr('width', (b - a) * colW).attr('height', barH)
          .attr('fill', 'none').attr('stroke', edge).attr('stroke-width', 1.2).attr('pointer-events', 'none');
        a = b;
      }

      row.append('text').attr('x', x0 - 10).attr('y', yb + barH / 2).attr('dy', '0.35em')
        .attr('text-anchor', 'end').attr('font-size', nameFs).attr('font-weight', 600)
        .attr('fill', labelColor(s.color)).text(fitText(s.name, nameFs, 600, labelW));
    });
    return bottom;
  }

  function drawChart(svgNode, m, W, idp) {
    const svg = d3.select(svgNode);
    svg.selectAll('*').remove();
    const compact = W < 600;
    const pad = 16;
    const n = m.series.length;

    svg.attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('font-family', FONT)
      .attr('role', 'img');
    const bg = svg.append('rect').attr('fill', '#fff');
    const defs = svg.append('defs');

    // Title block
    let y = pad;
    if (m.title) {
      const fs = compact ? 19 : 23;
      svg.append('text').attr('x', W / 2).attr('y', y + fs).attr('text-anchor', 'middle')
        .attr('font-size', fs).attr('font-weight', 600).attr('fill', '#222831')
        .text(fitText(m.title, fs, 600, W - 2 * pad));
      y += fs + 10;
    }
    if (m.subtitle) {
      const fs = compact ? 13 : 15;
      svg.append('text').attr('x', W / 2).attr('y', y + fs).attr('text-anchor', 'middle')
        .attr('font-size', fs).attr('fill', '#5f6b76')
        .text(fitText(m.subtitle, fs, 400, W - 2 * pad));
      y += fs + 8;
    }
    if (m.title || m.subtitle) y += 4;

    y = m.layout === 'bar' ? drawBars(svg, m, W, y, compact) : drawWheel(svg, defs, m, W, y, idp, compact);


    // Legend
    y += 14;
    const unitText = m.rateUnit;
    svg.append('text').attr('x', pad).attr('y', y + 14).attr('font-size', 14).attr('font-weight', 600)
      .attr('fill', '#222831')
      .text(m.mode === 'percent' ? t('legendTitlePct') : t('legendTitleAbs', { u: unitText }));
    y += 22;
    const note = m.scale === 'global'
      ? t('legendGlobal', { max: fmtNum(m.globalMax) + (m.mode === 'percent' ? '%' : ' ' + unitText) })
      : t('legendPer');
    svg.append('text').attr('x', pad).attr('y', y + 12).attr('font-size', 12).attr('fill', '#5f6b76')
      .text(fitText(note, 12, 400, W - 2 * pad));
    y += 24;

    const cols = compact ? 2 : 3;
    const colW = (W - 2 * pad) / cols;
    const barW = compact ? 44 : 64;
    const itemH = 36;
    m.series.forEach((s, i) => {
      const x = pad + (i % cols) * colW;
      const yy = y + Math.floor(i / cols) * itemH;
      const gid = `${idp}-grad-${i}`;
      const col = ramp(s.color);
      const grad = defs.append('linearGradient').attr('id', gid)
        .attr('gradientUnits', 'userSpaceOnUse').attr('x1', x).attr('x2', x + barW).attr('y1', 0).attr('y2', 0);
      [0, 0.25, 0.5, 0.75, 1].forEach((o) => grad.append('stop').attr('offset', o).attr('stop-color', col(o)));
      const frac = m.scale === 'global' && m.globalMax ? s.max / m.globalMax : 1;
      svg.append('rect').attr('x', x).attr('y', yy + 6).attr('width', barW).attr('height', 12).attr('rx', 2)
        .attr('fill', '#f1f3f5');
      svg.append('rect').attr('x', x).attr('y', yy + 6).attr('width', Math.max(0, barW * frac)).attr('height', 12).attr('rx', 2)
        .attr('fill', `url(#${gid})`);
      svg.append('rect').attr('x', x).attr('y', yy + 6).attr('width', barW).attr('height', 12).attr('rx', 2)
        .attr('fill', 'none').attr('stroke', d3.color(s.color).darker(0.8).formatHex()).attr('stroke-width', 0.8);
      const tx = x + barW + 8, tw = colW - barW - 14;
      svg.append('text').attr('x', tx).attr('y', yy + 13).attr('font-size', 13).attr('font-weight', 600)
        .attr('fill', labelColor(s.color)).text(fitText(s.name, 13, 600, tw));
      const peak = fmtNum(s.max) + (m.mode === 'percent' ? '%' : ' ' + unitText);
      svg.append('text').attr('x', tx).attr('y', yy + 29).attr('font-size', 11).attr('fill', '#5f6b76')
        .text(fitText(t('peak', { x: peak }), 11, 400, tw));
    });
    y += Math.ceil(n / cols) * itemH + 6;

    svg.append('text').attr('x', W - pad).attr('y', y + 10).attr('text-anchor', 'end')
      .attr('font-size', 10).attr('fill', '#9aa3ab').text(t('credit'));
    const H = Math.ceil(y + 20);

    bg.attr('width', W).attr('height', H);
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', W).attr('height', H);
    svg.attr('aria-label', [m.title, m.subtitle].filter(Boolean).join(' — ') || t('appTitle'));
    return { W, H };
  }

  function chartWidth() { return chartEl.clientWidth < 560 ? 480 : EXPORT_WIDTH; }

  function renderChart() {
    model = buildModel();
    hideTip();
    const has = model.series.length > 0;
    ['#dl-png', '#dl-svg'].forEach((s) => { $(s).disabled = !has; });
    if (!has) {
      chartEl.innerHTML = '<div class="chart-empty">' + esc(t('noData')) + '</div>';
      renderedWidth = 0;
      return;
    }
    let svg = chartEl.querySelector('svg');
    if (!svg) {
      chartEl.innerHTML = '';
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chartEl.appendChild(svg);
    }
    renderedWidth = chartWidth();
    drawChart(svg, model, renderedWidth, 'live');
  }

  // ---------- Tooltip ----------

  let tipTarget = null;

  function showTip(el, evt) {
    const s = model.series[+el.dataset.k];
    const mi = +el.dataset.m;
    if (!s) return;
    if (tipTarget && tipTarget !== el) tipTarget.setAttribute('stroke', '#fff');
    tipTarget = el;
    el.setAttribute('stroke', '#222831');
    el.parentNode.appendChild(el); // bring to front so the highlight stroke is visible
    const raw = state.rows[s.rowIndex].cells[mi];
    const v = s.values[mi];
    let html = `<strong>${esc(s.name)}</strong>${esc(MONTHS_FULL[model.L][mi])}<br>`;
    if (model.mode === 'percent') {
      html += `${esc(t('tipValue'))}: ${esc(fmtNum(v))}%<br><em>${esc(t('tipRel'))}</em>`;
    } else {
      html += `${esc(t('tipValue'))}: ${esc(String(raw).trim() || fmtNum(v))} ${esc(model.unit)}<br>` +
        `${esc(t('tipPerDay'))}: <b>${esc(fmtNum(s.perDay[mi]))} ${esc(model.rateUnit)}</b> ` +
        `(÷ ${esc(t('tipDays', { d: model.days[mi] }))})`;
    }
    tooltipEl.innerHTML = html;
    tooltipEl.hidden = false;
    const box = chartEl.parentNode.getBoundingClientRect();
    const half = Math.min(120, box.width / 2);
    const x = Math.max(half, Math.min(box.width - half, evt.clientX - box.left));
    let yy = evt.clientY - box.top;
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = yy + 'px';
    // Flip below the pointer when there is no room above.
    tooltipEl.style.transform = yy < tooltipEl.offsetHeight + 16 ? 'translate(-50%, 16px)' : '';
  }

  function hideTip() {
    tooltipEl.hidden = true;
    if (tipTarget) { tipTarget.setAttribute('stroke', '#fff'); tipTarget = null; }
  }

  chartEl.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('[data-k]');
    if (el) showTip(el, e); else hideTip();
  });
  chartEl.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hideTip(); });
  chartEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    const el = e.target.closest('[data-k]');
    if (el) showTip(el, e); else hideTip();
  });
  document.addEventListener('pointerdown', (e) => { if (!chartEl.contains(e.target)) hideTip(); });

  // ---------- Table ----------

  const tbody = $('#data-table tbody');
  const emptyRow = () => ({ name: '', cells: new Array(12).fill('') });

  function buildTable() {
    tbody.innerHTML = state.rows.map((row, r) =>
      '<tr>' +
      `<td class="name-cell"><input type="text" data-r="${r}" data-c="-1" value="${esc(row.name)}" aria-label="${esc(t('animal'))} ${r + 1}"></td>` +
      row.cells.map((c, m) => `<td><input type="text" inputmode="decimal" data-r="${r}" data-c="${m}" value="${esc(c)}" aria-label="${esc(row.name)} ${esc(MONTHS.en[m])}"></td>`).join('') +
      `<td class="row-del"><button type="button" class="del-btn" data-del="${r}" title="${esc(t('deleteRow'))}" aria-label="${esc(t('deleteRow'))}">×</button></td>` +
      '</tr>').join('');
  }

  function decorateTable() {
    tbody.querySelectorAll('input.invalid').forEach((el) => el.classList.remove('invalid'));
    analysis.errors.forEach((e) => {
      const el = tbody.querySelector(`input[data-r="${e.row}"][data-c="${e.col}"]`);
      if (el) el.classList.add('invalid');
    });
    const colorOf = new Map((model ? model.series : []).map((s) => [s.rowIndex, s.color]));
    tbody.querySelectorAll('input[data-c="-1"]').forEach((el) => {
      const c = colorOf.get(+el.dataset.r);
      el.style.boxShadow = c ? `inset 4px 0 0 ${c}` : '';
    });
  }

  tbody.addEventListener('input', (e) => {
    const el = e.target;
    if (!el.matches('input[data-r]')) return;
    const r = +el.dataset.r, c = +el.dataset.c;
    if (c === -1) state.rows[r].name = el.value; else state.rows[r].cells[c] = el.value;
    loadMsg = null;
    scheduleUpdate();
  });

  tbody.addEventListener('click', (e) => {
    const b = e.target.closest('[data-del]');
    if (!b) return;
    state.rows.splice(+b.dataset.del, 1);
    loadMsg = null;
    buildTable();
    update();
  });

  // Pasting a block copied from a spreadsheet into a cell fills the table from that cell;
  // pasting a whole table with a header row replaces the table.
  tbody.addEventListener('paste', (e) => {
    const el = e.target;
    if (!el.matches('input[data-r]')) return;
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (!/[\t\n]/.test(text.replace(/[\r\n]+$/, ''))) return;
    e.preventDefault();
    const grid = parseDelimited(text.replace(/[\r\n]+$/, ''));
    let parsed = null;
    try { parsed = gridToTable(grid); } catch (_) { /* not a full table: fill cells instead */ }
    if (parsed && parsed.hasHeader) { loadRows(parsed.rows); return; }
    const r0 = +el.dataset.r, c0 = +el.dataset.c;
    grid.forEach((line, i) => {
      const r = r0 + i;
      while (state.rows.length <= r) state.rows.push(emptyRow());
      line.forEach((val, j) => {
        const c = c0 + j;
        if (c === -1) state.rows[r].name = val.trim();
        else if (c >= 0 && c < 12) state.rows[r].cells[c] = val.trim();
      });
    });
    loadMsg = null;
    buildTable();
    update();
  });

  // ---------- Loading data ----------

  function loadRows(rows) {
    // The sample's title would mislabel the user's own data.
    if (state.title === SAMPLE.title && state.subtitle === SAMPLE.subtitle) {
      state.title = state.subtitle = '';
      $('#title').value = $('#subtitle').value = '';
    }
    state.rows = rows;
    loadMsg = { type: 'info', key: 'loaded', vars: { n: rows.filter((r) => r.name.trim()).length } };
    buildTable();
    update();
  }

  function loadSample() {
    loadRows(SAMPLE.rows.map((r) => ({ name: r[0], cells: r.slice(1).map((v) => (v ? String(v) : '0')) })));
    state.title = SAMPLE.title;
    state.subtitle = SAMPLE.subtitle;
    $('#title').value = state.title;
    $('#subtitle').value = state.subtitle;
    update();
    loadMsg = null;
    renderMessages();
  }

  function showLoadError(err) {
    loadMsg = err && err.i18n
      ? { type: 'error', key: err.i18n, vars: err.vars }
      : { type: 'error', key: 'errFile', vars: { x: (err && err.message) || String(err) } };
    renderMessages();
  }

  function decodeText(buf) {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
    catch (_) { return new TextDecoder('windows-874').decode(buf); } // Thai Excel "CSV" files are often TIS-620
  }

  let sheetJsPromise = null;
  function loadSheetJs() {
    if (window.XLSX) return Promise.resolve();
    if (!sheetJsPromise) {
      sheetJsPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = SHEETJS_URL;
        s.onload = resolve;
        s.onerror = () => { sheetJsPromise = null; reject(i18nError('errSheetJs')); };
        document.head.appendChild(s);
      });
    }
    return sheetJsPromise;
  }

  async function handleFile(file) {
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    try {
      let grid;
      if (['csv', 'tsv', 'txt'].includes(ext)) {
        grid = parseDelimited(decodeText(await file.arrayBuffer()));
      } else if (['xlsx', 'xls', 'xlsm'].includes(ext)) {
        await loadSheetJs();
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        grid = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
      } else {
        throw i18nError('errFileType');
      }
      loadRows(gridToTable(grid).rows);
      switchTab('table');
    } catch (err) {
      showLoadError(err);
    }
  }

  // ---------- Messages ----------

  function renderMessages() {
    const box = $('#messages');
    let html = '';
    if (loadMsg) html += `<div class="msg msg--${loadMsg.type}">${esc(t(loadMsg.key, loadMsg.vars))}</div>`;
    const errs = analysis.errors;
    if (errs.length) {
      const L = lang();
      const items = errs.slice(0, 8).map((e) => {
        const name = state.rows[e.row].name.trim() || '—';
        return '<li>' + esc(t(e.key, { r: e.row + 1, name, m: e.col >= 0 ? MONTHS[L][e.col] : '', v: e.raw })) + '</li>';
      });
      if (errs.length > 8) items.push('<li>' + esc(t('moreErrors', { n: errs.length - 8 })) + '</li>');
      html += `<div class="msg msg--error">${esc(t('errorsTitle'))}<ul>${items.join('')}</ul></div>`;
    }
    box.innerHTML = html;
  }

  // ---------- Update cycle ----------

  let lastLang = null;
  function update() {
    analysis = analyse(state.rows);
    if (lang() !== lastLang) {
      lastLang = lang();
      applyI18n();
      // Rebuilding while the user types a name would steal focus; the header is already re-labelled.
      if (!tbody.contains(document.activeElement)) buildTable();
    }
    $('#detected').textContent = t('detected', { x: t(analysis.detected === 'percent' ? 'detPct' : 'detAbs') });
    renderChart();
    decorateTable();
    renderMessages();
  }

  let updateTimer = null;
  function scheduleUpdate() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(update, 150);
  }

  // ---------- Export ----------

  let fontCssPromise = null;
  function fontCss() {
    if (!fontCssPromise) {
      fontCssPromise = Promise.all(FONT_FILES.map(async (f) => {
        const res = await fetch(FONT_BASE + f.file);
        if (!res.ok) throw new Error(res.status);
        const blob = new Blob([await res.arrayBuffer()], { type: 'font/woff2' });
        const url = await new Promise((resolve) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result);
          fr.readAsDataURL(blob);
        });
        return `@font-face{font-family:'Noto Sans Thai';font-style:normal;font-weight:${f.w};src:url(${url}) format('woff2');unicode-range:${f.range};}`;
      })).then((rules) => rules.join('\n')).catch(() => { fontCssPromise = null; return ''; });
    }
    return fontCssPromise;
  }

  async function exportSvgString() {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const size = drawChart(node, model, EXPORT_WIDTH, 'export');
    const css = await fontCss();
    if (css) {
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = css;
      node.insertBefore(style, node.firstChild);
    }
    const str = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(node);
    return { str, ...size };
  }

  function fileBase() {
    const s = (state.title || 'agro-calendar').trim().replace(/[\\/:*?"<>|#%]+/g, '').replace(/\s+/g, '-').slice(0, 60);
    return s || 'agro-calendar';
  }

  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  async function withBusy(btn, fn) {
    btn.disabled = true;
    try { await fn(); } finally { btn.disabled = false; }
  }

  $('#dl-svg').addEventListener('click', (e) => withBusy(e.currentTarget, async () => {
    const { str } = await exportSvgString();
    download(new Blob([str], { type: 'image/svg+xml' }), fileBase() + '.svg');
  }));

  async function renderPngBlob() {
    const { str, W, H } = await exportSvgString();
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
    await img.decode();
    await new Promise((r) => setTimeout(r, 100)); // let embedded fonts settle before rasterising
    const canvas = document.createElement('canvas');
    canvas.width = W * PNG_SCALE;
    canvas.height = H * PNG_SCALE;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  $('#dl-png').addEventListener('click', (e) => withBusy(e.currentTarget, async () => {
    download(await renderPngBlob(), fileBase() + '.png');
  }));

  function csvField(s) {
    s = String(s ?? '');
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function tableCsv() {
    const lines = [['Animal', ...MONTHS.en.map((_, i) => String(i + 1))]];
    state.rows.forEach((r) => lines.push([r.name, ...r.cells]));
    return '﻿' + lines.map((l) => l.map(csvField).join(',')).join('\r\n') + '\r\n';
  }

  $('#dl-csv').addEventListener('click', () => {
    download(new Blob([tableCsv()], { type: 'text/csv;charset=utf-8' }), fileBase() + '.csv');
  });

  // ---------- Controls ----------

  function switchTab(name) {
    document.querySelectorAll('.tabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    document.querySelectorAll('.tab-panel').forEach((p) => { p.hidden = p.dataset.panel !== name; });
  }
  document.querySelectorAll('.tabs [data-tab]').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  document.querySelectorAll('#lang-switch button').forEach((b) => b.addEventListener('click', () => {
    state.langSetting = b.dataset.lang;
    lastLang = null;
    update();
  }));

  document.querySelectorAll('#layout-switch button').forEach((b) => b.addEventListener('click', () => {
    state.layout = b.dataset.layout;
    lastLang = null; // re-run applyI18n so the pressed state updates
    update();
  }));

  $('#title').addEventListener('input', (e) => { state.title = e.target.value; scheduleUpdate(); });
  $('#subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; scheduleUpdate(); });
  $('#unit').addEventListener('input', (e) => { state.unit = e.target.value; scheduleUpdate(); });
  $('#mode').addEventListener('change', (e) => { state.mode = e.target.value; update(); });
  $('#leap').addEventListener('change', (e) => { state.leap = e.target.checked; update(); });
  $('#reverse').addEventListener('change', (e) => { state.reverse = e.target.checked; update(); });
  $('#track').addEventListener('change', (e) => { state.track = e.target.checked; update(); });
  document.querySelectorAll('input[name="scale"]').forEach((el) => el.addEventListener('change', () => {
    state.scale = document.querySelector('input[name="scale"]:checked').value;
    update();
  }));

  $('#add-row').addEventListener('click', () => {
    state.rows.push(emptyRow());
    buildTable();
    update();
    const inputs = tbody.querySelectorAll('input[data-c="-1"]');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });
  $('#clear-table').addEventListener('click', () => {
    state.rows = [emptyRow()];
    loadMsg = null;
    buildTable();
    update();
  });
  $('#load-sample').addEventListener('click', loadSample);

  $('#paste-apply').addEventListener('click', () => {
    const text = $('#paste-area').value;
    try {
      loadRows(gridToTable(parseDelimited(text)).rows);
      switchTab('table');
    } catch (err) {
      showLoadError(err);
    }
  });

  $('#file-input').addEventListener('change', (e) => { handleFile(e.target.files[0]); e.target.value = ''; });
  const dz = $('#dropzone');
  ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));

  // Re-layout when the chart crosses the phone/desktop breakpoint.
  new ResizeObserver(() => { if (model && model.series.length && chartWidth() !== renderedWidth) renderChart(); }).observe(chartEl);

  // Inside the site's iframe: report our height so the page can size the frame without a scrollbar.
  // Measure the content, not the document: scrollHeight never drops below the frame's own height.
  if (window.self !== window.top) {
    const appEl = $('.app');
    new ResizeObserver(() => {
      const pad = parseFloat(getComputedStyle(document.body).paddingTop) * 2;
      window.parent.postMessage({ type: 'agro-calendar-height', height: Math.ceil(appEl.offsetHeight + pad) }, '*');
    }).observe(appEl);
  } else {
    $('#app-header').hidden = false;
  }

  // Test hook (used by the automated checks; harmless otherwise).
  window.agroCalendar = { state, loadRows, gridToTable, parseDelimited, analyse, renderPngBlob, exportSvgString, update, tableCsv };

  // ---------- Init ----------

  loadSample();
  // Label sizes are measured with the web font, so redraw once it has loaded.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => renderChart());
})();
