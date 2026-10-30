async function performNumberStudy() {
  const targetNum = parseInt(document.getElementById('studyNumber').value);
  const resultContainer = document.querySelector('#number-Study-Result');

  if (isNaN(targetNum) || targetNum < 1) {
    alert('الرجاء إدخال رقم صحيح وموجب أكبر من الصفر');
    return;
  }

  try {
    const steps = getDigitalRootSteps(targetNum);
    const digitalRootStr = steps.join(' ⟵ ');
    
    const sum1toN = (targetNum * (targetNum + 1)) / 2;
    const nSquared = targetNum * targetNum;
    const sum1toNSquared = (nSquared * (nSquared + 1)) / 2;
    
    const divisors = getDivisors(targetNum);
    const sumDivisors = divisors.reduce((a, b) => a + b, 0);
    
    const primeFactors = getPrimeFactors(targetNum);
    const primeFactorsStr = primeFactors.length > 0 ? primeFactors.join(' × ') : 'لا يوجد';
    
    const isPrm = isPrime(targetNum);
    const primeRank = isPrm ? getPrimeRank(targetNum) : 'ليس عدداً أولياً';
    
    const palindrome = isPalindrome(targetNum) ? 'نعم' : 'لا';
    
    const fibRank = getFibonacciRank(targetNum);
    const fibStr = fibRank ? `نعم (ترتيبه ${fibRank})` : 'لا';
    
    const oddEven = getOddEvenRank(targetNum);

    let html = `
      <style>
        .study-results-table tbody th { text-align: left; vertical-align: middle; }
        .study-results-table tbody td { text-align: right; vertical-align: middle; }
        
        .number-tree-container {
          overflow-x: auto;
          padding: 10px 0;
          direction: ltr;
          text-align: center;
        }
        .number-tree {
          display: inline-block;
          text-align: left;
        }
        .number-tree ul {
          padding-top: 20px;
          position: relative;
          display: flex;
          justify-content: center;
          padding-inline-start: 0;
          margin: 0;
        }
        .number-tree li {
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 4px 0 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .number-tree li::before, .number-tree li::after {
          content: '';
          position: absolute;
          top: 0;
          width: 50%;
          height: 20px;
          border-top: 2px solid #000;
        }
        .number-tree li::before {
          right: 50%;
          border-right: 2px solid #000;
          margin-right: -1px;
        }
        .number-tree li::after {
          left: 50%;
        }
        .number-tree li:first-child::before {
          border-top: none;
        }
        .number-tree li:last-child::after {
          border-top: none;
        }
        .number-tree li:only-child::before, .number-tree li:only-child::after {
          display: none;
        }
        .number-tree li:only-child {
          padding-top: 0;
        }
        .number-tree ul ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 2px solid #000;
          width: 0;
          height: 20px;
          margin-left: -1px;
        }
        .number-tree .node-box {
          border: 2px solid #000;
          padding: 5px 15px;
          font-size: 16px;
          font-weight: bold;
          background-color: #fff;
          min-width: 45px;
          z-index: 1;
        }
      </style>
      <div class="table-responsive">
        <table class="table table-bordered table-hover bg-white study-results-table" style="direction: rtl;">
          <thead class="table-light">
            <tr>
              <th colspan="2" class="text-center h5 text-primary" style="text-align: center !important;">نتائج دراسة الرقم ${targetNum}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th width="35%">الجوهر</th>
              <td>${digitalRootStr}</td>
            </tr>
            <tr>
              <th>المجموع التراكمي (محتويات العدد)</th>
              <td>${sum1toN.toLocaleString('en-US')} <small class="text-muted">(مجموع الأعداد من 1 إلى ${targetNum})</small></td>
            </tr>
            <tr>
              <th>محتويات مربع العدد (${nSquared.toLocaleString('en-US')})</th>
              <td>${sum1toNSquared.toLocaleString('en-US')} <small class="text-muted">(مجموع الأعداد من 1 إلى ${nSquared.toLocaleString('en-US')})</small></td>
            </tr>
            <tr>
              <th>التناظر</th>
              <td>${palindrome}</td>
            </tr>
            <tr>
              <th>هل العدد أولي؟</th>
              <td>${isPrm ? '<span class="badge bg-success">نعم</span>' : '<span class="badge bg-danger">لا</span>'}</td>
            </tr>
            ${isPrm ? `
            <tr>
              <th>ترتيبه بين الأعداد الأولية</th>
              <td>الترتيب ${primeRank}</td>
            </tr>
            <tr>
              <th>ترتيبه بين الأعداد الأولية ذات نفس الآحاد</th>
              <td>الترتيب ${getPrimeRankSameOnes(targetNum)}</td>
            </tr>` : ''}
            <tr>
              <th>العوامل الأولية</th>
              <td style="direction: ltr; text-align: right;">${primeFactorsStr}</td>
            </tr>
            <tr>
              <th>القواسم</th>
              <td>
                <div style="word-wrap: break-word; max-width: 100%; direction: ltr; text-align: right;">${divisors.join(' ، ')}</div>
                <div class="mt-1" style="text-align: right;">
                  <small class="text-muted">عددها: ${divisors.length} | مجموعها: ${sumDivisors.toLocaleString('en-US')}</small>
                </div>
              </td>
            </tr>
            <tr>
              <th>ترتيبه ضمن الأعداد الـ ${oddEven.type}ة</th>
              <td>الترتيب ${oddEven.rank.toLocaleString('en-US')}</td>
            </tr>
            <tr>
              <th>في سلسلة فيبوناتشي؟</th>
              <td>${fibStr}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    
    let treeHtml = `
      <div class="card mt-4">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 class="mb-0 text-primary fw-bold">تحليل العدد (الشجرة)</h5>
          <div>
            <button class="btn btn-sm btn-outline-secondary" onclick="zoomTree(0.1)" title="تكبير"><i class="bi bi-zoom-in"></i> تكبير</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="resetZoom()" title="الوضع الافتراضي">إعادة تعيين</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="zoomTree(-0.1)" title="تصغير"><i class="bi bi-zoom-out"></i> تصغير</button>
          </div>
        </div>
        <div class="card-body" style="overflow: hidden;">
          <div style="overflow-x: auto; overflow-y: hidden;">
             ${generateDecompositionTree(targetNum)}
          </div>
        </div>
      </div>
    `;
    
    resultContainer.innerHTML = html;
    document.getElementById('number-Study-Tree').innerHTML = treeHtml;
  } catch (error) {
    resultContainer.innerHTML = `<div class="alert alert-danger">خطأ: ${error.message}</div>`;
  }
}

// Helper Functions
function getDigitalRootSteps(n) {
    let steps = [n];
    let current = Math.abs(n);
    while (current > 9) {
        current = String(current).split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        steps.push(current);
    }
    return steps;
}

function getDivisors(n) {
    let divisors = [];
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) divisors.push(i);
    }
    return divisors;
}

function getPrimeFactors(n) {
    let factors = [];
    let d = 2;
    let curr = n;
    while (curr > 1) {
        while (curr % d === 0) {
            factors.push(d);
            curr /= d;
        }
        d++;
        if (d * d > curr) {
            if (curr > 1) factors.push(curr);
            break;
        }
    }
    return factors;
}

function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}

function getPrimeRank(n) {
    if (!isPrime(n)) return null;
    let rank = 0;
    for (let i = 2; i <= n; i++) {
        if (isPrime(i)) rank++;
    }
    return rank;
}

function getPrimeRankSameOnes(n) {
    if (!isPrime(n)) return null;
    let rank = 0;
    let onesDigit = n % 10;
    for (let i = 2; i <= n; i++) {
        if (isPrime(i) && (i % 10) === onesDigit) rank++;
    }
    return rank;
}

function isPalindrome(n) {
    const str = String(n);
    return str === str.split('').reverse().join('');
}

function getFibonacciRank(n) {
    if (n < 0) return null;
    if (n === 0) return 0;
    let a = 1, b = 1;
    let index = 1;
    if (n === 1) return "1 أو 2"; 
    while (b < n) {
        let temp = b;
        b = a + b;
        a = temp;
        index++;
    }
    return b === n ? index + 1 : null;
}

function getOddEvenRank(n) {
    if (n % 2 === 0) {
        return { type: 'زوجي', rank: n / 2 };
    } else {
        return { type: 'فردي', rank: (n + 1) / 2 };
    }
}

$('#studyNumber').on('keypress', function (e) {
  if (e.which === 13) {
    performNumberStudy();
  }
});

function generateDecompositionTree(n) {
    if (n <= 0) return '';
    
    function buildNode(val) {
        let html = `<li><div class="node-box">${val}</div>`;
        if (val > 1) {
            let left = Math.floor(val / 2);
            let right = Math.ceil(val / 2);
            html += `<ul>${buildNode(left)}${buildNode(right)}</ul>`;
        }
        html += `</li>`;
        return html;
    }
    
    // Reset zoom state on new render
    currentZoom = 1; 
    return `
      <div class="number-tree-container" dir="ltr">
        <div id="decomposition-tree-wrapper" style="display: inline-block; transform-origin: top center; transition: all 0.2s ease;">
          <div class="number-tree">
            <ul>${buildNode(n)}</ul>
          </div>
        </div>
      </div>
    `;
}

// Zoom functionality
let currentZoom = 1;
function zoomTree(step) {
    const tree = document.getElementById('decomposition-tree-wrapper');
    if (tree) {
        currentZoom += step;
        // Restrict zoom limits
        if (currentZoom < 0.2) currentZoom = 0.2;
        if (currentZoom > 3) currentZoom = 3;
        
        if (CSS.supports('zoom', '1')) {
            tree.style.zoom = currentZoom;
        } else {
            tree.style.transform = `scale(${currentZoom})`;
        }
    }
}

function resetZoom() {
    currentZoom = 1;
    const tree = document.getElementById('decomposition-tree-wrapper');
    if (tree) {
        if (CSS.supports('zoom', '1')) {
            tree.style.zoom = currentZoom;
        } else {
            tree.style.transform = `scale(1)`;
        }
    }
}
