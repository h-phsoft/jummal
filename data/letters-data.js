// جدول الحروف الـ 28 بالترتيب الأبجدي
// chSolar: شمسي (true) أو قمري (false)
// chNurani: نوراني، أي ورد في الحروف المقطعة أوائل السور (true)، أو غير نوراني (false)
// chNature: طبيعة الحرف (ناري، ترابي، هوائي، مائي) حسب جدول طبائع 4
const qLettersData = [
  {
    "chNo": 1,
    "chChar": "ا",
    "chName": "ألف",
    "chSolar": false,
    "chNurani": true,
    "chNature": "ناري"
  },
  {
    "chNo": 2,
    "chChar": "ب",
    "chName": "باء",
    "chSolar": false,
    "chNurani": false,
    "chNature": "ترابي"
  },
  {
    "chNo": 3,
    "chChar": "ج",
    "chName": "جيم",
    "chSolar": false,
    "chNurani": false,
    "chNature": "هوائي"
  },
  {
    "chNo": 4,
    "chChar": "د",
    "chName": "دال",
    "chSolar": true,
    "chNurani": false,
    "chNature": "مائي"
  },
  {
    "chNo": 5,
    "chChar": "ه",
    "chName": "هاء",
    "chSolar": false,
    "chNurani": true,
    "chNature": "ناري"
  },
  {
    "chNo": 6,
    "chChar": "و",
    "chName": "واو",
    "chSolar": false,
    "chNurani": false,
    "chNature": "ترابي"
  },
  {
    "chNo": 7,
    "chChar": "ز",
    "chName": "زاي",
    "chSolar": true,
    "chNurani": false,
    "chNature": "هوائي"
  },
  {
    "chNo": 8,
    "chChar": "ح",
    "chName": "حاء",
    "chSolar": false,
    "chNurani": true,
    "chNature": "مائي"
  },
  {
    "chNo": 9,
    "chChar": "ط",
    "chName": "طاء",
    "chSolar": true,
    "chNurani": true,
    "chNature": "ناري"
  },
  {
    "chNo": 10,
    "chChar": "ي",
    "chName": "ياء",
    "chSolar": false,
    "chNurani": true,
    "chNature": "ترابي"
  },
  {
    "chNo": 11,
    "chChar": "ك",
    "chName": "كاف",
    "chSolar": false,
    "chNurani": true,
    "chNature": "هوائي"
  },
  {
    "chNo": 12,
    "chChar": "ل",
    "chName": "لام",
    "chSolar": true,
    "chNurani": true,
    "chNature": "مائي"
  },
  {
    "chNo": 13,
    "chChar": "م",
    "chName": "ميم",
    "chSolar": false,
    "chNurani": true,
    "chNature": "ناري"
  },
  {
    "chNo": 14,
    "chChar": "ن",
    "chName": "نون",
    "chSolar": true,
    "chNurani": true,
    "chNature": "ترابي"
  },
  {
    "chNo": 15,
    "chChar": "س",
    "chName": "سين",
    "chSolar": true,
    "chNurani": true,
    "chNature": "هوائي"
  },
  {
    "chNo": 16,
    "chChar": "ع",
    "chName": "عين",
    "chSolar": false,
    "chNurani": true,
    "chNature": "مائي"
  },
  {
    "chNo": 17,
    "chChar": "ف",
    "chName": "فاء",
    "chSolar": false,
    "chNurani": false,
    "chNature": "ناري"
  },
  {
    "chNo": 18,
    "chChar": "ص",
    "chName": "صاد",
    "chSolar": true,
    "chNurani": true,
    "chNature": "ترابي"
  },
  {
    "chNo": 19,
    "chChar": "ق",
    "chName": "قاف",
    "chSolar": false,
    "chNurani": true,
    "chNature": "هوائي"
  },
  {
    "chNo": 20,
    "chChar": "ر",
    "chName": "راء",
    "chSolar": true,
    "chNurani": true,
    "chNature": "مائي"
  },
  {
    "chNo": 21,
    "chChar": "ش",
    "chName": "شين",
    "chSolar": true,
    "chNurani": false,
    "chNature": "ناري"
  },
  {
    "chNo": 22,
    "chChar": "ت",
    "chName": "تاء",
    "chSolar": true,
    "chNurani": false,
    "chNature": "ترابي"
  },
  {
    "chNo": 23,
    "chChar": "ث",
    "chName": "ثاء",
    "chSolar": true,
    "chNurani": false,
    "chNature": "هوائي"
  },
  {
    "chNo": 24,
    "chChar": "خ",
    "chName": "خاء",
    "chSolar": false,
    "chNurani": false,
    "chNature": "مائي"
  },
  {
    "chNo": 25,
    "chChar": "ذ",
    "chName": "ذال",
    "chSolar": true,
    "chNurani": false,
    "chNature": "ناري"
  },
  {
    "chNo": 26,
    "chChar": "ض",
    "chName": "ضاد",
    "chSolar": true,
    "chNurani": false,
    "chNature": "ترابي"
  },
  {
    "chNo": 27,
    "chChar": "ظ",
    "chName": "ظاء",
    "chSolar": true,
    "chNurani": false,
    "chNature": "هوائي"
  },
  {
    "chNo": 28,
    "chChar": "غ",
    "chName": "غين",
    "chSolar": false,
    "chNurani": false,
    "chNature": "مائي"
  }
];
