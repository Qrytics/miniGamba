# Stitch Reuse Report

Generated from 11 HTML files in `stitch-export`.

## Most Valuable Reusable Patterns

| Pattern | Signals |
|---|---:|
| Shells (sidebars + headers) | 21 |
| Card and panel treatments | 202 |
| Dense content grids | 59 |
| CTA/button styling | 99 |
| Progress/status affordances | 15 |
| Game-specific iconography/tile motifs | 110 |
## High-Reuse CSS Classes

| Class | Occurrences |
|---|---:|
| `flex` | 524 |
| `items-center` | 415 |
| `font-bold` | 271 |
| `material-symbols-outlined` | 246 |
| `uppercase` | 211 |
| `border` | 196 |
| `font-headline` | 192 |
| `font-black` | 151 |
| `flex-col` | 149 |
| `text-[10px]` | 147 |
| `rounded` | 139 |
| `text-sm` | 118 |
| `text-on-surface` | 113 |
| `rounded-lg` | 109 |
| `relative` | 105 |
| `tracking-widest` | 103 |
| `justify-between` | 102 |
| `w-full` | 101 |
| `text-xs` | 101 |
| `px-6` | 97 |
| `transition-colors` | 96 |
| `text-slate-400` | 91 |
| `overflow-hidden` | 89 |
| `rounded-full` | 86 |
| `justify-center` | 85 |
| `text-slate-500` | 85 |
| `gap-4` | 78 |
| `bg-surface-container-low` | 78 |
| `transition-all` | 77 |
| `gap-3` | 74 |

## Per-Page Structural Summary

| File | Unique Classes | Sections | Forms | Buttons |
|---|---:|---:|---:|---:|
| stitch-export\achievements_dashboard.html | 174 | 0 | 0 | 13 |
| stitch-export\app_settings.html | 189 | 4 | 0 | 21 |
| stitch-export\blackjack_tactital_deck.html | 218 | 0 | 0 | 13 |
| stitch-export\games_directory.html | 198 | 2 | 0 | 5 |
| stitch-export\gilded_fortune_slots.html | 239 | 0 | 0 | 8 |
| stitch-export\home_dashboard.html | 223 | 0 | 0 | 2 |
| stitch-export\overlay_games_picker.html | 150 | 0 | 0 | 5 |
| stitch-export\overlay_live_stats.html | 179 | 1 | 0 | 3 |
| stitch-export\performance_stats.html | 180 | 0 | 0 | 10 |
| stitch-export\summoner_lookup.html | 191 | 1 | 0 | 7 |
| stitch-export\user_profile.html | 248 | 0 | 0 | 12 |

## Reuse Guidance

- Keep the visual hierarchy: bold headline font, gold/cyan accents, glassy dark panels, and compact metric chips.
- Reuse the patterns, not the raw HTML. Convert them into React primitives for cards, hero panels, status pills, and game tiles.
- Prioritize Stitch ideas that map to real product surfaces: dashboard hero, games directory, stats snapshots, settings sections, and slot-machine framing.
- Keep raw exports as reference files; production UI belongs in `src/renderer`.
