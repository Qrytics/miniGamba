# miniGamba → Google Stitch Master Prompt (Complete Frontend Redesign)

Use the following prompt in Google Stitch. It is intentionally long and explicit so Stitch can redesign the **entire frontend surface area** of miniGamba without missing states or flows.

---

## Prompt for Google Stitch

You are redesigning the full frontend of **miniGamba**, an Electron + React desktop app with two windows:

1. **Dashboard window** (full app management interface)
2. **Overlay window** (compact, always-on-top gameplay assistant)

The redesign must preserve all current product capabilities and UI states while modernizing visual quality, usability, and consistency.

---

### 1) Product Context

miniGamba combines:
- A League of Legends companion (summoner lookup, champion select info, live in-game stats)
- A mini-casino with 10 games
- Player progression systems (coins, XP, level)
- Achievements, stats/history, profile, and settings

Core tone:
- Competitive gaming utility + premium casino feel + practical desktop productivity UX
- Energetic but not childish
- Fast to scan, fast to interact, minimal friction

---

### 2) Redesign Objectives (non-negotiable)

- Redesign **all pages and components** in Dashboard and Overlay
- Cover **all critical states**: loading, empty, disabled, success, error
- Keep layout desktop-first and highly legible at typical Electron sizes
- Improve information hierarchy and make coin/progression context visible and understandable
- Add a polished component system and tokenized design language suitable for engineering handoff

---

### 3) Global Design System Direction

Create a complete, reusable UI system with the following:

#### 3.1 Tokens
Define design tokens for:
- Color roles: bg layers, surface, elevated surface, borders, text primary/secondary, accent, success/warning/danger, coin/gold, LoL ally/enemy, disabled
- Typography: display, section, body, caption, numeric/stat values
- Spacing scale: 4/8-based desktop rhythm
- Radius scale: compact controls + cards
- Shadows/elevation
- Motion durations/easing
- Focus ring and accessibility states

#### 3.2 Components
Design reusable components for:
- App shell (header, sidebar, content area)
- Cards (base, stat, warning, danger, success)
- Buttons (primary, secondary, ghost, danger, icon-only)
- Inputs (text, numeric, select)
- Sliders, toggles, segmented controls, tabs
- Badges/chips, progress bars
- Tables/list rows
- Empty/error/loading placeholders
- Modal/confirmation dialogs
- Inline and toast feedback

#### 3.3 Interaction quality
- Fast, responsive hover/press/focus states
- Strong keyboard focus visibility
- Visual states must not rely on color alone
- Micro-animations should be short and purposeful

---

### 4) Dashboard IA + Screen-by-Screen Redesign Scope

You must redesign every page below.

## 4.1 Dashboard Shell

Include:
- Top header with app brand, coin balance, level indicator
- Left sidebar grouped into:
  - Home
  - League of Legends: Summoner, Live Game
  - Mini-Casino: Games, Achievements, Stats
  - Account: Profile, Settings
- Main content panel
- Prominent "Launch Overlay" CTA

Must include states:
- active nav item
- hover/focus nav states
- loading shell state

---

## 4.2 Home Page

Redesign blocks:
- Welcome section (username + motivational status)
- Top KPI cards: total coins, level, total games
- Hourly bonus module:
  - can-claim state
  - cooldown/progress state
- Daily tasks summary:
  - completed vs pending tasks
  - compact list presentation
- Quick stats section:
  - win rate
  - total wagered
  - biggest win
  - current streak

Add:
- Better emphasis hierarchy for “claim bonus” action
- Clear progress visuals

---

## 4.3 Summoner Lookup Page (LoL)

Redesign the full search and results experience.

