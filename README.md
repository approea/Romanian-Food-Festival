# Romanian Food Festival Website

## What is included
A complete static multi-page website:
- `index.html` — cinematic video homepage
- `festival.html`
- `food.html`
- `culture.html`
- `program.html`
- `visit.html`
- `tickets.html`
- `styles.css` — complete responsive visual system
- `app.js` — loading animation, menu, reveal animations, video motion, schedule tabs, newsletter interaction
- `assets/` — place the final logo and hero video here

## Add your assets
1. Put your logo at:
   `assets/logo.png`

2. Put your hero video at:
   `assets/hero.mp4`

Nothing else is required visually. The design intentionally uses no photography below the hero video.

## Motion / animation details
- Loading screen: logo rotates while the page loads; it fades away after content is ready.
- Hero: video autoplays, is muted, loops and slightly scales/translates on scroll for a subtle cinematic parallax effect.
- Hero text: main headline rises into view through an overflow mask; metadata and CTA follow with staggered fades.
- Scroll cue: small mouse dot animates downward continuously.
- Section content: all `.reveal` and `.line-reveal` elements fade/slide in once when entering the viewport.
- Navigation: underline animates from left to right on hover/active page.
- CTA buttons: lift by 2px on hover and invert to burgundy/white.
- Mobile menu: full-screen burgundy panel slides down from above.
- Program page: day tabs transition instantly with a short fade-up on the selected schedule.
- Newsletter submit: arrow temporarily turns into a check mark.
- Motion automatically disables for users with `prefers-reduced-motion`.

## Color system
- Paper / cream: `#FBF8F3`
- White paper: `#FFFDF9`
- Burgundy: `#751922`
- Dark burgundy: `#5D1118`
- Deep burgundy: `#451015`
- Ink: `#1D1715`
- Neutral line: `#D8C9BD`

There is intentionally no yellow/gold button or icon system.

## Typography
The design uses a premium editorial serif stack:
`Iowan Old Style, Palatino Linotype, Book Antiqua, Palatino, Times New Roman`
with a clean system sans-serif for navigation, labels and details.

## Important content placeholders
Update:
- Final venue + address
- Host name
- Ticket pricing and ticket links
- Official program
- Food menu
- Contact info
- Social links

## How to open
Open `index.html` directly in a browser, or serve the folder using any static dev server.

## Design intent
The site is deliberately simple:
1. one cinematic hero video,
2. large typography,
3. alternating white and burgundy sections,
4. a single Romanian emblem used sparingly,
5. no unnecessary cards, galleries or decorative clutter.
