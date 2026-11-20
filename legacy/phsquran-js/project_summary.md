# PhsQuran Platform - Architecture & Session Rules

## 🎯 Project Goal
To build a comprehensive, high-performance platform for analyzing the Holy Quran from a numerical (statistical) perspective. It must support arbitrary mathematical models, equations, and algorithms while maintaining a beautiful, interactive, and offline-capable user experience.

## 🏗️ Architecture Stack
1. **Frontend:** React.js (Vite)
   - **Styling:** Vanilla CSS with a custom premium "glassmorphism" design system (`index.css`).
   - **Routing:** `react-router-dom` (Decoupled Homepage `/` vs Workspace `/workspace/*`).
   - **Visualization:** `recharts` for interactive charts.
   - **Icons:** `lucide-react`.
   - **Localization:** `react-i18next` (Arabic and English). **Arabic is the default.**
   - **PWA:** `vite-plugin-pwa` for offline capability.
2. **Backend:** Node.js (Express)
   - **Purpose:** Decoupled from the frontend so the logic can eventually power mobile apps and external APIs.
   - **Data Handling:** Loads data into memory on startup for maximum calculation speed (`index.js` -> `loadDataFile`).
   - **Port:** Runs on `3000`, proxied by Vite (`/api/*`) during development.

## 💾 Data Structure
The dataset resides in the `/data` folder (or `/Data` in Windows). Due to their size and original format, the files are JavaScript files (`.js`) exporting arrays of objects, not pure JSON.
- `swar-data.js`: Surah metadata (ID, Name, Type, Revelation Order, Ayah counts).
- `ayat-data.js`: Deep Ayah data containing textual representations and metadata mapping back to Surahs.
- `qwords-data.js`: Word-level numerical values (e.g. `jummal`, `abjad`, `ayqagh`).
- `tables-data.js`: Reference tables.

**Rule for Backend:** When reading these files, the backend uses a custom string parser (`substring` stripping) in `routes.js` to convert the `.js` export syntax into valid JSON for memory loading.

## 🔤 Data Mapping & Searching Rules (CRITICAL)
Always use these specific fields from the dataset depending on the operation:

**For Ayats (`ayat-data.js`):**
- When **studying** ayat (e.g. Character Frequencies): Use `ayat28Text`
- When **searching** ayat WITHOUT tashkil: Use `ayatOText`
- When **searching** ayat WITH tashkil: Use `ayatNText`

**For Quran Words (`qwords-data.js`):**
- When **studying** ayat words: Use `text28`
- When **searching** without tashkil: Use `otext`
- When **searching** with tashkil: Use `ntext`

## 📝 General Rules for Future Sessions
1. **Never Break Decoupling:** All heavy data processing, counting, and mathematical calculations MUST happen in the Node.js backend API (`routes.js`). The React frontend should ONLY request data and visualize it.
2. **Language & RTL:** Arabic is the default language. Ensure that any new UI components correctly support RTL (Right-to-Left) layouts. Check `i18n.js` and CSS flex directions.
3. **Design Aesthetics:** Maintain the premium "glassmorphism" look. Use gradients, blur (`backdrop-filter`), subtle borders, and smooth transitions. Avoid standard, flat web designs. Ensure the UI feels alive.
4. **Data Handling:** If introducing a new dataset, follow the existing loading pattern in `backend/routes.js`. Do not attempt to `require()` or `import` the massive `.js` data files directly in React, as it will crash the browser or lead to massive bundle sizes.
5. **Migrating Old Processes:** The legacy PHP project (`assets/js/page-*.js`) had processes like "Symmetric 2 Words", "Count Characters", etc. When implementing these, map the old PHP logic to a clean REST API endpoint first, then build a React view. Do not use jQuery or string concatenation for UI.

## 🚀 Current State & Implemented Features
**Core:**
- Separation of Frontend and Backend.
- PWA Configuration (Offline Ready).
- i18n Localization (Arabic/English).
- Home Page with Hero and Features.
- Sidebar Navigation for Workspace (`Sidebar.jsx`).

**Workspace Features (`/workspace`):**
- **Dashboard Stats:** Live Surah/Ayah counts.
- **Surah Analytics:** Data grid showing all 114 Surahs.
- **Symmetric Chapters:** Calculates left/right axis symmetries based on total Ayahs per Surah.
- **Study Chapter:** Calculates Word/Character counts and Character frequencies (using `ayat28Text`) for a selected Surah.
- **Study Verse:** Calculates Word/Character counts and Character frequencies (using `ayat28Text`) for a specific Ayah.
- **Symmetric 2 Words:** Searches for intersections of two words across the entire Quran, with support for Tashkil toggling (switching between `ayatOText` and `ayatNText`).

## 🔜 Next Steps / Unfinished Features
- `Symmetric Verses` (`page-1102.js` / `page-1202.js` equivalents)
- `Symmetric Words` (More advanced word-level analysis)
- `Study Character`
- Additional Statistical Charts (`recharts`)
