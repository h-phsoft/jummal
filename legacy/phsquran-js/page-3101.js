/* global jaChapters */

class CircleWords {
  constructor(canvas, words, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.words = words.slice();
    this.startIndex = options.startIndex || 0;
    this.hoveredIndex = -1;
    this.offsetAngle = -Math.PI / 2;
    this.axisShorten = 32;
    this.axisColor = options.axisColor || "#1976d2";
    this.mirrorColor = options.mirrorColor || "#e67e22";
    this.bgColor = options.bgColor || "#f7f7f7";
    this.bgTransparent = options.bgTransparent || false;
    this.fontSize = options.fontSize || 16;
    this.fixedMirrors = new Set();
    this.radius = options.radius || Math.floor((options.size || 700) / 2) - 50;
    this.setCanvasSize(options.size || 700);
    this.setupEvents();
    this.draw();
  }

  setCanvasSize(size) {
    this.size = size;
    this.canvas.width = size;
    this.canvas.height = size;
    this.cx = size / 2;
    this.cy = size / 2;
    const maxRadius = Math.floor(this.size / 2) - 50;
    if (this.radius > maxRadius) {
      this.radius = maxRadius;
    }
    document.getElementById('radiusInput').max = maxRadius;
    document.getElementById('radiusInput').value = this.radius;
    this.draw();
  }

  setStartIndex(idx) {
    this.startIndex = ((idx % this.words.length) + this.words.length) % this.words.length;
    this.fixedMirrors.clear();
    this.draw();
  }

  setRadius(r) {
    const maxR = Math.floor(this.size / 2) - 50;
    this.radius = Math.max(100, Math.min(maxR, r));
    document.getElementById('radiusInput').value = this.radius;
    this.draw();
  }

  setAxisColor(color) {
    this.axisColor = color;
    this.draw();
  }

  setMirrorColor(color) {
    this.mirrorColor = color;
    this.draw();
  }

  setBgColor(color) {
    this.bgColor = color;
    this.draw();
  }

  setBgTransparent(val) {
    this.bgTransparent = val;
    this.draw();
  }

  getWordPosition(index, total, r) {
    if (index === this.startIndex) {
      return {
        x: this.cx,
        y: this.cy - r,
        angle: -Math.PI / 2
      };
    }
    if (index === this.getOppositeIndex(this.startIndex)) {
      return {
        x: this.cx,
        y: this.cy + r,
        angle: Math.PI / 2
      };
    }
    const rest = total - 2;
    let posIdx = index - this.startIndex;
    if (posIdx < 0)
      posIdx += total;
    if (posIdx > total / 2)
      posIdx -= 1;
    else if (posIdx > 0)
      posIdx -= 1;
    const angle = (-Math.PI / 2) + ((posIdx + 1) * (2 * Math.PI / total));
    return {
      x: this.cx + r * Math.cos(angle),
      y: this.cy + r * Math.sin(angle),
      angle: angle
    };
  }

  getOppositeIndex(index) {
    if (index === -1)
      return -1;
    return (index + Math.floor(this.words.length / 2)) % this.words.length;
  }

  getMirrorIndex(i) {
    let mirror = (2 * this.startIndex - i) % this.words.length;
    if (mirror < 0)
      mirror += this.words.length;
    return mirror;
  }

