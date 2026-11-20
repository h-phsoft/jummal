# دليل التطوير: دراسات عددية في القرآن الكريم

هذا الملف مرجع كامل لمن يكمل تطوير المشروع، سواء كان مطوراً أو مساعداً آلياً. اقرأه كاملاً قبل أي تعديل، ثم اقرأ [CLAUDE.md](../CLAUDE.md) لقواعد العمل المختصرة.

آخر تحديث: 2026-11-20، وآخر commit موثق: `6d89009` على `main`.

---

## 1. ما هو المشروع

منصة للدراسة العددية للقرآن الكريم، تتكون من مجموعتين من الأدوات:

- **أدوات الجمّل:** حساب الجمّل والأبجد والأيقغ، والجداول المخصصة (35 جدولاً)، والأوفاق (3×3 إلى 9×9)، ودراسة الرقم، والبحث عن رقم في كلمات القرآن، والمنصة الموحدة التي تجمعها.
- **الدراسات والإحصاءات (أصلها مشروع PhsQuran):** تطابق السور والآيات والكلمات، ودراسة سورة وآية وحرف، وإحصاءات الحروف والسور، والرسوم البيانية.

**الاسم:** «دراسات عددية في القرآن الكريم»، وبالإنجليزية «Numerical Studies in the Holy Quran».

**أصل المشروع:** دُمج فيه مشروعان:
- **«جمّل»:** صفحات HTML وjQuery، وكان في هذا المستودع.
- **«PhsQuran»:** React وExpress وPHP قديم، وكان في `d:\PhSoft\Projects\NodeJS\PhsQuran`. ذلك المجلد الأصلي لم يعد مستخدماً، وبياناته قديمة فيها أخطاء، فلا تعتمد عليه.

---

## 2. قرارات ثابتة (قررها صاحب المشروع، لا تغيّرها دون سؤاله)

| القرار | التفصيل |
|---|---|
| يعمل دون إنترنت | موقع PWA يُثبَّت على الجهاز، وبرنامج exe محمول لويندوز |
| ملفات فقط، دون قاعدة بيانات | البيانات في `data/*.js`. لا MySQL ولا SQLite. ملف `phquran.sql` القديم تُرك عمداً |
| لا PHP ولا jQuery | كان PHP يُستخدم فقط من أجل include، وحلّت محله مكونات React |
| لا خادم | الحساب يجري في المتصفح. لا Passenger ولا Node على cPanel. واجهة برمجية اختيارية قد تُضاف لاحقاً لمن يريد (§7) |
| مصدر واحد لكل حساب | كل حساب في `packages/core` مرة واحدة فقط، وتستدعيه الواجهة (وأي خادم يُضاف لاحقاً). لا تكرر منطقاً في مكون أو مسار |
| الحد الأدنى للوفق المثلث | 15 في كل مكان، ويُقرأ من `WEFEQ_MAGIC_CONSTANTS.triangle` |
| اللغة | العربية افتراضية (RTL). في الوضع العربي لا تظهر أي كلمة إنجليزية |
| النمط | فاتح وداكن، بزر في الشريط العلوي. يُحفظ الاختيار، ويتبع النظام إن لم يُختر |
| تفضيلات عرض سابقة (من جمّل) | قائمة خيارات الأرقام تفتح في تبويب جديد. في الأوفاق تُلوَّن خانة جبر الكسر وحدها، وفقط عند وجود كسر |

---

## 3. البنية

```
data/                 ← بيانات القرآن: المصدر الوحيد (لا تُعدَّل إلا هنا)
packages/core/        ← @jummal/core: كل الحسابات + الاختبارات
  src/                  letters, tables, wefq, text-stats, word-search,
                        number-study, quran-analysis, quran-stats, data-file
  test/core.test.js     12 اختباراً (node:test)
  test/fixtures/        نتائج وكود قديم لمقارنة النتائج (Q01, Q02, number-study)
frontend/             ← الواجهة: React 19 + Vite 8 + PWA
  public/               الأيقونات + .htaccess (+ data/*.json مولَّدة، غير محفوظة في git)
  scripts/prepare-data.mjs   يحوّل data/*.js إلى public/data/*.json عند البناء
  src/
    App.jsx             الشريط العلوي (الاسم، النمط، اللغة) والتوجيه
    main.jsx            الخطوط المحلية، HashRouter، تطبيق النمط، تسجيل PWA
    pages/              Home, Workspace (مسارات مساحة العمل + لوحة البداية)
    components/         صفحات الدراسات والإحصاءات + Sidebar + stats/*
    tools/              صفحات أدوات الجمّل + tools/components/*
    services/           data.js, api.js, theme.js, offline.js
    hooks/              useApiData, useStoredList
    locales/            ar.json, en.json (كل نصوص الواجهة)
    styles/tools.css    أنماط الأدوات (فوق index.css)
desktop/              ← برنامج سطح المكتب (Electron 45 + electron-builder)
tools/                ← package-cpanel.mjs (حزمة النشر)
.github/workflows/deploy.yml  ← البناء والنشر الآلي
```

