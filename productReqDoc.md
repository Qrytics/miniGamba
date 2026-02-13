# 🎰 miniGamba - Product Requirements Document

**Version:** 1.0  
**Last Updated:** 2026-02-13  
**Purpose:** Comprehensive breakdown of all features and implementation tasks for the miniGamba desktop overlay application

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Core Features Breakdown](#core-features-breakdown)
4. [Implementation Roadmap](#implementation-roadmap)
5. [File Architecture](#file-architecture)

---

## 1. Project Overview

### 1.1 Product Description
miniGamba is a desktop overlay application that provides mini-casino games during gaming downtime. It features two modes: a Dashboard window for management and an Overlay mode for gameplay.

### 1.2 Core Philosophy
- No real money gambling (fake credits only)
- No ads or data harvesting
- Lightweight and performance-friendly
- Fun-first design for downtime entertainment

### 1.3 Target Platforms
- Primary: Windows (Electron-based)
- Future: macOS, Linux support

---

## 2. Technical Architecture

### 2.1 Application Modes

#### Task 2.1.1: Dashboard Window Implementation
**Priority:** HIGH  
**Description:** Create main application window for management
**Requirements:**
- Normal desktop window (not overlay)
- Resizable with minimum dimensions (800x600px)
- Persistent window position/size preferences
- Navigation system between sections
**Acceptance Criteria:**
- Window opens on application launch
- Position/size saved between sessions
- Clean navigation between tabs

#### Task 2.1.2: Overlay Mode Implementation
**Priority:** HIGH  
**Description:** Create always-on-top overlay window
**Requirements:**
- Transparent background support
- Always-on-top window flag
- Draggable and repositionable
- Adjustable opacity (10-100%)
- Adjustable size (small/medium/large/custom)
- Click-through mode support
**Acceptance Criteria:**
- Overlay stays above all windows
- User can drag to reposition
- Opacity slider functional
- Click-through mode toggles correctly

#### Task 2.1.3: Hotkey System
**Priority:** MEDIUM  
**Description:** Global hotkey registration for overlay control
**Requirements:**
- Register system-wide hotkeys
- Default: Ctrl+Shift+G to toggle overlay visibility
- Customizable hotkey bindings
- No conflicts with common game hotkeys
**Acceptance Criteria:**
- Hotkey works from any application
- Customization UI functional
- Prevents duplicate bindings

---

### 2.2 Data Storage

#### Task 2.2.1: Local Data Persistence
**Priority:** HIGH  
**Description:** Implement local database/storage system
**Requirements:**
- SQLite or JSON-based storage
- Store user progress, coins, stats, achievements
- Atomic writes to prevent corruption
- Backup mechanism
**Acceptance Criteria:**
- Data persists between sessions
- No data loss on crash
- Backup/restore functionality

#### Task 2.2.2: Save Data Export/Import
**Priority:** MEDIUM  
**Description:** Allow users to export/import their data
**Requirements:**
- Export to JSON format
- Import with validation
- Merge or replace options
**Acceptance Criteria:**
- Export creates valid JSON
- Import validates before applying
- User confirmation required

---

## 3. Core Features Breakdown

### 3.1 Mini-Games System

#### Task 3.1.1: Game Engine Foundation
**Priority:** HIGH  
**Description:** Create base game engine for all mini-games
**Requirements:**
- Abstract Game class with common methods
- Betting system (place bet, calculate payout)
- Win/loss state management
- Animation system
- Sound effect system
**Acceptance Criteria:**
- All games extend base class
- Consistent betting interface
- Smooth animations

---

### 3.2 Mini-Game #1: Slot Machine

#### Task 3.2.1: Slot Machine - Basic Implementation
**Priority:** HIGH  
**Description:** 3-reel slot machine with spinning animation
**Requirements:**
- 3 reels with configurable symbols
- Spin animation (800ms duration recommended)
- Win line detection
- Payout calculation
**Subtasks:**
- Create reel component
- Implement spin mechanics
- Add symbol matching logic
- Calculate payouts based on combinations
**Acceptance Criteria:**
- Smooth spinning animation
- Correct payout calculations
- Visual feedback on win

#### Task 3.2.2: Slot Machine - Symbol Sets
**Priority:** MEDIUM  
**Description:** Multiple themed symbol sets
**Requirements:**
- Default: Fruits (cherry, lemon, orange, grape, watermelon, seven, bar)
- Gems theme (ruby, emerald, sapphire, diamond)
- Skulls theme (skull variants)
- Game icons theme (custom)
**Subtasks:**
- Create symbol asset system
- Theme switcher UI
- Unlock system integration
**Acceptance Criteria:**
- Multiple themes selectable
- Symbols render correctly
- Theme persists between sessions

#### Task 3.2.3: Slot Machine - Hold & Respin Feature
**Priority:** LOW  
**Description:** Allow holding one reel and repin others
**Requirements:**
- UI button for each reel to hold
- Double cost for respin
- Visual indicator for held reels
**Acceptance Criteria:**
- Hold button locks reel
- Respin costs 2x original bet
- Only non-held reels spin

#### Task 3.2.4: Slot Machine - Jackpot System
**Priority:** MEDIUM  
**Description:** Rare jackpot combinations with big payouts
**Requirements:**
- Define jackpot combinations (3 sevens, 3 diamonds, etc.)
- Jackpot payout multiplier (50x-100x bet)
- Special jackpot animation and sound
**Acceptance Criteria:**
- Jackpot detected correctly
- Big win animation plays
- Achievement triggers

---

### 3.3 Mini-Game #2: Blackjack

#### Task 3.3.1: Blackjack - Basic Implementation
**Priority:** HIGH  
**Description:** Simplified single-hand blackjack
**Requirements:**
- Standard 52-card deck
- Deal initial hands (2 cards each)
- Hit/Stand options
- Dealer AI (hit on 16 or less, stand on 17+)
- Win/loss/push detection
- Natural 21 pays 2.5x
**Subtasks:**
- Create Card and Deck classes
- Implement dealing logic
- Add player action buttons (Hit/Stand)
- Implement dealer AI
- Calculate hand values (Ace as 1 or 11)
**Acceptance Criteria:**
- Cards deal correctly
- Hand values calculated properly
- Dealer follows rules
- Payouts correct

#### Task 3.3.2: Blackjack - Double Down Feature
**Priority:** MEDIUM  
**Description:** Allow doubling bet for one more card
**Requirements:**
- Double Down button (available on initial hand)
- Doubles bet, deals one card, ends turn
**Acceptance Criteria:**
- Button available initially
- Bet doubles correctly
- Only one card dealt

#### Task 3.3.3: Blackjack - Card Animation
**Priority:** LOW  
**Description:** Smooth card dealing animation
**Requirements:**
- Cards slide from deck to positions
- Flip animation for face-down cards
- 200-300ms per card
**Acceptance Criteria:**
- Smooth animations
- Performance remains good

---

### 3.4 Mini-Game #3: Coin Flip

#### Task 3.4.1: Coin Flip - Basic Implementation
**Priority:** HIGH  
**Description:** Simple heads or tails game
**Requirements:**
- Heads/Tails buttons
- Flip animation (3D rotation recommended)
- 50/50 probability
- 2x payout on correct guess
**Subtasks:**
- Create coin component with animation
- Implement flip logic
- Add result display
**Acceptance Criteria:**
- Fair 50/50 odds
- Smooth flip animation
- Correct payout

#### Task 3.4.2: Coin Flip - Martingale Mode
**Priority:** LOW  
**Description:** Auto-double bet on loss
**Requirements:**
- Toggle for Martingale mode
- Auto-double bet after loss
- Reset bet after win
- Safety cap (max bet limit)
**Acceptance Criteria:**
- Toggle works correctly
- Bet doubles on loss
- Respects max bet limit

---

### 3.5 Mini-Game #4: Higher or Lower

#### Task 3.5.1: Higher or Lower - Basic Implementation
**Priority:** HIGH  
**Description:** Card prediction streak game
**Requirements:**
- Show one card, guess if next is higher or lower
- Aces low or high (configurable)
- Streak counter
- Progressive multiplier system
**Subtasks:**
- Display current card
- Higher/Lower buttons
- Streak tracking
- Multiplier calculation
**Acceptance Criteria:**
- Cards compare correctly
- Streak counts properly
- Multipliers increase

#### Task 3.5.2: Higher or Lower - Streak Multipliers
**Priority:** MEDIUM  
**Description:** Implement streak-based payouts
**Requirements:**
- Streak 3 = 2x
- Streak 5 = 5x
- Streak 8 = 15x
- Streak 10 = 50x
**Acceptance Criteria:**
- Multipliers apply at correct streaks
- Payout calculated correctly

#### Task 3.5.3: Higher or Lower - Cash Out Feature
**Priority:** MEDIUM  
**Description:** Allow cashing out mid-streak
**Requirements:**
- Cash Out button (always available during streak)
- Takes current winnings and ends game
**Acceptance Criteria:**
- Button available during streak
- Winnings calculated correctly
- Game ends properly

---

### 3.6 Mini-Game #5: Mine Sweeper

#### Task 3.6.1: Mine Sweeper - Basic Implementation
**Priority:** MEDIUM  
**Description:** 5x5 grid with hidden mines
**Requirements:**
- 5x5 grid of tiles
- Difficulty selector (3, 5, or 10 mines)
- Click to reveal safe tiles
- Multiplier increases with each safe tile
- Hit mine = lose bet
**Subtasks:**
- Create grid component
- Mine placement logic
- Tile reveal mechanics
- Multiplier calculation
**Acceptance Criteria:**
- Grid renders correctly
- Mines placed randomly
- Multiplier increases per reveal

#### Task 3.6.2: Mine Sweeper - Cash Out System
**Priority:** MEDIUM  
**Description:** Cash out anytime with current multiplier
**Requirements:**
- Cash Out button
- Display current multiplier
- End game and award winnings
**Acceptance Criteria:**
- Button always available
- Correct payout

#### Task 3.6.3: Mine Sweeper - Lucky Reveal Feature
**Priority:** LOW  
**Description:** Safely reveal one tile for coins
**Requirements:**
- Limited uses (3 per game)
- Costs extra coins
- Reveals safe tile
**Acceptance Criteria:**
- Reveals safe tile only
- Uses tracked correctly

---

### 3.7 Mini-Game #6: Scratch Cards

#### Task 3.7.1: Scratch Cards - Basic Implementation
**Priority:** MEDIUM  
**Description:** Digital scratch cards with prizes
**Requirements:**
- Scratch-off mechanic (mouse drag reveals)
- 9-panel grid
- Match 3 symbols to win
- Multiple tiers (Bronze, Silver, Gold, Diamond)
**Subtasks:**
- Create scratch overlay effect
- Implement scratch detection
- Prize generation logic
- Tier system
**Acceptance Criteria:**
- Scratching reveals symbols
- Win detection works
- Tiers have different costs/prizes

#### Task 3.7.2: Scratch Cards - Auto-Scratch
**Priority:** LOW  
**Description:** Instantly reveal all panels
**Requirements:**
- Auto-Scratch button
- Instantly reveals all
**Acceptance Criteria:**
- Button reveals instantly
- Animation plays

---

### 3.8 Mini-Game #7: Wheel of Fortune

#### Task 3.8.1: Wheel of Fortune - Basic Implementation
**Priority:** MEDIUM  
**Description:** Spinning wheel with prize segments
**Requirements:**
- Circular wheel with segments
- Spin animation (3-5 seconds)
- Prize types: coins, multipliers, free spins, cosmetics, BANKRUPT
- Pointer/indicator
**Subtasks:**
- Create wheel component
- Spin physics/animation
- Prize determination
- Result display
**Acceptance Criteria:**
- Wheel spins smoothly
- Fair prize distribution
- Results displayed correctly

#### Task 3.8.2: Wheel of Fortune - Daily Free Spin
**Priority:** MEDIUM  
**Description:** One free spin per day
**Requirements:**
- Track last spin timestamp
- Reset at midnight
- Free spin indicator
**Acceptance Criteria:**
- Free spin available daily
- Resets at midnight
- Timestamp persists

#### Task 3.8.3: Wheel of Fortune - Loaded Wheel Feature
**Priority:** LOW  
**Description:** Remove BANKRUPT for one spin
**Requirements:**
- Loaded Wheel button
- Costs coins
- BANKRUPT segment disabled
**Acceptance Criteria:**
- BANKRUPT removed for one spin
- Costs deducted

---

### 3.9 Mini-Game #8: Mini Derby

#### Task 3.9.1: Mini Derby - Basic Implementation
**Priority:** MEDIUM  
**Description:** Race betting game
**Requirements:**
- 4 racers (horses/cars/snails)
- 5-second race animation
- Different odds per racer (2x, 3x, 5x, 10x)
- Random winner (weighted by odds)
**Subtasks:**
- Create race animation
- Racer selection UI
- Odds calculation
- Winner determination
**Acceptance Criteria:**
- Race animation smooth
- Odds respected
- Payouts correct

#### Task 3.9.2: Mini Derby - Exacta Bet Feature
**Priority:** LOW  
**Description:** Predict 1st AND 2nd place
**Requirements:**
- Exacta bet option
- Pick first and second place
- Higher payout (20x-50x)
**Acceptance Criteria:**
- Can select two racers
- Correct detection
- Big payout

---

### 3.10 Mini-Game #9: Dice Roll

#### Task 3.10.1: Dice Roll - Basic Implementation
**Priority:** HIGH  
**Description:** Two dice betting game
**Requirements:**
- Roll two dice
- Multiple bet types:
  - Over/Under total
  - Exact sum
  - Doubles
  - Specific numbers
- Different payouts per bet type
**Subtasks:**
- Create dice components
- Roll animation
- Bet type selection
- Payout calculation
**Acceptance Criteria:**
- Dice roll fairly
- All bet types work
- Payouts correct

#### Task 3.10.2: Dice Roll - Loaded Dice Feature
**Priority:** LOW  
**Description:** Roll 3 dice, keep best 2
**Requirements:**
- Loaded Dice button
- Costs extra coins
- Roll 3, player chooses 2
**Acceptance Criteria:**
- 3 dice rolled
- Player selects 2
- Cost deducted

---

### 3.11 Mini-Game #10: Mini Poker

#### Task 3.11.1: Mini Poker - Basic Implementation
**Priority:** MEDIUM  
**Description:** 3-card poker against dealer
**Requirements:**
- Deal 3 cards to player and dealer
- Simplified hand rankings (3-card)
- Fold or Play options
- Beat dealer to win
**Subtasks:**
- Create 3-card hand evaluator
- Deal logic
- Dealer qualifying logic
- Payout calculation
**Acceptance Criteria:**
- Hands ranked correctly
- Dealer plays by rules
- Payouts correct

#### Task 3.11.2: Mini Poker - Peek Feature
**Priority:** LOW  
**Description:** See one dealer card before deciding
**Requirements:**
- Peek button
- Costs coins
- Reveals one dealer card
**Acceptance Criteria:**
- Shows one card
- Cost deducted

---

## 4. Coin Economy System

### 4.1 Core Coin System

#### Task 4.1.1: Coin Balance Management
**Priority:** HIGH  
**Description:** Track and manage player coin balance
**Requirements:**
- Store coin balance in database
- Add/subtract coins with transactions
- Prevent negative balance
- Transaction history log
**Acceptance Criteria:**
- Balance persists
- Cannot go negative
- All transactions logged

#### Task 4.1.2: Coin Transaction System
**Priority:** HIGH  
**Description:** Record all coin transactions
**Requirements:**
- Log every add/subtract with timestamp
- Include source (game name, earning method)
- Include amount and balance after
**Acceptance Criteria:**
- All transactions logged
- History viewable

---

### 4.2 Earning Methods

#### Task 4.2.1: Game Detection System
**Priority:** HIGH  
**Description:** Detect supported games running
**Requirements:**
- Process detection (check running .exe files)
- Supported game list (League of Legends, Valorant, etc.)
- Custom game profiles
- Status indicator in overlay
**Subtasks:**
- Implement process enumeration
- Match against game list
- Display detection status
**Acceptance Criteria:**
- Detects running games
- User can add custom games
- Status shown in UI

#### Task 4.2.2: In-Game Event Detection
**Priority:** MEDIUM  
**Description:** Detect and reward in-game events
**Requirements:**
- Screen recognition or API integration
- Detect kills, assists, objectives
- Award coins on detection
- Notification on reward
**Note:** This is complex and may require game-specific implementations
**Acceptance Criteria:**
- At least one game supported
- Events detected accurately
- Coins awarded

#### Task 4.2.3: Death Timer Bonus
**Priority:** LOW  
**Description:** Reward for not gambling during death
**Requirements:**
- Detect death timer (game-specific)
- Track if player gambled
- Award patience bonus
**Acceptance Criteria:**
- Detects death timer
- Tracks gambling
- Awards bonus

#### Task 4.2.4: Passive Earning - Video Detection
**Priority:** MEDIUM  
**Description:** Earn coins while watching videos
**Requirements:**
- Detect YouTube/Twitch tabs in browser
- Verify video is playing (not paused)
- Award coins per minute (capped daily)
- Idle detection (mouse/keyboard activity)
**Subtasks:**
- Browser tab detection
- Video playback verification
- Idle prevention
**Acceptance Criteria:**
- Detects video playback
- Awards coins over time
- Daily cap enforced

#### Task 4.2.5: Passive Earning - Music Detection
**Priority:** LOW  
**Description:** Earn coins while listening to music
**Requirements:**
- Detect Spotify/YouTube Music
- Award small coin trickle
**Acceptance Criteria:**
- Detects music apps
- Awards coins

#### Task 4.2.6: Active Window Time Tracking
**Priority:** MEDIUM  
**Description:** Earn coins for active PC usage
**Requirements:**
- Track active window time
- Detect idle (no input for X minutes)
- Award passive coins
**Acceptance Criteria:**
- Tracks active time
- Detects idle
- Awards coins

#### Task 4.2.7: Typing Speed Mini-Challenge
**Priority:** LOW  
**Description:** Random typing challenges for bonus coins
**Requirements:**
- Random popup (configurable frequency)
- Display sentence to type
- Timer countdown
- Award bonus on completion
- Dismiss option
**Acceptance Criteria:**
- Popup appears randomly
- Timer counts down
- Bonus awarded correctly
- Can be dismissed/disabled

---

### 4.3 Daily Tasks System

#### Task 4.3.1: Daily Tasks - Core System
**Priority:** MEDIUM  
**Description:** Daily mission system with rewards
**Requirements:**
- List of possible tasks
- Daily task selection (random 5-7 tasks)
- Progress tracking per task
- Completion detection
- Reset at midnight
**Acceptance Criteria:**
- Tasks reset daily
- Progress tracked
- Completion detected

#### Task 4.3.2: Daily Tasks - Task Types
**Priority:** MEDIUM  
**Description:** Implement all task types
**Requirements:**
- Game-specific tasks (win X games, play Y games)
- Gambling tasks (win Z flips, hit multiplier)
- Activity tasks (watch videos, earn passive)
- Achievement tasks
**Acceptance Criteria:**
- All task types work
- Progress updates correctly

#### Task 4.3.3: Daily Tasks - Daily Chest
**Priority:** MEDIUM  
**Description:** Reward for completing all dailies
**Requirements:**
- Chest awarded on all tasks complete
- Bonus coins
- Chance for cosmetic drop
- Chest opening animation
**Acceptance Criteria:**
- Chest awarded correctly
- Animation plays
- Rewards given

---

### 4.4 Hourly Bonus System

#### Task 4.4.1: Hourly Bonus - Implementation
**Priority:** MEDIUM  
**Description:** Claimable bonus every hour
**Requirements:**
- Timer countdown to next bonus
- Claim button
- Stacks up to 3 hours max
- Random mini-event chance
**Acceptance Criteria:**
- Timer accurate
- Stacks correctly
- Events trigger

---

### 4.5 Coin Milestones

#### Task 4.5.1: Milestone System
**Priority:** LOW  
**Description:** One-time bonuses for total coins earned
**Requirements:**
- Track lifetime coins earned
- Milestone thresholds (1K, 10K, 100K, 1M)
- Bonus payout on reach
- Achievement integration
**Acceptance Criteria:**
- Milestones tracked
- Bonuses awarded once
- Achievements trigger

---

### 4.6 Coin Investments

#### Task 4.6.1: Investment System - Core
**Priority:** LOW  
**Description:** Idle investment mechanic
**Requirements:**
- Invest coins into vault
- Choose risk level (Safe, Moderate, Risky)
- Calculate returns over time
- Random chance of loss on Moderate/Risky
**Subtasks:**
- Create investment UI
- Time-based calculation
- Risk/reward logic
**Acceptance Criteria:**
- Investments grow over time
- Risk levels work correctly
- Can withdraw anytime

---

## 5. Leaderboard & Social Features

### 5.1 Friend System

#### Task 5.1.1: Friend Code Generation
**Priority:** MEDIUM  
**Description:** Generate unique friend codes
**Requirements:**
- Generate unique code per install (e.g., GAMBA-XXXX-XXXX)
- Store in database
- Display in UI
**Acceptance Criteria:**
- Code generated on first run
- Code is unique
- Code displayed

#### Task 5.1.2: Friend Management
**Priority:** MEDIUM  
**Description:** Add/remove friends by code
**Requirements:**
- Add friend by entering code
- Friend list UI
- Remove friend option
- Friend nickname support
**Acceptance Criteria:**
- Can add friends
- List displays correctly
- Can remove friends

---

### 5.2 Data Sync

#### Task 5.2.1: Sync System - Local Network
**Priority:** LOW  
**Description:** Auto-discover friends on LAN
**Requirements:**
- Broadcast presence on local network
- Discover other miniGamba instances
- Auto-add to friend list (with permission)
**Acceptance Criteria:**
- Discovers local instances
- Requests permission
- Syncs automatically

#### Task 5.2.2: Sync System - Cloud (Optional)
**Priority:** LOW  
**Description:** Cloud-based stat sharing
**Requirements:**
- Firebase/Supabase integration
- Share stats via unique code
- Privacy settings
**Acceptance Criteria:**
- Stats sync to cloud
- Privacy respected
- Optional feature

---

### 5.3 Leaderboards

#### Task 5.3.1: Leaderboard - Core System
**Priority:** MEDIUM  
**Description:** Display friend leaderboards
**Requirements:**
- Multiple categories (coins, wins, achievements, etc.)
- Daily/Weekly/All-Time filters
- Rank calculation
- Update on data sync
**Acceptance Criteria:**
- All categories work
- Filters functional
- Updates correctly

#### Task 5.3.2: Leaderboard - Social Features
**Priority:** LOW  
**Description:** React and interact with leaderboard
**Requirements:**
- Friend activity feed
- Emoji reactions
- Challenge system
- Shame board (optional)
**Acceptance Criteria:**
- Activity feed updates
- Reactions send
- Challenges work

---

## 6. Customization & Cosmetics

### 6.1 Cosmetics System

#### Task 6.1.1: Cosmetics Database
**Priority:** MEDIUM  
**Description:** Store and manage cosmetics
**Requirements:**
- Database table for cosmetics
- Properties: id, name, type, unlock_condition, image_path
- Ownership tracking per user
**Acceptance Criteria:**
- All cosmetics stored
- Ownership tracked
- Queries efficient

#### Task 6.1.2: Cosmetics - Overlay Themes
**Priority:** MEDIUM  
**Description:** Multiple overlay visual themes
**Requirements:**
- Theme system (colors, fonts, backgrounds)
- Pre-built themes (Neon, Retro, Casino, Pixel, Dark, Vaporwave, Cyberpunk, Cozy)
- Theme switcher UI
- Apply theme to overlay
**Acceptance Criteria:**
- Multiple themes available
- Switcher works
- Themes apply correctly

#### Task 6.1.3: Cosmetics - Slot Machine Skins
**Priority:** LOW  
**Description:** Custom slot machine visuals/sounds
**Requirements:**
- Custom reel icons
- Custom spin sounds
- Asset import system
**Acceptance Criteria:**
- Skins change appearance
- Sounds change correctly
- Custom imports work

#### Task 6.1.4: Cosmetics - Card Backs & Dice
**Priority:** LOW  
**Description:** Custom card and dice skins
**Requirements:**
- Card back skins for card games
- Dice skins for dice game
- Apply in games
**Acceptance Criteria:**
- Skins visible in games
- Multiple options

#### Task 6.1.5: Cosmetics - Dashboard Wallpapers
**Priority:** LOW  
**Description:** Custom dashboard backgrounds
**Requirements:**
- Static images
- Animated wallpapers (GIF/video)
- Custom import
**Acceptance Criteria:**
- Wallpapers change background
- Animations work

#### Task 6.1.6: Cosmetics - Profile Customization
**Priority:** MEDIUM  
**Description:** Custom profile appearance
**Requirements:**
- Avatar/icon selection
- Profile border (based on achievement score)
- Title system
- Display on leaderboard
**Acceptance Criteria:**
- Profile displays correctly
- Borders show rank
- Titles selectable

#### Task 6.1.7: Cosmetics - Win Animations
**Priority:** LOW  
**Description:** Custom jackpot/win effects
**Requirements:**
- Multiple animation options (confetti, fireworks, screen shake, bass drop)
- Rare animations from achievements
- Meme sound support
**Acceptance Criteria:**
- Animations play on big wins
- Multiple options work
- Sounds play

---

### 6.2 Unlock System

#### Task 6.2.1: Unlock System - Core
**Priority:** MEDIUM  
**Description:** Manage cosmetic unlocks
**Requirements:**
- Unlock conditions (level, achievement, coins, scratch cards)
- Check unlock status
- Award cosmetics
- Notification on unlock
**Acceptance Criteria:**
- Conditions checked correctly
- Unlocks awarded
- Notifications appear

---

## 7. Achievements System

### 7.1 Achievement Core

#### Task 7.1.1: Achievement Database
**Priority:** MEDIUM  
**Description:** Store all achievements
**Requirements:**
- Database table with all achievements
- Properties: id, name, description, condition, AP reward, secret flag
- Progress tracking per achievement
- Completion status
**Acceptance Criteria:**
- All achievements stored
- Progress tracked
- Completion detected

#### Task 7.1.2: Achievement Checking System
**Priority:** MEDIUM  
**Description:** Check and award achievements
**Requirements:**
- Hook into game events
- Check conditions after events
- Award achievement if met
- Notification popup
- AP awarded
**Acceptance Criteria:**
- Achievements trigger correctly
- Notifications show
- AP added

---

### 7.2 Achievement Categories

#### Task 7.2.1: Gambling Achievements
**Priority:** MEDIUM  
**Description:** Implement all gambling-related achievements
**Requirements:**
- Track stats for all mini-games
- Check conditions (first spin, jackpots, streaks, etc.)
- Award 40+ gambling achievements
**Acceptance Criteria:**
- All gambling achievements work
- Stats tracked correctly

#### Task 7.2.2: Economy Achievements
**Priority:** MEDIUM  
**Description:** Coin earning/spending achievements
**Requirements:**
- Track coin earnings, balance, investments
- Check milestones
- Award achievements
**Acceptance Criteria:**
- All economy achievements work

#### Task 7.2.3: Activity & Passive Achievements
**Priority:** LOW  
**Description:** Activity-based achievements
**Requirements:**
- Track video watching, PC time, tasks, bonuses
- Award achievements
**Acceptance Criteria:**
- Activity tracked
- Achievements awarded

#### Task 7.2.4: Social & Leaderboard Achievements
**Priority:** LOW  
**Description:** Friend and leaderboard achievements
**Requirements:**
- Track friends added, leaderboard ranks, challenges
- Award achievements
**Acceptance Criteria:**
- Social achievements work

#### Task 7.2.5: Customization & Meta Achievements
**Priority:** LOW  
**Description:** Cosmetic and meta achievements
**Requirements:**
- Track cosmetic unlocks, profile changes
- Award achievements
**Acceptance Criteria:**
- Meta achievements work

#### Task 7.2.6: Secret Achievements
**Priority:** LOW  
**Description:** Hidden achievements
**Requirements:**
- Hidden from UI until unlocked
- Special triggers (midnight spin, exact balance, etc.)
**Acceptance Criteria:**
- Hidden until unlock
- Special conditions work

---

## 8. Settings & Configuration

### 8.1 General Settings

#### Task 8.1.1: Settings UI - General Tab
**Priority:** MEDIUM  
**Description:** General application settings
**Requirements:**
- Launch on startup toggle
- Start in overlay mode toggle
- Notification preferences
- Sound master volume slider
- Per-game volume sliders
**Acceptance Criteria:**
- All settings save
- Take effect immediately

---

### 8.2 Overlay Settings

#### Task 8.2.1: Settings UI - Overlay Tab
**Priority:** MEDIUM  
**Description:** Overlay-specific settings
**Requirements:**
- Opacity slider (10-100%)
- Size slider (small/medium/large/custom)
- Position lock toggle
- Auto-hide toggle
- Display mode (minimal/expanded)
- Click-through mode toggle
**Acceptance Criteria:**
- All settings apply to overlay
- Changes visible immediately

---

### 8.3 Hotkey Settings

#### Task 8.3.1: Settings UI - Hotkeys Tab
**Priority:** MEDIUM  
**Description:** Customizable hotkey bindings
**Requirements:**
- List of hotkey actions (toggle overlay, quick spin, etc.)
- Hotkey recording UI
- Conflict detection
- Reset to defaults
**Acceptance Criteria:**
- Custom hotkeys save
- Conflicts prevented
- Reset works

---

### 8.4 Game Detection Settings

#### Task 8.4.1: Settings UI - Games Tab
**Priority:** MEDIUM  
**Description:** Configure game detection
**Requirements:**
- Supported game list
- Enable/disable per game
- Add custom game by .exe
- Per-game coin reward configuration
**Acceptance Criteria:**
- Game list editable
- Custom games work
- Rewards configurable

---

### 8.5 Privacy & Data Settings

#### Task 8.5.1: Settings UI - Privacy Tab
**Priority:** MEDIUM  
**Description:** Data and privacy controls
**Requirements:**
- Export save data button
- Import save data button
- Reset progress button (with double confirmation)
- Data sharing preferences for leaderboard
**Acceptance Criteria:**
- Export/import work
- Reset confirmation required
- Privacy settings respected

---

## 9. Stats & History

### 9.1 Personal Stats

#### Task 9.1.1: Stats Dashboard - Overview
**Priority:** MEDIUM  
**Description:** Personal statistics page
**Requirements:**
- Total games played (per game + overall)
- Win/loss ratio (per game + overall)
- Total coins earned/spent/net profit
- Biggest win and biggest loss
- Current streak and best streak
- Favorite game (most played)
- Time spent in miniGamba
**Acceptance Criteria:**
- All stats calculated correctly
- UI displays clearly

#### Task 9.1.2: Stats Dashboard - Graphs
**Priority:** LOW  
**Description:** Visual data representation
**Requirements:**
- Coin balance over time (line graph)
- Win rate trends (line graph)
- Games played per day (bar chart)
- Game type distribution (pie chart)
**Acceptance Criteria:**
- Graphs render correctly
- Data accurate

---

### 9.2 Game History

#### Task 9.2.1: Game History Log
**Priority:** MEDIUM  
**Description:** Scrollable log of all games
**Requirements:**
- List view of all games played
- Show: game type, bet, result, payout, timestamp
- Filter by game type, date, result, bet size
- Pagination or infinite scroll
**Acceptance Criteria:**
- All games logged
- Filters work
- Performance good

#### Task 9.2.2: Game History - Replay Feature
**Priority:** LOW  
**Description:** Replay past games
**Requirements:**
- For certain games (slots, wheel), show replay
- Animate the game result again
**Acceptance Criteria:**
- Replays play correctly
- Only supported games

---

## 10. Progression System

### 10.1 Player Level

#### Task 10.1.1: XP and Leveling System
**Priority:** MEDIUM  
**Description:** Player experience and level progression
**Requirements:**
- Earn XP from games, tasks, achievements
- XP-to-level curve (exponential)
- Level 1-50
- XP bar in UI
- Level up notification
**Acceptance Criteria:**
- XP awarded correctly
- Level progression smooth
- Notifications appear

#### Task 10.1.2: Level-Based Unlocks
**Priority:** MEDIUM  
**Description:** Unlock games and features by level
**Requirements:**
- Level requirements for each game/feature
- Lock UI for unavailable items
- Unlock notification
**Level gates:**
- L1: Slot Machine, Coin Flip
- L3: Blackjack
- L5: Higher or Lower
- L8: Scratch Cards
- L10: Wheel of Fortune, Investments
- L13: Minesweeper
- L15: Dice Roll
- L18: Mini Derby
- L20: Mini Poker
- L25: Custom imports, advanced cosmetics
- L30: Prestige option
**Acceptance Criteria:**
- Items locked until level reached
- Unlocks trigger at correct level

---

### 10.2 Prestige System

#### Task 10.2.1: Prestige - Core System
**Priority:** LOW  
**Description:** Reset level for bonuses
**Requirements:**
- Available at Level 30+
- Confirmation dialog
- Reset level to 1
- Keep cosmetics and achievements
- Award Prestige Star
- Increase passive coin rate by 5%
- Max Prestige: 10
**Acceptance Criteria:**
- Prestige option at L30+
- Keeps cosmetics/achievements
- Bonuses apply

#### Task 10.2.2: Prestige - Exclusive Cosmetics
**Priority:** LOW  
**Description:** Prestige-only cosmetics
**Requirements:**
- Special cosmetics for each Prestige level
- Display Prestige level on profile
**Acceptance Criteria:**
- Cosmetics unlock at Prestige
- Profile shows Prestige

---

## 11. UI/UX Design

### 11.1 Dashboard UI

#### Task 11.1.1: Dashboard - Navigation System
**Priority:** HIGH  
**Description:** Main navigation for dashboard
**Requirements:**
- Tab/page system (Home, Games, Leaderboard, Stats, Achievements, Friends, Settings, Customization)
- Smooth transitions
- Persistent navigation bar
**Acceptance Criteria:**
- All pages accessible
- Navigation smooth

#### Task 11.1.2: Dashboard - Home Page
**Priority:** HIGH  
**Description:** Landing page with key info
**Requirements:**
- Coin balance display
- Current level and XP
- Daily tasks quick view
- Hourly bonus timer
- "Start miniGamba" button (launch overlay)
- Recent activity feed
**Acceptance Criteria:**
- Key info visible
- Start button launches overlay

#### Task 11.1.3: Dashboard - Games Library
**Priority:** MEDIUM  
**Description:** Browse all mini-games
**Requirements:**
- Grid/list of all games
- Lock indicator for unavailable games
- Quick play from dashboard option
- Game stats per game
**Acceptance Criteria:**
- All games listed
- Locked games indicated

---

### 11.2 Overlay UI

#### Task 11.2.1: Overlay - Minimal Mode
**Priority:** HIGH  
**Description:** Compact overlay UI
**Requirements:**
- Small window (300x400px default)
- Game selector dropdown
- Current game display
- Coin balance
- Minimal chrome
**Acceptance Criteria:**
- Compact and unobtrusive
- All games accessible

#### Task 11.2.2: Overlay - Expanded Mode
**Priority:** MEDIUM  
**Description:** Larger overlay with more info
**Requirements:**
- Larger window (500x600px)
- Game + stats + streak info
- Quick settings access
**Acceptance Criteria:**
- More information visible
- Toggle between minimal/expanded

---

### 11.3 Notifications

#### Task 11.3.1: Notification System
**Priority:** MEDIUM  
**Description:** In-app notifications
**Requirements:**
- Toast/popup notifications
- Types: achievement unlocked, level up, friend activity, hourly bonus ready, daily reset
- Duration: 3-5 seconds
- Queue system (don't overlap)
- Sound effects per type
**Acceptance Criteria:**
- Notifications appear correctly
- Don't block gameplay
- Sounds play

---

## 12. Performance & Optimization

### 12.1 Resource Management

#### Task 12.1.1: Low CPU/RAM Usage
**Priority:** HIGH  
**Description:** Optimize for minimal resource usage
**Requirements:**
- Idle CPU < 1%
- Active CPU < 5%
- RAM < 200MB
- Efficient game detection (poll every 5s, not continuous)
**Acceptance Criteria:**
- Meets resource targets
- No lag in games

#### Task 12.1.2: GPU Acceleration
**Priority:** MEDIUM  
**Description:** Use GPU for animations
**Requirements:**
- Hardware-accelerated rendering
- CSS transforms and animations
- Canvas for complex animations
**Acceptance Criteria:**
- Smooth 60fps animations
- Low CPU during animations

---

### 12.2 Data Optimization

#### Task 12.2.1: Database Optimization
**Priority:** MEDIUM  
**Description:** Fast data access
**Requirements:**
- Indexed queries
- Batch writes
- Connection pooling
**Acceptance Criteria:**
- Queries < 10ms
- No blocking operations

---

## 13. Testing Requirements

### 13.1 Unit Tests

#### Task 13.1.1: Game Logic Tests
**Priority:** HIGH  
**Description:** Test all game calculations
**Requirements:**
- Payout calculations
- Win/loss detection
- Probability distributions
- Edge cases
**Acceptance Criteria:**
- >90% coverage for game logic
- All edge cases covered

---

### 13.2 Integration Tests

#### Task 13.2.1: E2E Game Flows
**Priority:** MEDIUM  
**Description:** Test complete game flows
**Requirements:**
- Play full game session
- Coin transactions
- Achievement triggers
**Acceptance Criteria:**
- All games playable end-to-end
- No crashes

---

### 13.3 Performance Tests

#### Task 13.3.1: Resource Usage Tests
**Priority:** MEDIUM  
**Description:** Verify performance targets
**Requirements:**
- Measure CPU/RAM over time
- Stress test (rapid gameplay)
- Long-running stability
**Acceptance Criteria:**
- Meets performance targets
- Stable for 24+ hours

---

## 14. Security & Safety

### 14.1 Data Security

#### Task 14.1.1: Local Data Encryption
**Priority:** MEDIUM  
**Description:** Protect user data
**Requirements:**
- Encrypt sensitive data at rest
- Secure key storage
**Acceptance Criteria:**
- Data encrypted
- Cannot be easily modified

---

### 14.2 Anti-Cheat

#### Task 14.2.1: Basic Anti-Cheat
**Priority:** LOW  
**Description:** Prevent easy cheating
**Requirements:**
- Checksum saves
- Server-side validation (if using cloud sync)
- Detect save editing
**Acceptance Criteria:**
- Edited saves detected
- Cannot inject fake coins easily

---

## 15. Documentation

### 15.1 User Documentation

#### Task 15.1.1: User Guide
**Priority:** LOW  
**Description:** Help documentation for users
**Requirements:**
- Getting started guide
- Game rules for each mini-game
- Settings explanations
- FAQ
**Acceptance Criteria:**
- Complete user guide
- Accessible in-app

---

### 15.2 Developer Documentation

#### Task 15.2.1: Code Documentation
**Priority:** MEDIUM  
**Description:** Document codebase
**Requirements:**
- README with setup instructions
- API documentation
- Architecture overview
- Contribution guidelines
**Acceptance Criteria:**
- Code well-documented
- Easy for new devs to understand

---

## 16. Build & Deploy

### 16.1 Build System

#### Task 16.1.1: Electron Build Configuration
**Priority:** HIGH  
**Description:** Configure Electron builder
**Requirements:**
- Build for Windows (primary)
- Auto-updater support
- Installer creation
- Code signing (optional)
**Acceptance Criteria:**
- Builds create installer
- Installs and runs correctly

---

### 16.2 Distribution

#### Task 16.2.1: Release Pipeline
**Priority:** MEDIUM  
**Description:** Automated releases
**Requirements:**
- GitHub Actions CI/CD
- Build on tag push
- Create GitHub release
- Upload installers
**Acceptance Criteria:**
- Releases automated
- Installers downloadable

---

## 17. Future Considerations

### 17.1 Stretch Goals
- Seasonal events and limited-time games
- Tournament mode for friends
- Discord Rich Presence integration
- Stream overlay mode (OBS-compatible)
- Mobile companion app
- Betting on real game outcomes
- Friend gifting and coin stealing
- Daily lottery

---

## Appendix A: Technology Stack Recommendations

### Frontend
- **Framework:** Electron (cross-platform desktop)
- **UI Library:** React or Vue.js
- **Styling:** CSS-in-JS (styled-components) or Tailwind CSS
- **Animation:** Framer Motion or GSAP
- **State Management:** Redux or Zustand

### Backend/Data
- **Local Database:** SQLite (via better-sqlite3)
- **Data Sync (optional):** Firebase or Supabase
- **File Storage:** Local filesystem

### Game Engine
- **Canvas Rendering:** HTML5 Canvas or Phaser.js
- **Physics (if needed):** Matter.js

### System Integration
- **Hotkeys:** electron-globalshortcut or node-global-keylistener
- **Process Detection:** node-process-list
- **Window Management:** electron BrowserWindow API
- **Screen Capture (optional):** screenshot-desktop or robotjs

### Testing
- **Unit Tests:** Jest
- **E2E Tests:** Playwright or Spectron
- **Coverage:** Istanbul/nyc

### Build & Deploy
- **Build Tool:** electron-builder
- **CI/CD:** GitHub Actions
- **Auto-Update:** electron-updater

---

## Appendix B: Development Priorities

### Phase 1: Core Foundation (MVP)
1. Application shell (Dashboard + Overlay windows)
2. Data persistence (SQLite setup)
3. Coin system (balance, transactions)
4. 3 basic games (Slot Machine, Coin Flip, Blackjack)
5. Basic UI/UX

### Phase 2: Game Expansion
1. Remaining 7 mini-games
2. Game detection system
3. Basic earning methods (passive coins, hourly bonus)

### Phase 3: Progression & Social
1. Achievement system
2. Daily tasks
3. Level and XP system
4. Friend codes and leaderboards

### Phase 4: Polish & Features
1. Customization system
2. All cosmetics
3. Prestige system
4. Advanced earning methods (video detection, typing challenges)

### Phase 5: Optimization & Release
1. Performance optimization
2. Testing and bug fixes
3. User documentation
4. Release pipeline

---

**END OF PRODUCT REQUIREMENTS DOCUMENT**
