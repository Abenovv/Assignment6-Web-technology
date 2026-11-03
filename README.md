# Assignment 6 - The Missing Cake

**Yerkebulan Abenov · IT-2511**

A birthday-party investigation made with HTML, CSS and jQuery 3.7.1.

Live site: https://assignment6-web-technology.vercel.app/

## Run locally

```bash
python3 -m http.server 8766
```

Open `http://localhost:8766/` for Task 2 or `http://localhost:8766/task1/` for Task 1. There is no install or build step. jQuery and all avatars are included locally.

## Tasks

- **Task 1:** The original 21 guests, all 20 selector cases, highlighted results, a jump effect, Miras arriving and Natasha leaving.
- **Task 2:** Spotlight, a guest dialog, moving guests between rooms, sorting by arrival time and handling repeated clicks.
- **Report:** `Assignment6_YerkebulanAbenov.pdf` contains the data tables, all 20 chains and screenshots, Task 2 explanations, checks and conclusion.

The cake thief is **Zarina**: she is downstairs, arrived at 21:10, has crumbs but no cup, and stands next to AITU students.

Every case rebuilds the page. In Task 2, moves update the array, so the next case uses the new arrangement. Cases 18 and 19 are temporary changes; the next case rebuilds them from the current party array. Clear restores brightness; Reset party restores the assignment picture.

## Files

| File | Purpose |
| --- | --- |
| `assets/party-data.js` | Rooms and guests transcribed from the picture |
| `assets/cases.js` | One DOM-based jQuery chain per case |
| `assets/app.js` | Card rendering, case buttons, results and reset |
| `assets/style.css` | Shared responsive styles, with no CSS animation or transitions |
| `task1/index.html` | Selector task |
| `task2/index.html`, `task2/motion.js` | Animated task |
| `report/` | Report source, case results and screenshots |
| `scripts/` | Browser checks, screenshot capture and report generation |

## Checks

JavaScript syntax: `node --check` on the four application scripts. Browser checks: 24 checks for Task 1 and 39 for Task 2, including all 20 cases and the assignment's motion checks. `scripts/browser-checks.js` runs inside either page using the browser console or an `agent-browser eval` command. Layout is checked on mobile, tablet and desktop.

## Notes for the demonstration

1. Show Task 1 and run cases 9, 14, 17 and 20. Explain immediate neighbours, room traversal, earliest arrival and the cake conditions.
2. Open Task 2. Run case 3 and Clear.
3. Open Arman, close with Esc, open him again and move him to the balcony. Run case 1.
4. Reset the party. Sort the living room twice, then click Sort five times quickly.
5. Be ready to explain how `data-*`, `filter()`, `closest()`, animation callbacks and `stop()` work.

## Credits

- jQuery 3.7.1, MIT: https://jquery.com/
- Open Peeps avatars by Pablo Stanley, CC0, generated with DiceBear: https://www.dicebear.com/styles/open-peeps/
- The room layout and guest information come from the supplied Assignment 6 document.
