// =====================================================
// المختبر الرياضي: دفتر معادلات يقيّم كل سطر (جبر، قوى، إحصاء، اشتقاق، تكامل،
// مصفوفات...) مع متغيرات ودوال من نص القرآن. الحساب كله في @jummal/core/math-lab
// =====================================================
import {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BarChart3, Play, Trash2} from 'lucide-react';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {createMathLab, quranMathData} from '@jummal/core/math-lab';
import {loadAyat, loadSwar} from '../services/data.js';
import LoadingState from './stats/LoadingState.jsx';

const STORAGE_KEY = 'math_lab_notebook_v1';
const VECTOR_PREVIEW = 12;

// الدفتر الأول: سطر أو سطران من بعض مجموعات الأمثلة
function defaultNotebook(t) {
  return [
    `# ${t('ml_ex_powers')}`,
    '2^10 + 3^5',
    'bignumber(19)^30',
    `# ${t('ml_ex_statistics')}`,
    'mean(surahVerses)',
    'std(surahVerses)',
    `# ${t('ml_ex_calculus')}`,
    'derivative("x^3 + 5x^2", "x")',
    'integrate("x^2", 0, 19)',
    `# ${t('ml_ex_quran')}`,
    'value("بسم الله الرحمن الرحيم") / 19',
    'word("الارض")'
  ].join('\n');
}

// أمثلة جاهزة: كل مجموعة تضيف أسطرها إلى الدفتر
const EXAMPLES = [
  {key: 'ml_ex_powers', lines: ['2^64', 'bignumber(7)^100', 'nthRoot(totalLetters, 3)', 'log(totalWords, 19)', 'exp(1)^pi', 'mod(totalLetters, 19)']},
  {key: 'ml_ex_algebra', lines: ['rationalize("(x+1)^2 - x^2")', 'simplify("2x + 3x + x^2 * x")', 'f(x) = x^2 + 19x', 'f(7)', 'findRoot("x^3 - 19", 0, 5)', 'det([1, 2; 3, 4])', 'inv([2, 1; 1, 1])']},
  {key: 'ml_ex_calculus', lines: ['derivative("sin(x) * x^2", "x")', 'derivative("x^4", "x").evaluate({x: 2})', 'nderivative("exp(x)", 1)', 'integrate("1/x", 1, e)', 'trapz(surahVerses)', 'sigma("1/k^2", "k", 1, 1000)']},
  {key: 'ml_ex_statistics', lines: ['mean(verseWords)', 'median(surahLetters)', 'mode(verseWords)', 'variance(surahVerses)', 'corr(surahVerses, surahLetters)', 'linreg(surahRevelation, surahVerses)']},
  {key: 'ml_ex_quran', lines: ['letter("ق", 50)', 'letter("ق", 42)', 'word("الشهر")', 'wordlike("يوم")', 'segment("2:1", "2:5")', 'sum(bysurah(112, "jummal"))', 'verse(112, 1)', 'sum(surahMeccan)', 'cumsum(surahVerses)']},
  {key: 'ml_ex_numbers', lines: ['isPrime(totalSurahs)', 'divisors(786)', 'digitsum(786)', 'digitalroot(totalLetters)', 'reversenum(786)', 'fib(19)', 'gcd(totalVerses, totalSurahs)']}
];