المستودع npm workspaces: الحزم `packages/*` و`frontend` و`desktop`، وملف قفل واحد `package-lock.json` في الجذر.

---

## 4. البيانات

### 4.1 الملفات

| الملف | المتغير | المحتوى |
|---|---|---|
| `data/ayat-data.js` | `qAyatData` | 6,236 آية (نحو 7 ميغابايت) |
| `data/qwords-data.js` | `qWordsData` | 13,152 كلمة مختلفة بقيمها |
| `data/swar-data.js` | `qSwarData` | 114 سورة: عدد الآيات، ترتيب التنزيل، مكية/مدنية |

**صيغة الملف:** `const qAyatData = [ ... ];` بنهايات أسطر CRLF. يقرأ الملفَّ `parseDataFile` في `packages/core/src/data-file.js`، فيأخذ ما بين أول `[` وآخر `]`.

**جداول الحساب الـ 35** (الجمل والأبجد والأيقغ والطبائع وبسط 1 إلى 10) ليست ملف بيانات، بل هي في `packages/core/src/tables.js`.

### 4.2 صيغ نص الآية الخمس

| الحقل | الرسم | الاستخدام |
|---|---|---|
| `ayatNText` | عثماني بالتشكيل | البحث بالتشكيل، وعرض الآية |
| `ayatOText` | عثماني بلا تشكيل | البحث بلا تشكيل |
| `ayat28Text` | عثماني بالحروف الـ 28 | **كل الحسابات والدراسات** |
| `ayatRead` | إملائي بالتشكيل | للعرض فقط (غير مستخدم حالياً) |
| `ayatSearch` | إملائي بلا تشكيل | البحث في قائمة الآيات (F9) |

**قاعدة للكلمات:** الدراسة تستخدم `text28`، والبحث بلا تشكيل `otext`، والبحث بالتشكيل `ntext`.

### 4.3 قواعد الحروف الـ 28 (أكّدها صاحب المشروع، وليست أخطاء)

- **الهمزة المنفردة (ء) تُحذف:** «السماء» ← «السما».
- **تحويل الصور الفرعية:** أ إ آ ← ا، ة ← ه، ؤ ← و، ى ئ ← ي.
- **واو العطف كلمة مستقلة:** «و اياك». لذلك عدد الكلمات 87,020، والعدد المشهور نحو 77,400.
- **النص الذي يكتبه المستخدم:** يُحوَّل إلى الحروف الـ 28 ويُعرض بها، فـ«يؤمنون» تُعرض «يومنون». التنفيذ في `cleanArabicText`.

### 4.4 تصحيحات أُجريت على البيانات

| التاريخ | التصحيح |
|---|---|
| f24068c | 3:19: «بيا» ← «بغيا» (سقطت الغين). وحُذفت من قائمة الكلمات «بيا» و«وزينه» |
| adb8694 | 40:13: «يري كم» ← «يريكم» و«وينزل» ← «و ينزل». و25:50: رمز ¨. وأُزيلت حروف خفية من 9 آيات ومسافات من نص القراءة |

**الوضع الحالي، وتضمنه الاختبارات:**
- الصيغ العثمانية الثلاث متطابقة في كل الآيات.
- لا حروف خفية ولا مسافات زائدة.
- قائمة الكلمات تطابق كلمات الآيات تماماً.
- قيم الكلمات المخزنة صحيحة.

**ملاحظة:** الآية 9:129 مشكولة بأسلوب مختلف قليلاً (فيها حرف تطويل). هذا ليس خطأً وتُرك كما هو.

### 4.5 كيف تصل البيانات إلى كل مكان

- **الواجهة:** `npm run dev` و`npm run build` يشغّلان `prepare-data.mjs`، فيُكتب `frontend/public/data/{swar,ayat,words}.json`. بعدها يحمّلها `services/data.js` مرة واحدة.
- **الاختبارات:** تقرأ `data/*.js` مباشرة.
- **التعديل:** أي تصحيح للبيانات يكون في `data/` فقط، ثم أعد البناء.