  getHoveredWordIndex(mx, my) {
    for (let i = 0; i < this.words.length; i++) {
      const pos = this.getWordPosition(i, this.words.length, this.radius);
      const dx = mx - pos.x;
      const dy = my - pos.y;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 15) {
        return i;
      }
    }
    return -1;
  }

  drawVerticalAxis() {
    this.ctx.save();
    this.ctx.strokeStyle = this.axisColor;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(this.cx, this.cy - this.radius + this.axisShorten);
    this.ctx.lineTo(this.cx, this.cy + this.radius - this.axisShorten);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawMirrorLine(idx1, idx2, color = null) {
    if (idx1 === -1 || idx2 === -1)
      return;
    const shorten = 28;
    const pos1 = this.getWordPosition(idx1, this.words.length, this.radius - shorten);
    const pos2 = this.getWordPosition(idx2, this.words.length, this.radius - shorten);

    this.ctx.save();
    this.ctx.strokeStyle = color || this.mirrorColor;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(pos1.x, pos1.y);
    this.ctx.lineTo(pos2.x, pos2.y);
    this.ctx.stroke();

    // حساب مجموع qnt لكلا الطرفين
    const sumQnt = this.words[idx1].qnt + this.words[idx2].qnt;
    // حساب منتصف الخط
    const midX = (pos1.x + pos2.x) / 2;
    const midY = (pos1.y + pos2.y) / 2;

    // رسم مجموع qnt في منتصف الخط
    this.ctx.font = `bold ${this.fontSize + 2}px Arial`;
    this.ctx.fillStyle = "#2e7d32"; // لون أخضر داكن (أو اختر اللون الذي تريده)
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(sumQnt, midX, midY);

    this.ctx.restore();
  }

  draw() {
    // رسم الخلفية (شفافة أو ملونة)
    if (!this.bgTransparent) {
      this.ctx.save();
      this.ctx.globalAlpha = 1.0;
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // رسم المحور العمودي أولاً (أقصر من القطر)
    this.drawVerticalAxis();

    // رسم خطوط التناظر المثبتة
    for (const idx of this.fixedMirrors) {
      const mirrorIdx = this.getMirrorIndex(idx);
      this.drawMirrorLine(idx, mirrorIdx, "#b71c1c");
    }

    // رسم خط التناظر المؤقت عند المرور فوق كلمة (إن لم تكن مثبتة)
    if (this.hoveredIndex !== -1 && !this.fixedMirrors.has(this.hoveredIndex)) {
      const mirrorIdx = this.getMirrorIndex(this.hoveredIndex);
      this.drawMirrorLine(this.hoveredIndex, mirrorIdx, this.mirrorColor);
    }

    // رسم الكلمات فوق كل شيء
    for (let i = 0; i < this.words.length; i++) {
      // تحديد ما إذا كانت الكلمة يجب أن تظهر معها qnt
      const showQnt = (this.fixedMirrors.has(i) || this.fixedMirrors.has(this.getMirrorIndex(i))) ||
        (this.hoveredIndex !== -1 &&
          (i === this.hoveredIndex || i === this.getMirrorIndex(this.hoveredIndex)) &&
          !this.fixedMirrors.has(this.hoveredIndex));

      // إذا أردنا عرض qnt، نرسم الكلمة على مسافة أبعد (مثلاً +20px)
      const r = showQnt ? this.radius + 20 : this.radius;

      const pos = this.getWordPosition(i, this.words.length, r);
      this.ctx.save();
      this.ctx.translate(pos.x, pos.y);
      this.ctx.rotate(pos.angle);

      if (i === this.startIndex || i === this.getOppositeIndex(this.startIndex)) {
        this.ctx.fillStyle = this.axisColor;
        this.ctx.font = `bold ${this.fontSize + 2}px Arial`;
      } else if (this.fixedMirrors.has(i) || this.fixedMirrors.has(this.getMirrorIndex(i))) {
        this.ctx.fillStyle = "#b71c1c";
        this.ctx.font = `bold ${this.fontSize + 2}px Arial`;
      } else if (
        this.hoveredIndex !== -1 &&
        (i === this.hoveredIndex || i === this.getMirrorIndex(this.hoveredIndex)) &&
        !this.fixedMirrors.has(this.hoveredIndex)
        ) {
        this.ctx.fillStyle = this.mirrorColor;
        this.ctx.font = `bold ${this.fontSize + 2}px Arial`;
      } else {
        this.ctx.fillStyle = '#333';
        this.ctx.font = `${this.fontSize}px Arial`;
      }

      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      if (showQnt) {
        this.ctx.fillText(this.words[i].qnt + " - " + this.words[i].name, 0, 0);
      } else {
        this.ctx.fillText(this.words[i].name, 0, 0);
      }

      this.ctx.restore();
    }
  }

  setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const idx = this.getHoveredWordIndex(mx, my);
      if (idx !== this.hoveredIndex) {
        this.hoveredIndex = idx;
        this.draw();
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const idx = this.getHoveredWordIndex(mx, my);
      if (idx !== -1) {
        if (this.fixedMirrors.has(idx)) {
          this.fixedMirrors.delete(idx);
        } else {
          this.fixedMirrors.add(idx);
        }
        this.draw();
      }
    });
  }
}

// مصفوفة كلمات ككائنات (كل عنصر لديه حقل name و qnt)
const words = new Array(114);
for (var i = 0; i < jaChapters.length; i++) {
  words[i] = {
    name: jaChapters[i]['CpName'],
    qnt: jaChapters[i]['Vs']
  };
}
/*
 const words = Array.from({length: 114}, (_, i) => ({
 name: `كلمة${i + 1}`,
 qnt: (i + 1) * 10
 }));
 */
// إنشاء الكائن لأول مرة
const canvas = document.getElementById('circleCanvas');
const circleWords = new CircleWords(
  canvas,
  words,
  {
    size: parseInt(document.getElementById('canvasSize').value),
    radius: parseInt(document.getElementById('radiusInput').value),
    fontSize: 16,
    startIndex: 0,
    axisColor: document.getElementById('axisColor').value,
    mirrorColor: document.getElementById('mirrorColor').value,
    bgColor: document.getElementById('bgColor').value,
    bgTransparent: document.getElementById('bgTransparent').checked
  }
);

// تحديث حجم الـcanvas وتحديث radiusInput تلقائيًا
function updateCanvasSize() {
  const newSize = parseInt(document.getElementById('canvasSize').value);
  circleWords.setCanvasSize(newSize);
}
document.getElementById('canvasSize').addEventListener('input', updateCanvasSize);

// زر تحميل صورة
function downloadCanvasImage() {
  const canvas = document.getElementById('circleCanvas');
  const link = document.createElement('a');
  link.download = 'circle_words.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
document.getElementById('downloadBtn').addEventListener('click', downloadCanvasImage);

document.getElementById('radiusInput').addEventListener('input', function () {
  circleWords.setRadius(parseInt(this.value));
});
document.getElementById('axisColor').addEventListener('input', function () {
  circleWords.setAxisColor(this.value);
});
document.getElementById('mirrorColor').addEventListener('input', function () {
  circleWords.setMirrorColor(this.value);
});
document.getElementById('bgColor').addEventListener('input', function () {
  circleWords.setBgColor(this.value);
});
document.getElementById('bgTransparent').addEventListener('change', function () {
  circleWords.setBgTransparent(this.checked);
});

document.getElementById('base-surah').addEventListener('change', function () {
  circleWords.setStartIndex(parseInt(document.getElementById('base-surah').value) - 1);
});
