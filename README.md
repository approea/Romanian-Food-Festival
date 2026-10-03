# Romanian Food Festival DFW — website

Static multi-page site (no build step) in English, with a Romanian version in `ro/`.

## Pages
| English | Romanian |
| --- | --- |
| `index.html` — cinematic video homepage | `ro/index.html` |
| `festival.html` | `ro/festival.html` |
| `food.html` | `ro/food.html` |
| `culture.html` — includes the Alunelul and Tricolorii Veseli video sections | `ro/culture.html` |
| `program.html` — full 2026 schedule | `ro/program.html` |
| `visit.html` — location, live map, parking & shuttle, hours | `ro/visit.html` |
| `tickets.html` | `ro/tickets.html` |
| `volunteers.html`, `sponsors.html`, `vendors.html`, `contact.html`, `ordering.html` | English only (the Romanian menus link to them) |

Shared files: `styles.css` (complete visual system) and `app.js` (loader, menu, reveal animations, videos, schedule tabs, forms).

## Brand assets (`assets/`)
- `logo.png` / `logo.webp` — the gate logo, transparent background, 720 px wide (homepage intro).
- `logo-sm.png` — same logo, 320 px wide (header, loader, footer).
- `favicon.svg`, `favicon-32.png`, `icon-192.png` — the rosette mark (the carved rosette from the centre of the gate) on burgundy.
- `apple-touch-icon.png` — full logo on paper, 180 × 180.
- `hero.mp4`, `hero-mobile.mp4`, `hero-poster.jpg` — homepage hero video.
- `video/` — culture-page background videos:
  - `alunelul.mp4`, `alunelul-mobile.mp4`, `alunelul-poster.jpg`
  - `tricolorii.mp4`, `tricolorii-mobile.mp4`, `tricolorii-poster.jpg`

The logo is an illustration with dark brown lettering, so it always sits on paper:
over the homepage hero it hangs from the top edge as a badge, and once the header
turns solid (or on inner pages) it settles into the bar. In the footer it sits on a
paper tile.

## Color system
- Paper / cream: `#FBF8F3`
- White paper: `#FFFDF9`
- Burgundy: `#751922`
- Dark burgundy: `#5D1118`
- Deep burgundy: `#451015`
- Ink: `#1D1715`
- Neutral line: `#D8C9BD`

The logo brings its own wood browns and amber; the site keeps them inside the logo
and uses burgundy for everything interactive. There is no yellow/gold button or icon system.

## Typography
Editorial serif stack `Iowan Old Style, Palatino Linotype, Book Antiqua, Palatino, Times New Roman`
for headings, with a clean system sans-serif for navigation, labels and body copy.

## Motion
- Loader: the logo fades in with a thin burgundy progress line underneath, then the page fades up.
- Hero: muted looping video with a slight scroll parallax.
- Section content fades/slides in once when it enters the viewport.
- Culture-page videos load only when their section scrolls into view, play muted and
  pause off-screen. Each has a pause/play button. They never autoplay when the visitor
  has reduced motion or data saver turned on (the poster frame shows instead).
- All motion is disabled for `prefers-reduced-motion`.

## Background videos (culture page)
Both clips come from 60 fps stage footage. They are slowed to half speed (smooth slow
motion at 30 fps), have no audio, and loop seamlessly: the last second dissolves into the
first. Desktop files are 1920 × 1080; the mobile files are a 4:5 centre crop at 720 × 900.

- Alunelul: first 3.1 s of the original (an audience phone enters the frame after that), 5.4 s loop.
- Tricolorii Veseli: 0.5–10.5 s of the original, 19 s loop.

The original files are kept in `_source-videos/`, which `.gitignore` keeps out of the repository.

To replace a clip (example for a 60 fps source, using seconds 0–10 and a 1 s dissolve):
```
ffmpeg -t 10 -i source.mp4 -an -filter_complex "[0:v]setpts=2.0*PTS,fps=30000/1001,scale=1920:1080,format=yuv420p,split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[A];[b]trim=end=1,setpts=PTS-STARTPTS[B];[A][B]xfade=transition=fade:duration=1:offset=18,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset slow -crf 26 -movflags +faststart assets/video/NAME.mp4
```
(`offset` = slowed length − 2 × dissolve.) For the mobile file add `crop=864:1080:528:0,scale=720:900`
instead of the 1920 scale; for the poster use `ffmpeg -ss 2 -i assets/video/NAME.mp4 -frames:v 1 -q:v 4 assets/video/NAME-poster.jpg`.

## Tickets
The **Buy tickets** buttons (`tickets.html`, `ro/tickets.html`) open the 2026 Eventbrite event in a new tab:
https://www.eventbrite.com/e/romanian-food-festival-dfw-2026-the-20th-anniversary-edition-tickets-1998394329234
For next year's event, replace that URL in both files (Eventbrite → Manage events → the event → copy its link).

## Still to connect
- Volunteer / vendor / contact forms and the footer email sign-up show a thank-you
  message but don't send anywhere yet — they need a form service or inbox.

## How to open
Open `index.html` directly in a browser, or serve the folder with any static server
(for example `python3 -m http.server`).