**ملفات حُذفت عمداً (موجودة في تاريخ git):** صفحات PhsQuran القديمة (`legacy/`)، والخادم الأول (`backend/`)، وأداة توليد الأيقونات (`tools/generate-icons.mjs`). آخر commit يحتويها: `141efdb`. استرجع أي ملف منها بـ `git show 141efdb:<المسار>`.

---

## 5. طبقة الحساب `packages/core`

دوال نقية تأخذ البيانات معاملاً، وتعمل في المتصفح وNode.

| الملف | أهم ما فيه |
|---|---|
| `letters.js` | `BASE_LETTERS`, `SUPPORTED_CHARS`, `CHARS_INDEX`, `JUMMAL/ABJAD/AYQAGH_VALUES`, `cleanArabicText`, `calculateText`, `calculateWords`, `calculateTriple` |
| `tables.js` | `tablesData` (35 جدولاً × 28 قيمة) |
| `wefq.js` | `WEFEQ_BASES`, `generateWefeq`, `studyWefeqNumber`, `triangleFraction`, `buildWefeqInfoRows`, `wefeqCellClass` |
| `text-stats.js` | `computeTextStats` (إحصاءات أحرف النص) |
| `word-search.js` | `findWordsByValue` (رقم ← كلمات القرآن) |
| `number-study.js` | `studyNumber` (الجوهر، القواسم، الأولية، فيبوناتشي...)، `decompositionCounts` |
| `quran-analysis.js` | `analyzeSurahCharacters`, `analyzeAyahCharacters` (دراسة سورة/آية)، `symmetricChapters`, `symmetricWords`, `searchAyat` |
| `quran-stats.js` | `letterProfile`, `chapterStats`, `letterStats`, `studyLetter`, `mirrorIndex`, `symmetricVerses` |
| `data-file.js` | `parseDataFile`, `DATA_FILES` |

### 5.1 الأوفاق

طريقة واحدة لكل الأشكال السبعة:
1. `الفرق = الرقم − الثابت السحري`.
2. `كل خانة = قيمتها في النموذج + floor(الفرق ÷ n)`.
3. جبر الكسر (باقي القسمة) يُضاف إلى الأرقام من n²−n+1 إلى n².

**النماذج في `WEFEQ_BASES`:**
- **من 4×4 إلى 9×9:** بُنيت بحيث تقع الأرقام الأخيرة مرة واحدة في كل صف وعمود وقطر، فيكون الوفق كاملاً لكل رقم.
  - 5×5 و7×7 و8×8 و9×9: من مربعات لاتينية قطرية متعامدة.
  - 6×6: من بحث رقمي.
- **المثلث 3×3:** كامل عندما يقبل الرقم القسمة على 3. وإلا ينقص قطره الثاني بمقدار الكسر، وهذا قيد رياضي لا خطأ.

**الثوابت (وهي الحدود الدنيا):** 15، 34، 65، 111، 175، 260، 369.

### 5.2 تطابق الآيات (تعريف أكّده صاحب المشروع)

- آيات السورة على دائرة، وآية المحور وحدها.
- ثم الأزواج: (المحور+k مع المحور−k)، مع الالتفاف حول السورة.
- إن كان عدد الآيات زوجياً فالآية المقابلة للمحور وحدها.
- لكل زوج مجموع الكلمات ومجموع الحروف.
- **المنطق نفسه في تطابق السور:** `mirrorIndex(start, i, total)`.

### 5.3 دراسة سورة وآية

- **دراسة سورة:** الرقم، وترتيب التنزيل، ومكية/مدنية، والحرف الأول والأخير، والآيات والكلمات والحروف، والحروف المستخدمة بتكرارها، وغير المستخدمة.
- **دراسة آية:** ما سبق، إضافة إلى ترتيبها في السورة وفي القرآن، وملخص سورتها.
- **الأصل:** مطابقة لصفحات PhsQuran القديمة (1201 و1202)، ويقارن اختبارٌ السور الـ 114 كلها بملفاتها.
- **خطأ قديم في PhsQuran:** حقلا «آيات فيها الحرف» و«آيات ليس فيها الحرف» كانا معكوسين. الأسماء الحالية `versesWith` و`versesWithout` صحيحة.

---

## 6. الواجهة

### 6.1 أساسيات

