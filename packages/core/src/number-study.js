// =====================================================
// دراسة رقم: الجوهر، القواسم، العوامل الأولية، فيبوناتشي، الشجرة...
// =====================================================

// الجوهر: جمع الأرقام حتى رقم واحد
export function getDigitalRootSteps(n) {
  const steps = [n];
  let current = Math.abs(n);
  while (current > 9) {
    current = String(current).split('').reduce((a, b) => a + Number(b), 0);
    steps.push(current);
  }
  return steps;
}

// القواسم (حتى الجذر ثم المقابل، أسرع من المرور على كل الأرقام)
export function getDivisors(n) {
  const small = [];
  const large = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      small.push(i);
      if (i !== n / i) {
        large.unshift(n / i);
      }
    }
  }
  return small.concat(large);
}

export function getPrimeFactors(n) {
  const factors = [];
  let curr = n;
  for (let d = 2; d * d <= curr; d++) {
    while (curr % d === 0) {
      factors.push(d);
      curr /= d;
    }
  }
  if (curr > 1) {
    factors.push(curr);
  }
  return factors;
}

export function isPrime(n) {
  if (n <= 1) {
    return false;
  }
  if (n <= 3) {
    return true;
  }
  if (n % 2 === 0 || n % 3 === 0) {
    return false;
  }
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }
  return true;
}

// ترتيب العدد الأولي بين الأعداد الأولية (وبين ذات نفس الآحاد)
export function getPrimeRanks(n) {
  if (!isPrime(n)) {
    return null;
  }
  // غربال لسرعة الحساب مع الأعداد الكبيرة
  const sieve = new Uint8Array(n + 1);
  let rank = 0;
  let sameOnes = 0;
  const ones = n % 10;
  for (let i = 2; i <= n; i++) {
    if (sieve[i] === 0) {
      rank++;
      if (i % 10 === ones) {
        sameOnes++;
      }
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = 1;
      }
    }
  }
  return {rank: rank, sameOnes: sameOnes};
}

export function isPalindrome(n) {
  const str = String(n);
  return str === str.split('').reverse().join('');
}

// ترتيبه في سلسلة فيبوناتشي (1، 1، 2، 3، 5...) أو null
export function getFibonacciRank(n) {
  if (n === 1) {
    return '1 أو 2';
  }
  let a = 1;
  let b = 1;
  let index = 2;
  while (b < n) {
    const temp = b;
    b = a + b;
    a = temp;
    index++;
  }
  return b === n ? index : null;
}

export function getOddEvenRank(n) {
  if (n % 2 === 0) {
    return {type: 'زوجي', rank: n / 2};
  }
  return {type: 'فردي', rank: (n + 1) / 2};
}

export function isPerfectNumber(n) {
  if (n <= 1) {
    return false;
  }
  return getDivisors(n).reduce((a, b) => a + b, 0) - n === n;
}

// العدد ومقلوبه والنسبتان
export function getReverseAndRatios(n) {
  const reversed = parseInt(String(n).split('').reverse().join(''), 10);
  return {
    reversed: reversed,
    ratio: reversed !== 0 ? n / reversed : null,
    reverseRatio: n !== 0 ? reversed / n : null
  };
}

// تكرار كل قيمة في شجرة التحليل (n ← floor(n/2) و ceil(n/2) حتى 1)
// تُحسب بالتجميع دون بناء الشجرة، فتعمل مع الأرقام الكبيرة
export function decompositionCounts(n) {
  const counts = new Map([[n, 1]]);
  const queue = [n];
  const seen = new Set([n]);
  while (queue.length > 0) {
    queue.sort((a, b) => b - a);
    const val = queue.shift();
    const times = counts.get(val);
    if (val > 1) {
      [Math.floor(val / 2), Math.ceil(val / 2)].forEach(child => {
        counts.set(child, (counts.get(child) || 0) + times);
        if (!seen.has(child)) {
          seen.add(child);
          queue.push(child);
        }
      });
    }
  }
  const entries = [...counts.entries()].sort((a, b) => b[0] - a[0]);
  const totalNodes = entries.reduce((s, [, c]) => s + c, 0);
  return {
    entries: entries.map(([value, count]) => ({value: value, count: count})),
    total: entries.reduce((s, [v, c]) => s + v * c, 0),
    totalNodes: totalNodes,
    connections: totalNodes - 1
  };
}

// دراسة كاملة للرقم
export function studyNumber(n) {
  const nSquared = n * n;
  const divisors = getDivisors(n);
  const prime = isPrime(n);
  return {
    number: n,
    digitalRoot: getDigitalRootSteps(n),
    sum1toN: (n * (n + 1)) / 2,
    nSquared: nSquared,
    sum1toNSquared: Number((BigInt(nSquared) * BigInt(nSquared + 1)) / 2n),
    sum1toNSquaredText: ((BigInt(nSquared) * BigInt(nSquared + 1)) / 2n).toString(),
    palindrome: isPalindrome(n),
    reverse: getReverseAndRatios(n),
    perfect: isPerfectNumber(n),
    prime: prime,
    primeRanks: prime ? getPrimeRanks(n) : null,
    primeFactors: getPrimeFactors(n),
    divisors: divisors,
    divisorsSum: divisors.reduce((a, b) => a + b, 0),
    oddEven: getOddEvenRank(n),
    fibonacciRank: getFibonacciRank(n),
    decomposition: decompositionCounts(n)
  };
}
