# ✦ Mundane State: An Esoteric Oracle Dashboard

Mundane State is a deeply customized, private web application serving as a daily dashboard for esoteric guidance, flow state tracking, and subconscious reprogramming based largely on the teachings of Neville Goddard and the "Law of Reverse Effort".

Designed with a premium, space-age aesthetic utilizing dynamic CSS gradients, custom micro-interactions, and a reactive Parallax starfield, the dashboard attempts to help its user seamlessly ground their reality into a state of "naturalness" rather than forcing outcomes through sheer willpower.

## 🔮 Core Systems

### 1. Cosmic Baseline
An aggregated data pipeline designed to define the background frequency or "weather" of the given day.
* **Astrology**: Connects to the `FreeAstrologyAPI` to pull the prominent planetary transit affecting the immediate geographic timezone. This data dynamically shifts the application's underlying global CSS variables (injecting fiery red hues for Mars, deep aquatic tones for Neptune/Moon, or cool grey structures for Saturn).
* **Numerology**: Computes the Universal Day Number—tracking cyclic daily manifestation frequencies.
* **Lunar Phase**: Ingests exact phase calculations utilizing `lunarphase-js`, mapping the gravitational and elemental pulls of the moon to inform the UI generation.
* **Reactive Environment**: A custom Next.js `<canvas>` `requestAnimationFrame` loop plots 150 unique coordinate particles forming a Starfield. The overall radial velocity is manipulated dynamically by the Cosmic Baseline (e.g., stars travel 60% slower when ethereal placements like Neptune or the Moon are prominent), and a custom magnetic parallax tracks the user's mouse coordinates, dragging constellations through space seamlessly.

### 2. The Oracle (Tarot Engine)
A highly polished, 3D CSS hardware-accelerated feature representing an actionable Tarot Stage.
* Supports **Daily Draws** or **Three-Card Spreads** ("Current State", "Friction", "The Anchor").
* The backend (`/api/tarot`) leverages Node's `crypto` module to securely shuffle the full Major and Minor Arcana dynamically into the current deck.
* Incorporates a probabilistic 50% chance for inverted reversals mapping perfectly back to the client-side UI, manipulating native React SVGs using a multi-axis `rotateY` and `rotateZ` transform logic.
* Driven by micro-interactions, where hovered cards lift from the table in 3-dimensional space while their textual metadata remains gracefully hidden via `transition-delay` locks precisely until the rotational wipe resolves.

### 3. Studio Synthesis (Gemini 2.5 Flash)
An intelligent contextual synthesizer. When "Translate to Action" is fired, the frontend collects the entire active state: The Lunar Phase, Universal Day, active Transit Aspect, and all visibly drawn Tarot cards (along with their upward/reversed statuses). 
* The payload is injected into a specialized `generateContent` configuration communicating with Google's **Gemini 2.5 Flash** model. 
* The LLM operates strictly under a heavily engineered system prompt explicitly forbidding it from offering advice based on "grinding" or "hustle-culture." All insight generated *must* encourage the user to surrender resistance, release logical blockages, and adopt the profound, mundane naturalness of assuming the wish has already been fulfilled.
* The system injects a specialized generative placeholder—a highly polished CSS Gradient Skeleton—running localized structural shimmers mimicking the dimensions of an incoming server-response during API latency cooldowns.
* Outputs not only actionable advice but dynamic array classifications mapping out the user's current **Energetic Weather**. The backend enforces strict JSON schemas routing ratings ("Strong", "Active", "Light") into `Career Ambition`, `Mental Flow`, `Romantic Charge`, etc., building width-managed progressive CSS flex UI bars on the client.

### 4. Neville Goddard Protocol & SATS Manager
A dedicated system to map and archive intentional realities.
* **Scene Construction**: The user logs a brief descriptive anchor acting as their "wish fulfilled" for their State Akin to Sleep (SATS) visualizations.
* **Flow vs Friction Tracking**: Next to the daily anchor is an interactive toggle segment. Here, the user logs their relative mental workload tracking ranging internally from "High Friction," "Neutral," to "Pure Flow"—a metric built to identify mental exhaustion or alignment over months of use.
* **SATS Optimization Mode**: With a scene anchored, the user can trigger the SATS Mode function, dimming the entire application behind a `z-index` locked fullscreen overlay. The application injects a pitch-black breathing radial pulse designed specifically to sync the user into a 4-7-8 deep breathing state immediately prior to sleep, stabilizing heart rate while the anchored text gently ghosts across the center axis.

### 5. Log Archive & Dynamic Heatmap
The tracking layer. All anchored scenes, along with their matching dates, universal numbers, astrological transits, and flow state payloads are saved securely into a localized SQLite cache connected via Prisma ORM.
* Navigating to `/archive` loads a Server Side Next.js component rendering the data visually.
* Generates a sprawling **GitHub-style Heatmap** built iteratively off raw `Date` string matching maps over the preceding two months of historical logs. The application visually renders "High Friction" blockages in dull greys, while highly productive "Pure Flow" days ignite the board in gleaming signature gold.

---

## 🚀 Tech Stack Architecture

- **Framework**: *Next.js 16 (Turbopack)* - Server Components, API routes, Client closures.
- **Styling**: *Vanilla CSS3 Custom Properties* - Stripped entirely off monolithic monolithic component tags into deep, easily modifiable DOM class structures heavily leaning on dynamic Flexbox, CSS Grid layouts, and hardware accelerating (`transform: rotate`, `transition-delays`, and `animation: shimmer`) properties.
- **Database**: *SQLite 3* configured structurally via *Prisma ORM*.
- **External Integration**: *Gemini AI API* (`@google/genai`) & *FreeAstrologyAPI*.
- **Libraries**: `lucide-react` (SVGs), `lunarphase-js` (Cosmic Math).

## 🛠 Setup & Installation

*Requires Node.js v18+*

**1. Clone the Repository & Configure Dependencies**
\`\`\`bash
git clone https://github.com/jesseleechan/oracle-dashboard.git
cd oracle-dashboard
npm install
\`\`\`

**2. Environmental Variables**
At the root directory, create a `.env.local` configuration. Provide valid credentials for the API bindings:
\`\`\`env
# External APIs
GEMINI_API_KEY="your_google_ai_studio_api_key_here"
ASTROLOGY_API_KEY="your_free_astrology_api_key_here"

# Database path referencing Prisma
DATABASE_URL="file:./dev.db"
\`\`\`

**3. Initialize Database**
\`\`\`bash
npx prisma db push
\`\`\`

**4. Spin up the Turbopack Compiler**
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) inside your browser. By default, the Oracle loads pointing at a daily shuffle layout and waits for your command to materialize reality.