- **التوجيه:** `HashRouter` و`base: './'`، فيعمل في مجلد فرعي على الاستضافة وداخل exe دون إعداد خادم.
- **الحساب محلياً:** `services/api.js` يجيب مسارات `/api/...` القديمة داخل المتصفح من core والبيانات. المكونات تستدعي `apiGet(path)` أو `useApiData(path)`.
- **الخطوط:** محلية عبر `@fontsource` (Tajawal للعربية، Inter وOutfit للاتينية). لا خطوط من Google لأن البرنامج يعمل دون إنترنت.
- **النمط:** في `services/theme.js`. السمة `data-theme` على `:root`، والمتغيرات في `index.css`.
- **العمل دون إنترنت:** `vite-plugin-pwa` يحفظ كل الملفات (نحو 9 ميغابايت). التسجيل في `services/offline.js` على http(s) فقط، فلا يُسجَّل داخل exe.
- **الترجمة:** كل نص في `locales/ar.json` و`en.json`، ومفاتيح اللغتين متطابقة.
- **الرسوم:** recharts مع `isAnimationActive={false}` في الرسوم الجديدة. الرسم الدائري (Pie) لا يُرسم في هذه النسخة، فاستُبدل بأعمدة.

### 6.2 الصفحات (`#/workspace/...`)

| المسار | المكون | المجموعة |
|---|---|---|
| (فارغ) | DashboardStats + SurahAnalytics | لوحة البداية و«سور القرآن» |
| `unified` | tools/UnifiedPlatform | أدوات الجمّل |
| `jummal` | tools/JummalCalculator | أدوات الجمّل |
| `tables` | tools/CustomTables | أدوات الجمّل |
| `wefq` | tools/WefqWorld | أدوات الجمّل |
| `number-search` | tools/NumberSearch | أدوات الجمّل |
| `number-study` | tools/NumberStudy | أدوات الجمّل |
| `symmetric-chapters` | SymmetricChapters | الدراسات |
| `symmetric-verses` | SymmetricVerses | الدراسات |
| `symmetric-words` | SymmetricWords | الدراسات |
| `study-chapter` | StudyChapter | الدراسات |
| `study-verse` | StudyVerse | الدراسات |
| `study-char` | StudyCharacter | الدراسات |
| `chars-per-chapter` | CharsPerChapter | الإحصائيات |
| `stats-chars` | LetterStats | الإحصائيات |
| `charts` | SymmetryCircle (دائرة تناظر السور) | الإحصائيات |
| `quran-chars` | QuranCharsChart | الإحصائيات |
| `chapter-verses` | ChapterVersesChart | الإحصائيات |

**مكونات مشتركة:**
- `NumberValue`: رقم بقائمة خيارات (دراسة الرقم، الأوفاق، البحث) تفتح في تبويب جديد، والرقم في الرابط `?n=`.
- `TextStats`: إحصاءات أحرف النص.
- `AyatPicker`: اختيار آية بالضغط على F9.
- `WefqView` و`WordSearchTable`.
- `stats/StudyDetails` و`stats/LineByChapter`.

**السجل:** يُحفظ في `localStorage` بالمفتاحين `gematria_history_triple_v2` و`calculate_tables_history`.

---

## 7. واجهة برمجية لاحقاً (غير موجودة حالياً)

حُذف الخادم الأول للإبقاء على ما يلزم للتشغيل فقط. عند إضافته لاحقاً لمن يريد:

- **مكانه:** حزمة جديدة `backend/` تُضاف إلى `workspaces` في `package.json` الجذر. هو اختياري للتطبيقات الخارجية، ولا يُنشر على cPanel ولا يحتاجه الموقع أو exe.
- **الحساب:** يستورد `@jummal/core` نفسه، ويقرأ `data/*.js` بـ `parseDataFile`، دون أي حساب خاص به.
- **المسارات:** يكرر مسارات `frontend/src/services/api.js` نفسها، فتطابق نتائجه المتصفح.
- **نقطة بداية:** `git show 141efdb:backend/index.js` (Express 5، المنفذ 3000). كانت مساراته تحت `/api`:

`/ping`, `/swar`, `/swar/:id`, `/swar/:id/ayat`, `/ayat?surah=`, `/ayat/search?q=`, `/ayat/:id`, `/qwords`, `/qwords/:id`, `/analysis/characters/surah/:id`, `/analysis/characters/ayah/:id`, `/analysis/symmetric-chapters/:id`, `/analysis/symmetric-words?word1&word2&tashkil`, `/analysis/symmetric-verses/:surah/:start`, `/analysis/letter?char=`, `/stats/chapters`, `/stats/letters`, `/jummal?text=`, `/tables`, `/tables/calculate?text&tables=0,1,2`, `/wefq/:shape/:number`, `/number/:number`, `/words/search?value&types=jummal,abjad`