// مرجع المتغيرات والدوال: الاسم ← مفتاح الوصف
const REFERENCE = [
  ['totalSurahs, totalVerses, totalWords, totalLetters', 'ml_ref_totals'],
  ['surahVerses, surahWords, surahLetters', 'ml_ref_surah_vectors'],
  ['surahJummal, surahAbjad, surahAyqagh, surahTabaei4, surahTabaei7', 'ml_ref_surah_tables'],
  ['surahRevelation, surahMeccan', 'ml_ref_surah_info'],
  ['verseWords, verseLetters, verseJummal, verseAbjad, verseAyqagh, verseSurah, verseNum', 'ml_ref_verse_vectors'],
  ['letterCounts, letterValues', 'ml_ref_letters'],
  ['letter("م"), letter("م", 2)', 'ml_ref_letter_fn'],
  ['word("الارض"), wordlike("ارض")', 'ml_ref_word_fn'],
  ['value("محمد"), value("محمد", "abjad")', 'ml_ref_value_fn'],
  ['bysurah(2, "letters" | "words" | "jummal" ...)', 'ml_ref_bysurah_fn'],
  ['segment("2:1", "2:5:3:2").letters', 'ml_ref_segment_fn'],
  ['verse(2, 255), letters("نص"), words("نص")', 'ml_ref_text_fn'],
  ['+ - * / ^ mod ! , pow, sqrt, nthRoot, exp, log, bignumber', 'ml_ref_powers'],
  ['derivative, simplify, rationalize, integrate, nderivative, trapz, findRoot, sigma, piprod', 'ml_ref_calculus'],
  ['sum, mean, median, mode, std, variance, min, max, corr, quantileSeq, cumsum, linreg', 'ml_ref_statistics'],
  ['isPrime, gcd, lcm, divisors, digitsum, digitalroot, reversenum, fib, factorial, combinations', 'ml_ref_numbers'],
  ['[1, 2; 3, 4], det, inv, transpose, multiply, eigs, range(1, 10), map, filter', 'ml_ref_matrices']
];

function readNotebook(fallback) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? fallback : saved;
  } catch {
    return fallback;
  }
}

function saveNotebook(text) {
  try {
    localStorage.setItem(STORAGE_KEY, text);
  } catch {
    // التخزين غير متاح
  }
}

function formatNumber(v) {
  if (Number.isInteger(v)) {
    return v.toLocaleString('en-US');
  }
  return Number(v.toPrecision(12)).toString();
}

function VectorChart({values}) {
  const data = values.map((v, i) => ({i: i + 1, v: v}));
  return (
    <div style={{height: 260, direction: 'ltr', marginTop: '0.5rem'}}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{top: 10, right: 16, left: 0, bottom: 0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
          <XAxis dataKey="i" stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 11}} minTickGap={20} />
          <YAxis stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 11}} />
          <Tooltip
            contentStyle={{background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 8}}
            formatter={(value) => [formatNumber(value), '']}
          />
          <Line isAnimationActive={false} type="monotone" dataKey="v" stroke="var(--gold-accent)" dot={values.length <= 120} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ResultCell({result}) {
  const {t} = useTranslation();
  const [chart, setChart] = useState(false);
  if (!result) {
    return null;
  }
  if (result.type === 'error') {
    return <span className="eq-error" dir="ltr">{result.message}</span>;
  }
  if (result.type === 'number') {
    // عدد صحيح أكبر من الدقة المضمونة: قيمة تقريبية، والدقيق بـ bignumber
    if (Number.isInteger(result.value) && !Number.isSafeInteger(result.value)) {
      return (
        <div>
          <span className="ml-value" dir="ltr">≈ {result.value.toPrecision(17)}</span>
          <div className="tool-hint">{t('ml_approx_hint')}</div>
        </div>
      );
    }
    return <span className="ml-value" dir="ltr">{formatNumber(result.value)}</span>;
  }
  if (result.type === 'vector') {
    const v = result.values;
    const sum = v.reduce((s, x) => s + x, 0);
    return (
      <div>
        <div className="ml-value" dir="ltr">
          [{v.slice(0, VECTOR_PREVIEW).map(formatNumber).join(', ')}{v.length > VECTOR_PREVIEW ? ', …' : ''}]
        </div>
        <div className="tool-hint">
          {t('ml_vector_summary', {
            n: v.length.toLocaleString('en-US'),
            sum: formatNumber(sum),
            mean: formatNumber(v.length ? sum / v.length : 0),
            min: formatNumber(Math.min(...v)),
            max: formatNumber(Math.max(...v))
          })}
          {' '}
          <button type="button" className="btn btn-secondary btn-sm" style={{padding: '0.15rem 0.5rem'}} onClick={() => setChart(!chart)}>
            <BarChart3 size={13} style={{marginInlineEnd: 4}} /> {chart ? t('ml_hide_chart') : t('ml_show_chart')}
          </button>
        </div>
        {chart && <VectorChart values={v} />}
      </div>
    );
  }
  if (result.type === 'function') {
    return <span className="tool-hint" dir="ltr">{t('ml_function_defined')} {result.text}</span>;
  }
  return <pre className="ml-text" dir="ltr">{result.text}</pre>;
}

