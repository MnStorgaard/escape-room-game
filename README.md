# Flugt-eventyr – 5 escape games

Browser escape rooms for kids aged 6-9 (Danish). 5 games × 3 rooms, drawn SVG graphics, generated sound, no external files.

## Play online
https://mnstorgaard.github.io/escape-room-game/

## Run locally
- `node serve.js` and open http://localhost:8080
- Or double-click `index.html`
- Testing shortcuts: `?game=space` opens a game's intro, `?game=space&room=airlock` starts in that room

## Games
| # | Game | Difficulty | Special mechanics |
|---|------|------------|-------------------|
| 1 | 🦖 Dinosaur-museet | Easy | counting, feed the herbivore, flashlight in cave, size ordering |
| 2 | 🔒 Fængslet | Normal | mirror writing, sneak past guard (timing), radio distraction |
| 3 | 🏫 Skolen | Normal | letter-number cipher + word lock, hide from janitor (reaction), piano tones, logic, alarm wires |
| 4 | 🚀 Rumstationen | Normal+ | gravity switch, wire mapping, robot needs 2 parts, lamp code (4-2-1), airlock procedure, radar coordinates |
| 5 | 👻 Spøgelseshuset | Hard | darkness + flashlight, eyes that follow you, ghost scares, clues across rooms, invisible ink, music box memory |

## Files
- `engine.js` – menu, intro, state, inventory (select / combine / use), puzzle widgets (code, pick, cycle, sequence, word), hints, timer, darkness, hover labels
- `art.js` – shared SVG patterns, characters, particles
- `games/<game>/*.js` – one folder per game: `Game.define(...)` + rooms
- `sound.js` – generated sound effects and per-game music
- `index.html`, `style.css` – page layout and look

## Add a new game
1. Create `games/<id>/<id>.js` with `Game.define("<id>", { title, emoji, difficulty, minutes, accent, tagline, story, music })`
2. Add rooms with `G.room({ id, title, intro, background, objects, goal, hints })`
3. Add a `<script>` tag in `index.html` (the order there = order on the menu)
