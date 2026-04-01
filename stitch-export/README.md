# Google Stitch HTML Drop Folder

Paste all HTML/CSS/JS export files from Google Stitch into this folder.

## Recommended structure
- `pages/dashboard/` — Dashboard window pages
- `pages/overlay/` — Overlay shell + live stats tab pages
- `pages/games/` — Individual game page mockups
- `assets/` — Shared exported images/fonts/icons/css/js bundles

## Naming convention (recommended)
### Dashboard
- `home.html`
- `summoner.html`
- `live-game.html`
- `games-directory.html`
- `achievements.html`
- `stats.html`
- `profile.html`
- `settings.html`

### Overlay
- `overlay-shell.html`
- `overlay-games-tab.html`
- `overlay-live-stats-tab.html`

### Games
- `slot-machine.html`
- `blackjack.html`
- `coin-flip.html`
- `higher-or-lower.html`
- `mine-sweeper.html`
- `scratch-cards.html`
- `wheel-of-fortune.html`
- `mini-derby.html`
- `dice-roll.html`
- `mini-poker.html`

## Notes
- This folder is intentionally separate from `src/` so raw Stitch exports can be reviewed before implementation.
- Keep source exports unmodified when possible; create edited copies if needed.