Required UI:
- Riot ID input (GameName#TAG)
- Search button + Enter submit affordance
- Context/help text for client requirements

Required states:
- idle
- loading/searching
- success with full data
- error (summoner not found / LoL client not running)

Success layout must include:
- Summoner profile hero (name, level, identity)
- Ranked cards (Solo/Duo, Flex) with LP + W/L + winrate
- Top champion masteries
- Recent match history list/cards with clear win/loss differentiation

---

## 4.4 Live Game Page (LoL)

Must support dynamic status-driven rendering.

Required states:
1. Not connected (LoL client absent)
2. Champion Select mode
3. Live in-game mode

Champion Select redesign:
- Team split view (ally/enemy)
- Assigned roles/positions
- Visible phase + countdown timer

Live in-game redesign:
- Top info strip/cards for game timer + objectives (dragons/barons/turrets)
- Active player stats block (level, gold, HP, mana)
- Two team scoreboards with champion name, K/D/A, KDA ratio, CS

Also include:
- Last refresh indicator
- Manual refresh action

---

## 4.5 Games Directory Page

Required content:
- 10-game catalog cards (icon, title, short description)
- Per-game summary metrics (played, net)
- CTA to launch/play via overlay

Goal:
- Make game selection feel premium and readable
- Improve compare-at-a-glance across games

---

## 4.6 Achievements Page

Required content:
- Header summary: unlocked count / total + points earned
- Category filter controls:
  - all
  - gambling
  - economy
  - activity
  - social
  - customization
  - meta
  - secret
- Achievement card states:
  - locked
  - unlocked
  - in-progress (with progress bar)
- Empty state when filter has no results

Goal:
- Emphasize progression and completion energy
- Improve readability of dense achievement grids

---

## 4.7 Stats Page

Required content:
- KPI cards:
  - total games
  - win rate
  - total wagered
  - net profit
- Best performance section:
  - biggest win
  - longest win streak
  - most profitable game
- Record/loss section:
  - biggest loss
  - longest loss streak
  - total losses
- Recent games list/table with outcome styling
- Empty history state

Goal:
- Make statistics actionable and quickly scannable

---

## 4.8 Profile Page

Required content:
- Editable username flow
- Friend code display
- Member since timestamp
- Level + XP progress visualization
- Economy overview cards
- Customization preview area (theme/avatar/title treatment)

Goal:
- Make identity and progression feel rewarding

---

## 4.9 Settings Page

Redesign grouped sections:
- Overlay settings:
  - opacity slider
  - size preset
  - click-through toggle
- Audio settings (master/effects)
- Gameplay settings (quality-of-life toggles)
- Data management:
  - export
  - import
  - reset progress
  - clear history

Required patterns:
- Destructive confirmations
- Clear helper copy for risky actions

---

### 5) Overlay Redesign Scope

The overlay is used during gameplay and must be compact, low-noise, and readable.

## 5.1 Overlay Shell

Header must include:
- Coin display
- Games tab
- Live Stats tab
- Open Dashboard control
- Minimize and Close controls
- Contextual Back control when inside a selected game

Design requirements:
- Very efficient use of small space
- High legibility for at-a-glance interaction

## 5.2 Overlay Modes

### Mode A: Games
- Game picker grid for all 10 games
- Selected game view container

### Mode B: Live Stats
- Compact in-game panel
- Not-in-game empty state
- Team mini-scoreboards + timer + objective summary + active-player quick info

---

### 6) Redesign all 10 Game Interfaces (Overlay)

For each game below, create full interface coverage for:
- pre-play
- in-play
- result
- error/insufficient funds
- disabled/loading states

Games:
1. Slot Machine
2. Blackjack
3. Coin Flip
4. Higher or Lower
5. Mine Sweeper
6. Scratch Cards
7. Wheel of Fortune
8. Mini Derby
9. Dice Roll
10. Mini Poker

Each game must include:
- Bet controls (+/- + direct input)
- Clear primary action
- Payout/result visibility
- Win/loss visual response
- Lightweight, non-disruptive animation

Add game-specific visual direction:
- Slot Machine: reel focus, line-result emphasis
- Blackjack: player/dealer hand separation + decision controls
- Coin Flip: side selection + dramatic but fast reveal
- Higher/Lower: streak risk meter + cash-out emphasis
- Mines: safe picks vs danger clarity, cash-out prominence
- Scratch: tactile reveal feedback and symbol matching clarity
- Wheel: readable segment wheel + pointer + outcome spotlight
- Derby: odds readability + race progress visualization
- Dice: bet-type clarity + dice result readability
- Poker: 3-card hand strength clarity + dealer comparison

---

### 7) UX, Motion, and Accessibility Requirements

#### 7.1 Motion
Define motion specs for:
- tab transitions
- panel entrance/exit
- hover/press feedback
- stat value updates
- coin/win result events
- game outcome reveals

Constraints:
- motion must be short and responsive
- avoid long blocking animations

#### 7.2 Accessibility
- Strong contrast in dark mode
- Focus-visible keyboard navigation for all controls
- Status communicated with icon/text, not only color
- Sufficient text sizing in compact overlay layouts

---

### 8) Required Stitch Output Format

Provide the redesign output as:

1. **Full high-fidelity screen set** covering all Dashboard pages + Overlay states + all game UIs
2. **Component library** with variants and usage examples
3. **Design tokens** in a developer-friendly structure
4. **State matrix** (loading/empty/error/success/disabled) for each major page and each game
5. **Interaction notes** for critical flows:
   - launch overlay
   - pick and play a game
   - claim hourly bonus
   - run summoner lookup
   - handle LoL disconnected states
6. **Desktop layout specs** (spacing, breakpoints/size behavior)
7. **Engineering handoff notes** mapping components/screens to a React + Electron implementation

---

### 9) Visual Style Targets

- Premium, game-native UI
- Confident typography for data-heavy views
- Strong glanceability in competitive gameplay contexts
- Delight moments on wins/progression without sacrificing utility
- Consistent visual language across dashboard and overlay despite different density constraints

