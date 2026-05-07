---
title: "Nokia Snake"
excerpt: "Classic Snake with Nokia 3310 LCD aesthetics — monotone green display, on-screen D-pad for mobile, and auto-detected arrow-key controls for desktop."
type: "Game"
tools: ["Claude", "JavaScript", "HTML", "CSS"]
status: "complete"
date: 2026-05-07
---

## Play the game

<a href="/assets/games/nokia-snake/index.html" target="_blank" style="display:inline-block; margin-bottom:1rem; padding:0.6rem 1.2rem; background:#52adc8; color:#fff; border-radius:6px; font-weight:600; text-decoration:none;">&#x26F6; Play in fullscreen</a>

<iframe
  src="/assets/games/nokia-snake/index.html"
  width="100%"
  height="680"
  frameborder="0"
  style="border: 1px solid #e0e4e8; border-radius: 10px;">
</iframe>

---

<!-- ## What I built

A browser-based Nokia 3310-style Snake game. The visual design mimics the original LCD screen — greenish monochrome palette, pixel-art snake with blinking food, and subtle scanline overlay. The phone shell wraps the game canvas with a D-pad layout that works on touchscreens.

On mobile: tap the on-screen ▲▼◀▶ buttons or swipe directly on the canvas. On desktop: the game auto-detects the first arrow key press and switches to keyboard mode (showing a hint). The game loop separates rendering (requestAnimationFrame) from game logic (setInterval) so the food blink stays smooth even as speed increases.

## What AI helped with

Claude wrote the initial game loop structure, canvas rendering, and the direction-reversal guard. The Nokia colour palette and scanline CSS effect came from a back-and-forth on how to nail the old-screen feel without being garish.

## What I learned

Keeping rendering and game logic on separate loops (rAF vs setInterval) is the right architecture even for a tiny game — it keeps animation smooth while letting game speed scale independently. -->
