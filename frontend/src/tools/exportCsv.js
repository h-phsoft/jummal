// =====================================================
// تصدير جدول إلى ملف CSV يفتحه Excel بالعربية (UTF-8 مع BOM)
// بديل خفيف عن مكتبة SheetJS ويعمل دون إنترنت
// =====================================================
export function exportCsv(filename, headers, rows) {
  const escape = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [headers, ...rows].map(row => row.map(escape).join(','));
  const blob = new Blob(['﻿' + lines.join('\r\n')], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(String(text)).catch(() => {
    });
  }
}