export default function MathLab() {
  const {t} = useTranslation();
  const [lab, setLab] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [initialNotebook] = useState(() => readNotebook(defaultNotebook(t)));
  const [notebook, setNotebook] = useState(initialNotebook);
  const [results, setResults] = useState(null);
  const textRef = useRef(null);

  // تجهيز بيانات القرآن والمحرك مرة واحدة، ثم تشغيل الدفتر أول مرة
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadAyat(), loadSwar()])
      .then(([ayat, swar]) => {
        if (!cancelled) {
          const engine = createMathLab(quranMathData(ayat, swar));
          const first = initialNotebook.split('\n');
          setLab(engine);
          setResults({lines: first, values: engine.evaluate(first)});
        }
      })
      .catch(err => {
        if (!cancelled) {
          setLoadError(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [initialNotebook]);

  const lines = useMemo(() => notebook.split('\n'), [notebook]);

  const run = () => {
    if (!lab) {
      return;
    }
    saveNotebook(notebook);
    setResults({lines: lines, values: lab.evaluate(lines)});
  };

  const append = (newLines) => {
    const text = notebook.trim() ? `${notebook.replace(/\s+$/, '')}\n${newLines.join('\n')}` : newLines.join('\n');
    setNotebook(text);
    saveNotebook(text);
    if (textRef.current) {
      textRef.current.focus();
    }
  };

  if (loadError) {
    return <LoadingState error={loadError} />;
  }

  const rows = results ? results.lines.map((line, i) => ({n: i + 1, line: line, result: results.values[i]})).filter(r => r.result) : [];

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_math_lab')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('math_lab_desc')}</p>
        <textarea
          ref={textRef}
          className="tool-textarea ml-editor"
          dir="ltr"
          spellCheck={false}
          rows={Math.min(22, Math.max(8, lines.length + 1))}
          value={notebook}
          onChange={(e) => setNotebook(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              run();
            }
          }}
        />
        <p className="tool-hint" style={{marginTop: '0.4rem'}}>{t('ml_editor_hint')}</p>
        <div className="tool-row" style={{justifyContent: 'center', marginTop: '0.75rem'}}>
          <button type="button" className="btn btn-primary" disabled={!lab} onClick={run}>
            <Play size={16} style={{marginInlineEnd: 6}} /> {lab ? t('ml_run') : t('loading')}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm(t('ml_confirm_clear'))) {
                setNotebook('');
                saveNotebook('');
                setResults({lines: [], values: []});
              }
            }}
          >
            <Trash2 size={14} style={{marginInlineEnd: 4}} /> {t('ml_clear')}
          </button>
        </div>
        <div className="tool-row" style={{marginTop: '0.75rem', gap: '0.4rem'}}>
          <span className="tool-hint">{t('ml_examples')}:</span>
          {EXAMPLES.map(ex => (
            <button key={ex.key} type="button" className="btn btn-secondary btn-sm" onClick={() => append([`# ${t(ex.key)}`, ...ex.lines])}>
              {t(ex.key)}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-card">
        <h3 className="tool-section-title">{t('ml_results')}</h3>
        {!results && <LoadingState />}
        {results && rows.length === 0 && <p className="tool-hint">{t('ml_no_results')}</p>}
        {rows.length > 0 && (
          <div className="ml-results">
            {rows.map(r => (
              <div key={`${r.n}-${r.line}`} className="ml-row">
                <div className="ml-row-head" dir="ltr">
                  <span className="ml-line-no">{r.n}</span>
                  <code className="ml-expr">{r.line}</code>
                </div>
                <div className="ml-row-result">
                  <ResultCell result={r.result} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tool-card">
        <details>
          <summary className="tool-section-title" style={{cursor: 'pointer'}}>{t('ml_reference')}</summary>
          <div className="table-wrap" style={{marginTop: '0.75rem'}}>
            <table className="data-table">
              <tbody>
                {REFERENCE.map(([names, key]) => (
                  <tr key={key}>
                    <td className="ml-expr" dir="ltr">{names}</td>
                    <td>{t(key)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
