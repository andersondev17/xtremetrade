---
name: interactive-animation
description: >
  Build interactive UI animations using HTML, CSS @keyframes, and minimal JavaScript — following the 5 principles of interactive animation from Val Head's "Designing Interface Animation". Use this skill whenever the user asks to animate a UI component, create a state-transition animation (expand/collapse, show/hide, mini-player, card flip, drawer), build something like a music player, animated widget, or any interactive element that changes visual state on user input. Also trigger when the user says things like "animate this component", "CSS animation with interaction", "make it collapse/expand", or "replicate this kind of animation" pointing at a UI demo. Don't wait for the user to explicitly say "use interactive animation principles" — if animation + interactivity are both present, this skill applies.
---

# Interactive Animation Skill

Build interactive state-transition UI animations: pure HTML + CSS `@keyframes` + minimal JS class toggling. No framework needed. Rooted in Val Head's 5 principles.

---

## Before writing any code — think through the animation

Answer these 4 questions mentally before touching a keyboard:

1. **What is the trigger?** (click, hover, scroll, input)
2. **What states exist?** (expanded → collapsed, hidden → visible, idle → active)
3. **What elements animate?** List each one and what property changes
4. **Is every animation justified?** If you can't explain its UX purpose in one sentence, cut it

---

## The 5 Principles — apply as a checklist

| # | Principle | In practice |
|---|-----------|-------------|
| 1 | **Known purpose** | Every animation must communicate something (state change, brand mood, attention) |
| 2 | **Non-blocking** | Never make a user wait for an animation to finish before acting again |
| 3 | **Flexible** | Respond to new input even if mid-animation; use `animation-fill-mode: forwards`, not locks |
| 4 | **Fast & legible** | 200–500ms general; 200–350ms for small UI transitions. Complex easing needs more time |
| 5 | **Performance-first** | Prefer `transform` and `opacity` — they skip layout/paint and only composite. Avoid animating `width`, `height`, `top`, `left` unless unavoidable |

> **Performance note**: The Platzi music player example animates `width`, `height`, and `margin` for visual fidelity — acceptable for small components. For production or scroll-heavy UIs, always convert to `transform: scale()` + `translate()`.

---

## Core architectural pattern

This is the **two-layer stacked state** pattern — the foundation of the music player animation and most state-transition UIs:

```html
<div class="wrapper">
  <!-- Layer 1: background state (always rendered, revealed when foreground collapses) -->
  <div class="background">...</div>

  <!-- Layer 2: foreground state (sits on top via position: absolute) -->
  <div class="foreground">...</div>
</div>
```

```css
.wrapper {
  position: relative;
  overflow: hidden; /* clips both layers cleanly */
}

.background,
.foreground {
  position: absolute;
  width: 100%;
  height: 100%;
}
```

The foreground collapses on trigger, revealing the background. JS only toggles classes — CSS does the work.

---

## CSS animation pattern

### State-transition via class toggle

```css
/* Collapsed state — applied via JS on trigger */
.foreground--collapsed {
  animation: collapse-foreground 0.4s ease-in-out forwards;
}

@keyframes collapse-foreground {
  to {
    height: 20%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
```

**Rules:**
- Always use `forwards` fill mode — the element stays at the final keyframe
- One `@keyframes` block per animated element
- Name keyframes after what they *do*, not what they are: `collapse-foreground`, not `foreground-animation`
- Group related keyframes together in your CSS

### Timing coordination

When multiple elements animate on the same trigger, stagger them slightly for polish:

```css
.element-a { animation: ... 0.4s ease-in-out forwards; }
.element-b { animation: ... 0.4s ease-in-out 0.05s forwards; } /* 50ms delay */
.element-c { animation: ... 0.35s ease-in-out forwards; }
```

---

## JS pattern — keep it surgical

```js
const trigger = document.querySelector('.trigger')
const foreground = document.querySelector('.foreground')
const image = document.querySelector('.main-image')
const playerBox = document.querySelector('.player-box')

function collapse() {
  foreground.classList.add('foreground--collapsed')
  image.classList.add('image--small')
  playerBox.classList.add('player-box--mini')
  trigger.classList.add('trigger--hidden')
}

trigger.addEventListener('click', collapse)
```

This is the complete JS for the music player pattern. Resist adding more unless the feature genuinely requires it.

For **reversible** animations (toggle back and forth), use `classList.toggle()` and define both states:

```js
trigger.addEventListener('click', () => {
  const isCollapsed = foreground.classList.toggle('foreground--collapsed')
  image.classList.toggle('image--small')
  // etc.
})
```

For reversible CSS: define both `@keyframes` (expand + collapse) and use `animation-direction` or two separate classes.

---

## Complete music player reference implementation

