# 🎮 miniGamba: The All-In-One League of Legends Companion

> *Real-time LoL stats. Mini-casino. Always running in the background.*

miniGamba is a desktop overlay app and League of Legends companion — think Porofessor meets a mini-casino. It gives you live in-game stats, champion select analysis, summoner profiles, and match history powered by the League Client Update (LCU) API and the Live Client Data API. And when you're dead waiting for the respawn timer? Spin the slots, hit the blackjack table, or scratch a card.

### 🔍 League of Legends Features (Porofessor-style)
- **Summoner Lookup** — Search any summoner by name to see their rank, win rate, champion masteries, and match history (requires LoL client running)
- **Live Game Stats** — Real-time scoreboard during your active match: KDA, CS, gold, HP/mana, and objective counters (Dragon, Baron, Turrets)
- **Champion Select** — See all 10 players' assigned positions as soon as you enter champion select
- **Status indicator** — Know at a glance whether the LoL client is connected, you're in champion select, or you're in a game
- **Overlay Live Tab** — Flip to the 🎮 tab in the overlay for a compact in-game scoreboard without leaving the game

### 🎰 Mini-Casino (Original Features)
- Slot Machine, Blackjack, Coin Flip, Higher or Lower, Mine Sweeper, Scratch Cards, Wheel of Fortune, Mini Derby, Dice Roll, Mini Poker
- Earn coins through hourly bonuses, daily tasks, and in-game events
- Achievements, XP, levels, and investment system

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** - Version **20.x LTS** recommended
   - Download from [nodejs.org](https://nodejs.org/)
   - **Recommended:** Node.js v20.x LTS for best compatibility  
   - **Supported:** Node.js v20.x, v22.x, v23.x, v24.x, v25.x (better-sqlite3 v12 requirement)
   - **Note:** Node.js v18 is NOT supported by better-sqlite3 v12. Please use v20 or higher.
   - To check your version: `node --version`
   
2. **Build Tools** (Required on Windows, recommended on all platforms)
   - **Windows:** Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
     - During installation, select "Desktop development with C++"
     - This is required for compiling native Node.js modules (like better-sqlite3)
   - **macOS:** Install Xcode Command Line Tools: `xcode-select --install`
   - **Linux:** Install build-essential: `sudo apt-get install build-essential` (Ubuntu/Debian)

3. **Git** - [Download](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Qrytics/miniGamba.git
cd miniGamba

# 2. Install dependencies
npm install

# 3. If you get errors about better-sqlite3, rebuild it:
npm rebuild better-sqlite3

# 4. Run the app in development mode
npm run dev
```

**Note:** The project has been updated to use `better-sqlite3@12.0.0` which supports Node.js v20-v25. If you previously had issues with Node.js v24, they should now be resolved. Note that Node.js v18 is NOT supported - please use v20 or higher.

### Building for Production

```bash
# Create a production build
npm run build
```

The built application will be in the `out/` directory.

### Common Issues

#### Issue: `npm install` fails with build errors

**Cause:** Missing build tools or incompatible Node.js version

**Solutions:**
1. **Check Node.js version:** Run `node --version`
   - **Required:** Node.js v20 or higher (v18 is NOT supported)
   - If you have v18, upgrade to v20 LTS from [nodejs.org](https://nodejs.org/)
   - Or use [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`
2. **Windows users:** Make sure you have Visual Studio Build Tools installed (see Prerequisites above)
3. **Clean install:** Delete `node_modules` and `package-lock.json`, then run `npm install` again

#### Issue: "better-sqlite3" compilation errors

**Solution:**
- Ensure you have build tools installed (see Prerequisites)
- Try rebuilding: `npm rebuild better-sqlite3`
- On Windows, run PowerShell or Command Prompt as Administrator
- Make sure Python is installed (Node-gyp requires Python 3.x)

#### Issue: App won't start

**Solution:**
- Check that all dependencies installed successfully: look for errors in `npm install` output
- Try running `npm run type-check` to see if there are any TypeScript errors
- Check the console for error messages
- Try deleting `node_modules` and running `npm install` again

### Development

See [docs/SETUP.md](docs/SETUP.md) for detailed development setup and workflow.

---

## 📐 App Architecture

### Two-Mode Design

miniGamba runs as **two separate experiences** from one app:

1. **Dashboard Window (Main App)**
   - Opens when you click the miniGamba icon on your desktop
   - This is your **home base** — League of Legends stats, summoner lookup, live game view, settings, leaderboard, customization, achievements, coin wallet, and game history
   - Not an overlay — a normal desktop window you interact with before/after sessions
   - **League of Legends section** in the sidebar: Summoner lookup and Live Game pages
   - **Mini-Casino section** in the sidebar: Games, Achievements, Stats
   - From here you can launch the overlay

2. **Overlay Mode (The miniGamba)**
   - Launched from the Dashboard via a big "Launch Overlay" button
   - A small, always-on-top, transparent/minimal overlay that floats over your game
   - **Two tabs:**
     - 🎰 **Games** — play mini-casino games during death timers and loading screens
     - 🎮 **Live Stats** — compact in-game scoreboard showing KDA, CS, gold, and objectives
   - Can be repositioned, resized, and opacity-adjusted
   - Hotkey to toggle visibility (e.g., `Ctrl+Shift+G`)
   - Stays out of the way until you need it

### Data Sources

miniGamba uses two official Riot-approved API endpoints:

| API | Port | When Active | What it provides |
|---|---|---|---|
| **LCU API** (League Client Update) | Dynamic (lockfile) | LoL client running | Summoner profiles, ranked stats, champion mastery, match history, champion select |
| **Live Client Data API** | 2999 | During a match | Real-time KDA, gold, HP/mana, objectives |

Both APIs use self-signed certificates on localhost — no external servers, no API keys required. Your data never leaves your machine.

---

## 🎮 Mini-Games

Not just a slot machine — miniGamba is a full mini-casino suite. All games use fake credits (coins). All are designed to be played in ~5-15 seconds so you can get back to what you're doing.

### 🎰 1. Slot Machine
- Classic 3-reel spinner
- Themed reels (fruits, gems, skulls, game icons)
- Rare jackpot combinations with big payouts
- Unlockable reel themes as you level up
- **Mini Feature:** "Hold & Respin" — hold one reel and respin the other two for double the cost

### 🃏 2. Blackjack (Mini)
- Simplified single-hand blackjack against a dealer
- Bet your coins, hit or stand
- Natural 21 pays 2.5x
- Quick rounds — perfect for death timers or loading screens
- **Mini Feature:** "Double Down" — risk it all on one more card

### 🪙 3. Coin Flip
- Simple heads or tails
- Bet any amount
- 2x payout on correct guess
- **Mini Feature:** "Martingale Mode" — auto-double your bet on loss (optional toggle, for the degens)

### 🎯 4. Higher or Lower
- A card is shown, guess if the next card is higher or lower
- Streak-based payouts — the longer your streak, the bigger the multiplier
- Streak of 3 = 2x, 5 = 5x, 8 = 15x, 10 = 50x
- **Mini Feature:** "Cash Out" — take your winnings at any point in the streak or risk it

### 🧨 5. Mine Sweeper (Crash-style)
- 5x5 grid with hidden mines (you choose difficulty: 3, 5, or 10 mines)
- Click tiles to reveal safe spots; each safe tile increases your multiplier
- Hit a mine = lose your bet
- Cash out anytime
- **Mini Feature:** "Lucky Reveal" — spend extra coins to safely reveal one tile (limited uses)

### 🎰 6. Scratch Cards
- Buy a scratch card for a fixed coin price
- Scratch off panels to reveal prizes
- Different tiers of cards (Bronze, Silver, Gold, Diamond) with increasing costs and potential payouts
- Rare cards can drop cosmetic unlocks
- **Mini Feature:** "Auto-Scratch" — instantly reveal all panels (for the impatient)

### 🎡 7. Wheel of Fortune
- Spin a wheel with various prize segments
- Segments include: coins, multipliers, free spins, cosmetic drops, and a "BANKRUPT" segment
- One daily free spin
- Additional spins cost coins
- **Mini Feature:** "Loaded Wheel" — spend coins to remove the BANKRUPT segment for one spin

### 🏇 8. Mini Derby
- Pick one of 4 cartoon horses/cars/snails to bet on
- Watch a ~5 second race animation
- Odds vary per racer (e.g., 2x, 3x, 5x, 10x)
- **Mini Feature:** "Exacta Bet" — predict 1st AND 2nd place for a massive payout

### 🎲 9. Dice Roll
- Guess the outcome of two dice (over/under a number, exact sum, doubles, etc.)
- Multiple bet types with varying odds
- Quick and simple
- **Mini Feature:** "Loaded Dice" — spend coins to roll 3 dice and keep the best 2

### 🃏 10. Mini Poker (3-Card)
- Dealt 3 cards, choose to fold or play
- Beat the dealer's hand to win
- Simplified poker hand rankings
- **Mini Feature:** "Peek" — pay coins to see one of the dealer's cards before deciding

---

## 💰 Coin Economy — Earning Without Gambling

Coins are the lifeblood of miniGamba. You need them to play, and they should feel **earned**, not just given. Here's how players keep their coin flow going:

### 🕹️ In-Game Earning (Smart Overlay Mode)
When miniGamba detects a supported game:
- **Kill/Assist** → +coins (detected via screen recognition or API if available)
- **Win a Match** → +coin bonus
- **Objective Capture** (dragon, baron, tower, bomb plant, etc.) → +coins
- **Death Timer Survival** — don't gamble during your death timer and get a patience bonus
- **Play Streak** — play X games in a row with miniGamba open → bonus coins

### 📺 Passive Earning (Activity Detection)
miniGamba rewards you for just... doing stuff on your PC:
- **YouTube/Twitch Watch Time** — miniGamba detects active browser tabs with video content; earn passive coins per minute watched (capped per day to prevent AFK farming)
- **Music Listening Bonus** — Spotify/YouTube Music detected? Small trickle of coins
- **Active Window Time** — miniGamba tracks how long you've been active (not idle) on your PC; earn slow passive coins just for being at your desk
- **Typing Speed Mini-Challenge** — random popup: "Type this sentence in X seconds for bonus coins!" (optional, can disable)

### 📋 Daily Tasks / Missions
A set of rotating daily objectives to keep engagement:
- "Win 3 coin flips in a row"
- "Play 5 different mini-games today"
- "Hit a 5x multiplier in Higher or Lower"
- "Scratch 3 scratch cards"
- "Spin the Wheel of Fortune"
- "Watch 30 minutes of video content"
- "Win a blackjack hand with exactly 21"
- "Survive 3 death timers without gambling"
- Completing all dailies grants a **Daily Chest** with bonus coins + chance at cosmetics

### 🔁 Hourly Bonus
- Every hour, a small free coin bonus is available to claim
- If you miss it, it stacks up to 3 hours max
- Clicking the claim button can also trigger a random mini-event (bonus spin, surprise scratch card, etc.)

### 💸 Coin Milestones
- Reach lifetime earning milestones for one-time big bonuses
- 1,000 coins earned → +200 bonus
- 10,000 coins earned → +1,500 bonus
- 100,000 coins earned → +10,000 bonus + exclusive cosmetic
- 1,000,000 coins earned → +100,000 bonus + title: "miniMogul"

### 🏦 Coin Investments (Idle Mechanic)
- "Invest" coins into a fake stock/vault that grows over real time
- Choose risk level: Safe (1% return/day), Moderate (3%/day but 10% chance to lose 5%), Risky (8%/day but 25% chance to lose 20%)
- Check back later to collect returns — or lose some
- Adds an idle-game loop that keeps players opening the app

---

## 🏆 Leaderboard — Compete With Your Friends

Simple, lightweight, no-server-required leaderboard for your close friend group.

### Implementation: Shared File / Code System
- **No accounts, no servers** — leaderboards work via **shareable friend codes**
- Each miniGamba install generates a unique **Friend Code** (e.g., `GAMBA-7X2K-QM9P`)
- Add friends by entering their code in the Dashboard → Friends tab
- Stats sync via **lightweight P2P or a shared JSON file** (e.g., hosted on a free paste service, GitHub Gist, or a tiny Firebase free-tier instance)
- Alternative: **Local Network mode** — auto-discover friends on the same Wi-Fi/LAN for zero-setup leaderboards (perfect for Discord call groups or LAN parties)

### Leaderboard Categories
- 💰 **Total Coins Earned** (all-time)
- 🔥 **Current Coin Balance** (richest right now)
- 🎰 **Biggest Single Win** (highest payout from one game)
- 📉 **Biggest Loss Streak** (most coins lost in a row — the "degen" leaderboard)
- 🏅 **Achievement Score** (total achievement points)
- 🎮 **Games Played** (most games played overall)
- 🃏 **Game-Specific Boards** (e.g., "Best Blackjack Player," "Luckiest Slot Spinner")
- 📅 **Daily/Weekly/All-Time** toggle for each category

### Leaderboard Social Features
- See friends' recent activity: "Alex just hit a 10x streak in Higher or Lower!"
- React to friends' wins/losses with emojis (😂🔥💀)
- **Challenge a Friend** — send a dare: "Beat my 7-streak in Higher or Lower" — friend gets notified and can attempt it
- **Shame Board** — optional toggle that shows who went bankrupt the most times

---

## 🎨 Customization & Cosmetics

Because what's the point of grinding coins if you can't flex?

### Overlay Themes
- Change the entire look of the overlay: Neon, Retro, Casino Royale, Pixel Art, Dark Mode, Vaporwave, Cyberpunk, Cozy, etc.
- Unlocked via achievements, coin purchases, or rare scratch card drops

### Slot Machine Skins
- Custom reel icons: Fruits → Gems → Skulls → Anime → Space → Custom (import your own images)
- Custom spin sounds: Classic, Arcade, Bass Drop, Silent, Custom (import .mp3/.wav)

### Card Backs & Dice
- Custom card backs for Blackjack/Poker/Higher-Lower
- Custom dice skins for Dice Roll

### Dashboard Wallpapers
- Change the Dashboard window background
- Animated wallpapers for premium unlocks

### Profile Customization
- Custom avatar/icon (shown on leaderboard)
- Profile border (Bronze/Silver/Gold/Diamond/Legendary — based on achievement score)
- Title displayed under name: "High Roller," "Penny Pincher," "Degen King," "Lucky Charm," etc.

### Win Animations
- Customize what happens when you hit a jackpot: confetti, fireworks, screen shake, bass drop, meme sound
- Rare win animations unlocked through specific achievements

---

## 🏅 Achievements

Achievements give players long-term goals and bragging rights. Each achievement awards **Achievement Points (AP)** that contribute to your leaderboard score and profile border tier.

### 🎰 Gambling Achievements
| Achievement | Description | AP |
|---|---|---|
| **First Spin** | Play the slot machine for the first time | 5 |
| **Baby's First Jackpot** | Hit a jackpot on the slot machine | 15 |
| **Jackpot Hunter** | Hit 10 jackpots total | 50 |
| **Jackpot Addict** | Hit 100 jackpots total | 200 |
| **21!** | Win a blackjack hand with exactly 21 | 10 |
| **Card Counter** | Win 10 blackjack hands in a row | 75 |
| **Card Shark** | Win 100 blackjack hands total | 100 |
| **Coin Flip Savant** | Win 5 coin flips in a row | 25 |
| **Two-Face** | Win 20 coin flips in a row | 150 |
| **Streak Demon** | Hit a 10-streak in Higher or Lower | 100 |
| **The Oracle** | Hit a 15-streak in Higher or Lower | 300 |
| **Bomb Technician** | Clear a full Minesweeper board with 10 mines | 150 |
| **Nerves of Steel** | Cash out at 20x+ in Minesweeper | 100 |
| **Scratch That Itch** | Scratch 50 scratch cards | 30 |
| **Golden Ticket** | Win the top prize from a Diamond scratch card | 200 |
| **Wheel Warrior** | Spin the Wheel of Fortune 100 times | 50 |
| **Full House** | Win at Mini Poker 25 times | 50 |
| **Dark Horse** | Win a Mini Derby bet on the 10x odds racer | 75 |
| **Snake Eyes** | Roll double 1s in Dice Roll | 20 |
| **Boxcars** | Roll double 6s in Dice Roll | 20 |
| **Perfectionist** | Win at least once in every mini-game | 50 |
| **The Gambler** | Play 1,000 total games across all mini-games | 100 |
| **No Life** | Play 10,000 total games across all mini-games | 500 |

### 💰 Economy Achievements
| Achievement | Description | AP |
|---|---|---|
| **Pocket Change** | Earn your first 100 coins | 5 |
| **Stacking Up** | Earn 1,000 coins total | 10 |
| **Fat Stacks** | Earn 10,000 coins total | 25 |
| **Trust Fund Baby** | Earn 100,000 coins total | 75 |
| **miniMogul** | Earn 1,000,000 coins total | 300 |
| **Investor** | Make your first coin investment | 10 |
| **Wolf of miniGamba** | Earn 10,000 coins from investments alone | 100 |
| **Diamond Hands** | Leave an investment untouched for 7 days | 50 |
| **Paper Hands** | Pull out an investment within 1 minute | 10 |
| **Bankrupt** | Reach 0 coins | 5 |
| **Rock Bottom** | Go bankrupt 10 times | 25 |
| **The Comeback** | Go from 0 coins to 10,000 coins in one session | 100 |
| **Hoarder** | Have 50,000 coins in your balance at one time | 75 |
| **Scrooge** | Have 100,000 coins without spending any for 3 days | 100 |

### 📺 Activity & Passive Achievements
| Achievement | Description | AP |
|---|---|---|
| **Couch Potato** | Earn 1,000 coins from passive video watching | 15 |
| **Binge Watcher** | Watch 10 hours of video content with miniGamba open | 30 |
| **Marathon Viewer** | Watch 100 hours of video content with miniGamba open | 100 |
| **Desk Jockey** | Earn coins from 50 hours of active PC time | 25 |
| **Speed Demon** | Complete a typing challenge in under 3 seconds | 50 |
| **Daily Grinder** | Complete all daily tasks in one day | 20 |
| **Weekly Warrior** | Complete all daily tasks 7 days in a row | 75 |
| **Monthly Maniac** | Complete all daily tasks 30 days in a row | 200 |
| **Claim King** | Claim the hourly bonus 100 times | 25 |
| **Early Bird** | Claim the hourly bonus before 7 AM | 10 |
| **Night Owl** | Claim the hourly bonus after 2 AM | 10 |
| **Patient Gamer** | Survive 10 death timers without gambling | 30 |
| **Zen Master** | Survive 100 death timers without gambling | 100 |

### 🏆 Social & Leaderboard Achievements
| Achievement | Description | AP |
|---|---|---|
| **Friendly** | Add your first friend | 5 |
| **Squad Up** | Have 5 friends added | 15 |
| **#1** | Reach the top of any leaderboard category | 50 |
| **Untouchable** | Hold #1 on any leaderboard for 7 consecutive days | 150 |
| **Challenger** | Send 10 challenges to friends | 20 |
| **Rival** | Beat a friend's challenge | 25 |
| **Nemesis** | Beat the same friend's challenge 10 times | 75 |
| **Shamed** | Appear on the Shame Board for going bankrupt | 10 |
| **Shameless** | Appear on the Shame Board 10 times | 50 |

### 🎨 Customization & Meta Achievements
| Achievement | Description | AP |
|---|---|---|
| **Fashion Show** | Unlock 5 different overlay themes | 20 |
| **Drip Lord** | Unlock 20 cosmetic items total | 50 |
| **Interior Designer** | Change your dashboard wallpaper | 5 |
| **Identity Crisis** | Change your profile title 10 times | 10 |
| **Collector** | Own at least one item from every cosmetic category | 100 |
| **Completionist** | Unlock every achievement (except secret ones) | 500 |

### 🔒 Secret / Hidden Achievements
| Achievement | Description | AP |
|---|---|---|
| **???** | Spin the slot machine at exactly midnight | 25 |
| **???** | Lose 10 games in a row then win a jackpot | 50 |
| **???** | Click the miniGamba logo 50 times in the dashboard | 15 |
| **???** | Play miniGamba for 24 hours total | 50 |
| **???** | Have exactly 1 coin in your balance | 25 |
| **???** | Win a coin flip, blackjack, higher-lower, poker, derby, and dice all in a row without losing | 300 |
| **???** | Go bankrupt and immediately hit a jackpot from the free daily spin | 100 |

---

## ⚙️ Settings & Configuration (Dashboard)

### General
- Launch on startup (toggle)
- Start in overlay mode automatically (toggle)
- Hotkey bindings (toggle overlay, quick-spin, etc.)
- Notification preferences (friend activity, daily reset, hourly bonus reminder)
- Sound master volume + per-game volume

### Overlay Settings
- Opacity slider (10% — 100%)
- Size slider (small, medium, large, custom)
- Position lock / free-drag
- Auto-hide when not in supported game (toggle)
- Overlay display mode: minimal (just the game) vs. expanded (game + coin balance + streak info)
- Click-through mode (overlay is visible but doesn't capture mouse input unless hotkey is held)

### Game Detection
- Supported game list with auto-detect toggles
- Custom game profiles (manually add any .exe as a "supported game")
- Configure per-game coin rewards

### Privacy & Data
- All data stored locally by default
- Export/import save data (JSON)
- Reset progress (with confirmation + "are you REALLY sure?" prompt)
- Data sharing preferences for leaderboard (choose what stats are visible to friends)

---

## 📊 Stats & History (Dashboard)

### Personal Stats Page
- Total games played (per game + overall)
- Win/loss ratio (per game + overall)
- Total coins earned / spent / net profit
- Biggest win and biggest loss
- Current streak and best streak
- Favorite game (most played)
- Time spent in miniGamba
- Graphs and charts: coin balance over time, win rate trends, games played per day

### Game History Log
- Scrollable log of every game played
- Filter by game type, date, result (win/loss), bet size
- "Replay" feature for some games (watch the slot spin or card flip again)

---

## 🛣️ Progression System

### Player Level
- Earn XP from playing games, completing daily tasks, earning achievements
- Level up to unlock new mini-games, cosmetics, and features
- Level 1: Slot Machine + Coin Flip unlocked
- Level 3: Blackjack unlocked
- Level 5: Higher or Lower unlocked
- Level 8: Scratch Cards unlocked
- Level 10: Wheel of Fortune unlocked + Investments feature
- Level 13: Minesweeper unlocked
- Level 15: Dice Roll unlocked
- Level 18: Mini Derby unlocked
- Level 20: Mini Poker unlocked
- Level 25: Custom game imports + Advanced cosmetics
- Level 30: "Prestige" option available
- Max Level: 50 — title: "The House"

### Prestige System
- At Level 30+, choose to "Prestige" — resets your level to 1 but keeps cosmetics and achievements
- Grants a Prestige Star on your profile (visible on leaderboard)
- Each Prestige increases passive coin earn rate by 5%
- Prestige-exclusive cosmetics unlock at each Prestige tier
- Max Prestige: 10 — title: "The Legend"

---

## 🔮 Future Ideas / Stretch Goals

- **Seasonal Events** — Halloween, Christmas, etc. with themed cosmetics and limited-time games
- **Tournament Mode** — friends compete in a set number of rounds; highest coins at the end wins
- **Loot Boxes** (earned, not purchased — no real money ever) — random cosmetic drops
- **Custom Mini-Games** — let players create simple "guess the number" or "pick a door" games to challenge friends
- **Discord Rich Presence** — show your miniGamba stats/activity in your Discord status
- **Stream Overlay Mode** — OBS-compatible overlay so viewers can see your miniGamba alongside gameplay
- **Mobile Companion App** — check leaderboard, collect hourly bonus, manage investments from your phone
- **Sound Board Integration** — play custom sounds on wins/losses audible in voice chat
- **Betting on Real Game Outcomes** — "I bet 500 coins I win this League game" — verified by match result
- **Friend Gifting** — send coins to friends (with daily cap to prevent abuse)
- **Coin Stealing Mini-Game** — challenge a friend to a heads-up game; winner takes coins from loser
- **Daily Lottery** — everyone in your friend group auto-enters; one random winner per day

---

## 🚫 Philosophy

- **No real money. Ever.** miniGamba uses only fake credits. This is a fun companion app, not actual gambling.
- **No ads.** This is a passion project.
- **No data harvesting.** Everything stays local unless you opt into leaderboards.
- **Lightweight.** Should never noticeably impact game performance.
- **Fun first.** Every feature exists to make downtime more enjoyable.

---

*miniGamba — because even your death timer should be exciting.*