**ملاحظة:** هذه المسارات موجودة الآن داخل المتصفح في `services/api.js`، والخادم المستقبلي يعرضها بالشكل نفسه.

---

## 8. برنامج سطح المكتب (`desktop/`)

- **طريقة العمل:** `main.cjs` يعرض `frontend/dist` من داخل البرنامج عبر البروتوكول `app://jummal/`، دون خادم ودون إنترنت.
- **الروابط:** روابط البرنامج الداخلية تفتح نوافذ جديدة، والروابط الخارجية تفتح في المتصفح.
- **الإعداد:** `electron` مثبّت على إصدار دقيق (`45.4.1`)، لأن electron-builder يرفض النطاقات.
- **الناتج:** `desktop/release/Quran-Numerical-Studies-<الإصدار>-portable.exe` (نحو 112 ميغابايت، لأنه يحمل Chromium معه).

**مشكلة معروفة:** إن ظهر «Lock file is already being held» أو تعذّر حذف `desktop/release`، فالسبب غالباً أن المجلد مفتوح في مستكشف الملفات. أغلقه وأعد المحاولة.

---

## 9. الأوامر

```bash
npm install            # مرة واحدة
npm run dev            # تطوير الواجهة (http://localhost:5173)
npm test               # اختبارات الحسابات والبيانات
npm run build          # بناء الموقع في frontend/dist
npm run preview        # معاينة البناء
npm run desktop        # تشغيل برنامج سطح المكتب
npm run build:exe      # بناء ملف exe محمول
npm run package:cpanel # حزمة zip للرفع على cPanel في release/
```

---

## 10. الاختبارات

ملف واحد: `packages/core/test/core.test.js`. أي حساب جديد يحتاج اختباراً. ما يغطيه حالياً:
- **قيم معروفة:** البسملة = 786، و«قل هو الله أحد» = 220، و«محمد علي» = 202.
- **الأوفاق:** كل الأشكال على 1,500 رقم. الأشكال من 4×4 كاملة، والمثلث كامل عند القسمة على 3.
- **دراسة الرقم:** مطابقة للكود القديم من 1 إلى 3,000.
- **إحصاءات الحروف والسور ودراسة السورة:** مطابقة لملفات PhsQuran القديمة. الفرق الوحيد غين الآية 3:19.
- **سلامة البيانات:**
  - العدد: 6,236 آية، و114 سورة، و13,152 كلمة.
  - قيم الكلمات المخزنة صحيحة.
  - الصيغ العثمانية الثلاث متطابقة.
  - لا حروف خفية ولا مسافات زائدة.
- **تطابق الآيات:** الفاتحة والإخلاص، ويتأكد في البقرة أن كل آية تظهر مرة واحدة.
- **الحد الأدنى للمثلث:** 15، مع صحة جبر الكسر.

---

## 11. النشر

### 11.1 الآلي (GitHub Actions)

الدفع إلى `main` يشغّل `.github/workflows/deploy.yml`، وفيه مهمتان:
1. **`site` (Ubuntu):** `npm ci` ثم `npm test` ثم `npm run build`، ثم رفع `frontend/dist/` بـ FTP إلى `/public_html/quran.phsoft.me/` (المجلد الجذر لنطاق quran.phsoft.me). يجب أن يكون النطاق موجهاً إلى هذا المجلد في cPanel، وألا يكون مسجلاً تطبيقَ Node في Application Manager، لأن الموقع ملفات ثابتة.
   - **الأسرار المطلوبة:** `FTP_SERVER`، و`FTP_USERNAME`، و`FTP_PASSWORD`، و`FTP_PROTOCOL`.
2. **`desktop` (Windows):** يبني ملف exe ويحفظه artifact باسم `Quran-Numerical-Studies-windows` في صفحة التشغيل (يبقى 30 يوماً).

⚠️ **الحالة في 2026-11-20:** كان الـ workflow معطلاً يدوياً في GitHub (`disabled_manually`)، فلم يعمل أي نشر آلي. لتفعيله: Actions ← Build and Deploy ← Enable workflow، ثم Run workflow. وتأكد من وجود أسرار FTP في Settings ← Secrets and variables ← Actions.

