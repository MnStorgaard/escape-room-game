# Detektiven i fængslet

A browser escape room for kids aged 6-9 (Danish). 3 rooms, 12 puzzles, drawn SVG graphics, no external files.

## Run
- `node serve.js` and open http://localhost:8080
- Or just double-click `index.html`
- Testing shortcut: `http://localhost:8080/?room=corridor` or `?room=yard` starts in that room

## Rooms
1. **Cellen** – pattern lock, count clues for a 3-digit code, mirror writing, magnet + string to fish the key from the drain
2. **Gangen** – sneak past the guard (timing), animal-order logic, radio + batteries to distract the desk guard, math code for the door
3. **Gården** – shadow-matching lock, dig up a bone for the dog, bucket + rope in the well, pick the right gear for the gate

## Files
- `engine.js` – game state, rooms, inventory (select / combine / use), popups, hints, timer
- `art.js` – shared SVG patterns and characters (guard, dog, Mester Mus)
- `rooms/*.js` – one file per room: drawing, objects, puzzles, hints
- `sound.js` – generated sound effects and music
- `index.html`, `style.css` – page layout and look
