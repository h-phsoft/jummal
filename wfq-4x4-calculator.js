/**
 * حسابات المربع السحري 4x4 (WFQ-4x4)
 * 
 * @param {number[][]} grid - مصفوفة 4x4 تحتوي على القيم
 * @returns {Object} - كائن يحتوي على جميع النتائج الحسابية
 */
function calculateWFQ4x4(grid) {
    // التحقق من أن المصفوفة 4x4
    if (!grid || grid.length !== 4 || grid.some(row => row.length !== 4)) {
        throw new Error("يجب أن تكون المصفوفة 4x4");
    }

    // تسطيح المصفوفة للحصول على جميع القيم
    const allValues = grid.flat();
    
    // خانات الضلع = عدد الخانات في كل ضلع
    const khanatAlDila = 4;

    // الوفق = مجموع القيم في خانات الضلع (مجموع الصف الأول)
    const wafq = grid[0].reduce((a, b) => a + b, 0);

    // المفتاح = أصغر قيمة
    const miftah = Math.min(...allValues);

    // المغلاق = أكبر قيمة
    const mighlaq = Math.max(...allValues);

    // العدل = المفتاح والمغلاق
    const adl = [miftah, mighlaq];

    // الأس = قيمة الوفق منقوصًا منها عدد خانات الضلع
    const uss = wafq - khanatAlDila;

    // المساحة = مجموعة قيم الخانات كلها
    const masaha = allValues.reduce((sum, val) => sum + val, 0);

    // الضابط = مجموعة الوفق مع المساحة
    const dabt = wafq + masaha;

    // الغاية = ضعف قيمة الضابط
    const ghaya = 2 * dabt;

    // الأصل = حاصل ضرب الغاية في المغلاق
    const asl = ghaya * mighlaq;

    // جبر الكسر = التحقق مما إذا كانت هناك كسور (في هذا السياق، جميع القيم أعداد صحيحة)
    const hasFractions = allValues.some(val => !Number.isInteger(val));
    const jabrAlKasr = hasFractions ? "يحتاج إلى جبر" : "لا يحتاج";

    return {
        grid: grid,
        khanatAlDila,       // خانات الضلع
        wafq,               // الوفق
        miftah,             // المفتاح
        mighlaq,            // المغلاق
        adl,                // العدل
        uss,                // الأس
        masaha,             // المساحة
        dabt,               // الضابط
        ghaya,              // الغاية
        asl,                // الأصل
        jabrAlKasr          // جبر الكسر
    };
}

// المثال المطلوب
const wfq4x4 = [
    [16, 3, 2, 13],
    [5, 10, 11, 8],
    [9, 7, 6, 12],
    [4, 15, 14, 1]
];

// حساب النتائج
const results = calculateWFQ4x4(wfq4x4);

// عرض النتائج
console.log("=== نتائج حسابات المربع السحري 4x4 ===");
console.log(`خانات الضلع: ${results.khanatAlDila}`);
console.log(`الوفق: ${results.wafq}`);
console.log(`المفتاح: ${results.miftah}`);
console.log(`المغلاق: ${results.mighlaq}`);
console.log(`العدل: [${results.adl[0]}, ${results.adl[1]}]`);
console.log(`الأس: ${results.uss}`);
console.log(`المساحة: ${results.masaha}`);
console.log(`الضابط: ${results.dabt}`);
console.log(`الغاية: ${results.ghaya}`);
console.log(`الأصل: ${results.asl}`);
console.log(`جبر الكسر: ${results.jabrAlKasr}`);

// تصدير الدالة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateWFQ4x4 };
}