المستودع: https://github.com/h-phsoft/jummal، والفرع `merge-phsquran` مطابق لـ `main` حالياً.

### 11.2 اليدوي (حزمة cPanel)

```bash
npm run package:cpanel
```

أو بنقرة مزدوجة على **`package-cpanel.bat`** في جذر المشروع. يثبّت المكتبات أول مرة، ويختبر، ويبني الحزمة، ثم يفتح مجلد `release`.

1. يُنتج `release/quran-numerical-studies-cpanel-<الإصدار>-<التاريخ>.zip` (نحو 2 ميغابايت، 59 ملفاً).
2. في cPanel: مدير الملفات ← مجلد الموقع ← رفع الملف ← Extract.
3. الحزمة تتضمن `.htaccess`: الضغط، وأنواع الملفات، ومنع العرض المؤقت (cache) لـ `index.html` و`sw.js`، والعرض المؤقت الطويل لـ `assets/`.

### 11.3 بعد أول نشر للنسخة الجديدة (يدوياً، مرة واحدة)

احذف من السيرفر ملفات «جمّل» القديمة، لأن النشر لا يحذفها:
- الصفحات: `jummal.html`، `combined.html`، `calculate-tables.html`، `awfaq-shamil.html`، `search.html`، `number-study.html`
- المجلدات الفرعية القديمة فقط: `assets/js/`، `assets/css/`، `assets/vendors/`.

⚠️ **لا تحذف مجلد `assets/` نفسه:** البناء الجديد يضع ملفاته مباشرة داخله، دون مجلدات فرعية. إن حذفته بالخطأ، أعد النشر أو ارفع حزمة cPanel من جديد.

---

## 12. ملاحظات وأمور معروفة

- **تحذيرات lint قديمة في كود PhsQuran:** مثل `set-state-in-effect`، و`t` غير مستخدم في `Workspace`، و`Date` في التذييل. ليست أخطاء.
- **لوحة المتصفح المدمجة في بيئة التطوير:** لا تدعم Service Worker، ولا تُشغّل حركة الرسوم وهي مخفية. اختبر العمل دون إنترنت والرسوم في Chromium حقيقي، مثل Electron من `node_modules/electron/dist/electron.exe`.
- **npm 11 يحظر سكربتات التثبيت افتراضياً:** Electron 45 لا يحتاجها، فينزل ملفه عند أول استخدام أو عبر `node node_modules/electron/install.js`. السكربت المحظور الوحيد `electron-winstaller`، وهو غير مطلوب للنسخة المحمولة.
- **الآية 40:13:** صُححت. كانت الآية الوحيدة المختلفة بين الصيغ.
- **شجرة دراسة الرقم:** تُرسم كاملة حتى 1,023 عقدة، أي للأرقام حتى 512. فوق ذلك يظهر التحليل المجمّع فقط، حتى لا تتجمد الصفحة.

---

## 13. اقتراحات للتطوير لاحقاً

- رسوم إضافية في «مخططات بيانية»، مثل توزيع الحروف حسب مكية/مدنية.
- تصدير النتائج صورة أو PDF، كما كانت دائرة التناظر تفعل.
- شاشة إعدادات للبيانات، مثل اختيار قاعدة الهمزة. تحتاج قرار صاحب المشروع أولاً.
- برنامج تثبيت (NSIS) إضافة إلى النسخة المحمولة: `electron-builder --win nsis`.
- توقيع ملف exe رقمياً، لتجنب تحذير Windows SmartScreen.

---

## 14. قائمة عند إضافة ميزة جديدة

1. **الحساب:** في `packages/core/src` دالةً نقية، مع اختبار في `core.test.js`، ثم `npm test`.
2. **المسار:** في `frontend/src/services/api.js` إن كانت تحتاج بيانات (وفي الخادم إن أُضيف لاحقاً).
3. **الصفحة:** مكون React في `components/` أو `tools/`، ومسار في `pages/Workspace.jsx`، وعنصر في `components/Sidebar.jsx`.
4. **النصوص:** في `locales/ar.json` و`en.json`. لا تكتب نصاً ظاهراً مباشرة في الكود.
5. **التنسيق:** مسافتان للإزاحة دون tabs، وأقواس `{}` دائماً حول `if/else/for/while`.
6. **التحقق:** `npm run build`، ثم تأكد في المتصفح بالنمطين واللغتين.
7. **الحفظ:** commit على فرع، ثم دمج مع `main` حين تكون جاهزاً للنشر.
