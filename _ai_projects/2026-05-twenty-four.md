---
title: "Twenty-Four"
excerpt: "A timed math puzzle game — combine four numbers using +−×÷√% to make 24."
type: "Game"
tools: ["Claude", "JavaScript", "HTML", "CSS"]
status: "complete"
date: 2026-05-07
---

## Play the game

<a href="/assets/games/twenty-four/index.html" target="_blank" style="display:inline-block; margin-bottom:1rem; padding:0.6rem 1.2rem; background:#52adc8; color:#fff; border-radius:6px; font-weight:600; text-decoration:none;">&#x26F6; Play in fullscreen</a>

<iframe
  src="/assets/games/twenty-four/index.html"
  width="100%"
  height="640"
  frameborder="0"
  style="border: 1px solid #e0e4e8; border-radius: 10px;">
</iframe>

---

<!-- ## What I built

A browser-based version of the classic 24 card game. You get four random numbers (1–9) and must combine them with addition, subtraction, multiplication, and division to reach exactly 24. You choose how long you want to play and how many skips you get — then go until the timer runs out. Your score is how many puzzles you solved correctly.

## What AI helped with

I used Claude to scaffold the core JavaScript logic — especially the expression validator, which needed to check that the player used all four digits exactly once and that the expression evaluates to 24 within a floating-point tolerance. Claude also helped structure the click-to-build input pattern (tracking which digit indices are used, handling backspace) and suggested the `Function('"use strict"; return (' + expr + ')')()` evaluation approach with a regex safety guard.

The CSS layout and colour choices were built together — I wanted it minimal and consistent with the rest of this site.

## What I learned

Expression parsing is trickier than it looks. The tricky part was not just evaluating the expression, but tracking *which* digits had been used (so you can't reuse a number). I ended up tracking used digit indices rather than values, which handles duplicate digits correctly (e.g. if you have two 3s, using one 3 shouldn't block the other). -->

<!-- ## Reflections

*To be filled in after playing for a while — what strategies work? Which number combinations are hardest? Does the time pressure actually feel fun or just stressful?* -->
