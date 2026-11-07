---
layout: single
title: "Fishing Calendar"
permalink: /tools/fishing-calendar/
# Old address (renamed from Agro Calendar); keeps links that were already shared working.
redirect_from: /tools/agro-calendar/
author_profile: false
excerpt: "Turn a monthly fishing catch table into a seasonal calendar."
---

Turn a seasonal fishing catch table (one row per species, one column per month) into a seasonal calendar, coloured by the **monthly catch**. Choose **horizontal bars** (one row per species, January to December) or a **wheel** (month 12 at the top, months clockwise, one ring per species). Your data stays in your browser.

<a href="/assets/tools/fishing-calendar/app.html?v={{ site.time | date: '%s' }}" target="_blank" style="display:inline-block; margin-bottom:1rem; padding:0.6rem 1.2rem; background:#52adc8; color:#fff; border-radius:6px; font-weight:600; text-decoration:none;">&#x26F6; Open in full window</a>
&nbsp; <a href="/assets/tools/fishing-calendar/sample.csv" download>Download sample CSV</a>
&nbsp;·&nbsp; <a href="https://github.com/movephutthaphaiboon/movephutthaphaiboon.github.io/blob/master/assets/tools/fishing-calendar/README.md">Input format guide</a>

<iframe
  id="fishing-calendar-frame"
  src="/assets/tools/fishing-calendar/app.html?v={{ site.time | date: '%s' }}"
  title="Fishing Calendar"
  width="100%"
  height="1500"
  frameborder="0"
  style="border: 1px solid #e0e4e8; border-radius: 10px;">
</iframe>

<script>
  /* The app posts its content height so the iframe never needs an inner scrollbar.
     Block comments only: the production build joins lines, which turns a // comment into a broken script. */
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'fishing-calendar-height') {
      document.getElementById('fishing-calendar-frame').style.height = (e.data.height + 20) + 'px';
    }
  });
</script>

## Input format

| Animal | 1 | 2 | 3 | … | 12 |
|---|---|---|---|---|---|
| ปูดำ | 20 | 35 | 40 | … | 10 |

- First column: the species name. Other columns: months, with headers `1`–`12`, `Jan`–`Dec`, or `ม.ค.`–`ธ.ค.`.
- Values can be absolute amounts (e.g. kg per month) or percentages (used as relative intensity).
- A blank cell, `0` or `-` means no catch that month.
