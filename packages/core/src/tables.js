// === بيانات جداول الحساب ===

import {JUMMAL_VALUES, ABJAD_VALUES, AYQAGH_VALUES} from "./letters.js";

// مصفوفة الجداول - كل جدول يحتوي على الاسم وقيم (28 قيمة)
export const tablesData = [
  {name: 'الجمل', group: "ثلاثي", values: JUMMAL_VALUES},
  {name: 'الأبجد', group: "ثلاثي", values: ABJAD_VALUES},
  {name: 'الأيقغ', group: "ثلاثي", values: AYQAGH_VALUES},
  {name: 'طبائع 4', group: "طبائع", values: [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]},
  {name: 'طبائع 7', group: "طبائع", values: [1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7]}
];