This is the exact animation from the Platzi article — use as a reference or starting point:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      height: 100vh;
      display: grid;
      place-items: center;
      background: LightSkyBlue;
      font-family: 'Lato', sans-serif;
    }

    .wrapper {
      width: 360px;
      height: 425px;
      position: relative;
      border-radius: 30px;
      overflow: hidden;
    }

    /* ── Background: song list ── */
    .background {
      background: white;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 30px;
      padding: 106px 20px 20px;
      overflow-y: scroll;
      list-style: none;
      margin: 0;
    }

    .card {
      display: flex;
      width: 100%;
      padding: 20px 0;
      border-bottom: 1px solid Gainsboro;
    }

    .card > img {
      width: 60px;
      height: 60px;
      border-radius: 24px;
      margin-right: 10px;
      object-fit: cover;
    }

    .card > div {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 8px 0;
      width: 100%;
    }

    .card div p:first-child { font-size: 16px; margin: 0; }
    .card div p:last-child {
      color: DarkGray;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin: 0;
    }

    /* ── Foreground: now playing ── */
    .foreground {
      background: white;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 30px;
      display: flex;
      flex-direction: column;
    }

    .menu-icon {
      position: absolute;
      margin: 20px;
      left: 0;
      cursor: pointer;
      width: 24px;
      height: 24px;
    }

    .main-image {
      width: 100%;
      height: 75%;
      border-radius: 30px;
      object-fit: cover;
    }

    .player-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 8px auto;
      position: absolute;
      bottom: 0;
    }

    .player-box > div:first-child {
      display: flex;
      width: 70%;
      align-items: center;
    }

    .player-box > div:first-child div {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
      width: 100%;
      height: 46px;
    }

    .player-box > div:first-child div > p:first-child { font-size: 16px; margin: 0; }
    .player-box > div:first-child div > p:last-child { color: DarkGray; font-size: 12px; margin: 0; }

    .progress-track {
      background: Gainsboro;
      width: 80%;
      height: 5px;
      border-radius: 5px;
      position: relative;
      margin: 6px 0 10px;
    }

    .progress-fill {
      background: LightSkyBlue;
      border-radius: 5px;
      position: absolute;
      width: 80%;
      height: 100%;
    }

    .progress-thumb {
      background: LightSkyBlue;
      position: absolute;
      right: 50px;
      width: 10px;
      height: 10px;
      top: -3px;
      border-radius: 50%;
    }

    /* ── Animations ── */
    .menu-icon--hidden {
      animation: hide-menu 0.5s ease-in-out forwards;
    }
    @keyframes hide-menu {
      to { width: 0; height: 0; }
    }

    .main-image--small {
      animation: shrink-image 0.5s ease-in-out forwards;
    }
    @keyframes shrink-image {
      to {
        width: 60px;
        height: 60px;
        border-radius: 24px;
        margin: 20px 10px 0 20px;
      }
    }

    .player-box--mini {
      animation: move-player-box 0.5s ease-in-out forwards;
    }
    @keyframes move-player-box {
      0%  { width: 100%; right: -10px; }
      100%{ width: 85%;  right: -10px; bottom: 0; }
    }

    .foreground--collapsed {
      animation: collapse-foreground 0.5s ease-in-out forwards;
    }
    @keyframes collapse-foreground {
      to {
        height: 25%;
        box-shadow: 0 5px 10px rgba(0,0,0,0.1), 0 3px 3px rgba(0,0,0,0.1);
      }
    }
  </style>
</head>
<body>

  <div class="wrapper">
    <ul class="background">
      <li class="card">
        <img src="https://upload.wikimedia.org/wikipedia/en/5/59/Dua_Lipa_-_Future_Nostalgia_%28Official_Album_Cover%29.png" alt="Dua Lipa">
        <div>
          <p>Dua Lipa</p>
          <p><span>Levitating</span><span>3:23</span></p>
        </div>
      </li>
      <!-- Add more .card items as needed -->
    </ul>

    <div class="foreground">
      <!-- Menu icon — clicking this triggers the collapse -->
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>

      <img class="main-image" src="https://i.ytimg.com/vi/BC19kwABFwc/maxresdefault.jpg" alt="Dua Lipa – Love Again">

      <div class="player-box">
        <div>
          <div>
            <p>Dua Lipa</p>
            <p>Love Again</p>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill"></div>
          <div class="progress-thumb"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const foreground = document.querySelector('.foreground')
    const menuIcon   = document.querySelector('.menu-icon')
    const mainImage  = document.querySelector('.main-image')
    const playerBox  = document.querySelector('.player-box')

    menuIcon.addEventListener('click', () => {
      foreground.classList.add('foreground--collapsed')
      menuIcon.classList.add('menu-icon--hidden')
      mainImage.classList.add('main-image--small')
      playerBox.classList.add('player-box--mini')
    })
  </script>
</body>
</html>
```

---

## Adapting to other UI patterns

| Pattern | What collapses/expands | Trigger |
|---------|------------------------|---------|
| Drawer / sidebar | `translateX` from off-screen | Button click |
| Card flip | `rotateY(180deg)` | Hover or click |
| Notification mini-bar | height + opacity | Dismiss button |
| Search expand | `width` + `opacity` on input | Icon click |
| Sticky now-playing | Same as music player | Scroll position |

For each: define the two states, write one `@keyframes` per element that changes, toggle classes in JS.

---

## What NOT to do

- **Don't** chain `.setTimeout()` to coordinate animations — use `animation-delay` in CSS
- **Don't** use `display: none` during animation — opacity + pointer-events instead  
- **Don't** animate more than 3-4 elements simultaneously — it reads as noise, not polish
- **Don't** exceed 500ms unless the complexity earns it
- **Don't** block further interaction — if the user clicks again mid-animation, handle it