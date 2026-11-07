---
layout: single
title: "Agro Calendar Visualization"
permalink: /tools/agro-calendar/
author_profile: false
excerpt: "Turn a monthly catch table into a circular seasonal calendar."
---

Turn a seasonal catch or harvest table (one row per species, one column per month) into a circular calendar. Month 12 is at the top and months run clockwise. Each species gets its own ring, coloured by **catch per day**. Your data stays in your browser.

<a href="/assets/tools/agro-calendar/app.html" target="_blank" style="display:inline-block; margin-bottom:1rem; padding:0.6rem 1.2rem; background:#52adc8; color:#fff; border-radius:6px; font-weight:600; text-decoration:none;">&#x26F6; Open in full window</a>
&nbsp; <a href="/assets/tools/agro-calendar/sample.csv" download>Download sample CSV</a>
&nbsp;·&nbsp; <a href="https://github.com/movephutthaphaiboon/movephutthaphaiboon.github.io/blob/master/assets/tools/agro-calendar/README.md">Input format guide</a>

<iframe
  id="agro-calendar-frame"
  src="/assets/tools/agro-calendar/app.html"
  title="Agro Calendar Visualization"
  width="100%"
  height="1500"
  frameborder="0"
  style="border: 1px solid #e0e4e8; border-radius: 10px;">
</iframe>

<script>
  // The app posts its content height so the iframe never needs an inner scrollbar.
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'agro-calendar-height') {
      document.getElementById('agro-calendar-frame').style.height = (e.data.height + 20) + 'px';
    }
  });
</script>

## Input format

| Animal | 1 | 2 | 3 | … | 12 |
|---|---|---|---|---|---|
| ปูดำ | 20 | 35 | 40 | … | 10 |

- First column: the species name. Other columns: months, with headers `1`–`12`, `Jan`–`Dec`, or `ม.ค.`–`ธ.ค.`.
- Values can be absolute amounts (e.g. kg per month, converted to kg/day) or percentages (used as relative intensity).
- A blank cell, `0` or `-` means no catch that month.
