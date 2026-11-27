// =====================================================
// مقارنة مقطعين: إحصاءات كل مقطع، مقارنة الأرقام، عدّ كلمات في المقطعين،
// ومعادلات يكتبها المستخدم بين المقطعين (A و B)
// =====================================================
import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Plus, X} from 'lucide-react';
import {BASE_LETTERS, countWordInRange, cleanArabicText, evaluateExpression, rangeVariables, tablesData} from '@jummal/core';
import {useApiData} from '../hooks/useApiData.js';
import {useStoredList} from '../hooks/useStoredList.js';
import {apiGet} from '../services/api.js';
import LoadingState from './stats/LoadingState.jsx';
import NumberValue from '../tools/components/NumberValue.jsx';
import RangeSelector from './range/RangeSelector.jsx';
import RangeChart from './range/RangeChart.jsx';
import {DEFAULT_RANGE, pointParam, SERIES_COLORS} from './range/rangePoints.js';
import RangeStatsView, {TablesChooser} from './range/RangeStatsView.jsx';

const EQUATIONS_KEY = 'range_equations_v1';
const PRESETS = [
  'A.letters / B.letters',
  'A.words / B.words',
  '(A.letters + A.words) / (B.letters + B.words)',
  'A.jummal / B.jummal',
  'A.w1 / B.w1'
];

// عرض نتيجة رقمية: الصحيح بقائمة خيارات الرقم، والكسري بست خانات
function ResultValue({value}) {
  if (value === null || value === undefined) {
    return <span>—</span>;
  }
  if (Number.isInteger(value)) {
    return <NumberValue value={value} />;
  }
  return <span dir="ltr">{Number(value.toFixed(6)).toLocaleString('en-US', {maximumFractionDigits: 6})}</span>;
}

function ratio(a, b) {
  return b === 0 ? null : a / b;
}

export default function CompareRanges() {
  const {t} = useTranslation();
  const swar = useApiData('/api/swar');
  const [ranges, setRanges] = useState({A: DEFAULT_RANGE, B: {start: {surah: 114, ayah: 1, word: 1, char: 0}, end: {surah: 114, ayah: 6, word: 0, char: 0}}});
  const [tables, setTables] = useState(() => new Set([0, 1, 2]));
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState('A');
  const [words, setWords] = useState([]);
  const [wordInput, setWordInput] = useState('');
  const [wordMode, setWordMode] = useState('exact');
  const [equationInput, setEquationInput] = useState('');
  const stored = useStoredList(EQUATIONS_KEY, 30);
  const equations = stored.items.length > 0 ? stored.items : PRESETS.slice(0, 3);

  const wordCounts = useMemo(() => {
    if (!stats) {
      return {A: [], B: []};
    }
    return {
      A: words.map(w => countWordInRange(stats.A, w, wordMode)),
      B: words.map(w => countWordInRange(stats.B, w, wordMode))
    };
  }, [stats, words, wordMode]);

  const vars = useMemo(() => (stats ? {
    ...rangeVariables('A', stats.A, wordCounts.A),
    ...rangeVariables('B', stats.B, wordCounts.B)
  } : {}), [stats, wordCounts]);

  if (swar.loading || swar.error) {
    return <LoadingState error={swar.error} />;
  }

  const calculate = async () => {
    setBusy(true);
    const [a, b] = await Promise.all(['A', 'B'].map(k => apiGet(
      `/api/analysis/range?start=${pointParam(ranges[k].start)}&end=${pointParam(ranges[k].end)}`
    )));
    setBusy(false);
    const bad = a.error ? ['A', a.error] : (b.error ? ['B', b.error] : null);
    if (bad) {
      setError(`${t('range_label', {name: bad[0]})}: ${t(`range_err_${bad[1]}`)}`);
      setStats(null);
      return;
    }
    setError('');
    setStats({A: a, B: b});
  };

  const addWord = () => {
    const w = cleanArabicText(wordInput).replace(/\s+/g, '');
    if (w && !words.includes(w)) {
      setWords([...words, w]);
    }
    setWordInput('');
  };

  const saveEquations = (list) => {
    stored.clear();
    [...list].reverse().forEach(eq => stored.add(eq, () => false));
  };
  const addEquation = (eq) => {
    const text = (eq || '').trim();
    if (text && !equations.includes(text)) {
      saveEquations([...equations, text]);
    }
  };
  const removeEquation = (index) => {
    saveEquations(equations.filter((_, i) => i !== index));
  };
  const errorText = (err) => {
    const [code, detail] = String(err).split(':');
    return t(`eq_err_${code}`, {detail: detail || '', defaultValue: err});
  };

  const metrics = stats ? [
    {label: t('range_surahs'), a: stats.A.surahs, b: stats.B.surahs},
    {label: t('st_verses'), a: stats.A.verses, b: stats.B.verses},
    {label: t('st_words'), a: stats.A.words, b: stats.B.words},
    {label: t('range_distinct_words'), a: stats.A.distinctWords, b: stats.B.distinctWords},
    {label: t('st_letters'), a: stats.A.letters, b: stats.B.letters},
    {label: t('range_letters_words'), a: stats.A.letters + stats.A.words, b: stats.B.letters + stats.B.words},
    ...[...tables].sort((x, y) => x - y).map(i => ({label: tablesData[i].name, a: stats.A.tables[i].total, b: stats.B.tables[i].total}))
  ] : [];

  // نتائج المعادلات الصحيحة للرسم (اسم العمود: رقم المعادلة)
  const equationResults = stats ? equations
    .map((eq, i) => ({name: `${i + 1}`, eq: eq, value: evaluateExpression(eq, vars).value}))
    .filter(r => r.value !== undefined) : [];

  const variableHelp = [
    ['letters', t('st_letters')],
    ['words', t('st_words')],
    ['verses', t('st_verses')],
    ['surahs', t('range_surahs')],
    ['distinct', t('range_distinct_words')],
    ...stats ? stats.A.tables.map(tb => [tb.key, tb.name]) : [],
    ...words.map((w, i) => [`w${i + 1}`, w]),
    [BASE_LETTERS[12], t('eq_var_letter')]
  ];

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_compare_ranges')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('compare_ranges_desc')}</p>
        <div className="tool-grid-2">
          {['A', 'B'].map(k => (
            <div key={k}>
              <h3 className="tool-section-title">{t('range_label', {name: k})}</h3>
              <RangeSelector swar={swar.data} value={ranges[k]} onChange={(v) => setRanges({...ranges, [k]: v})} />
            </div>
          ))}
        </div>
        <div style={{marginTop: '1rem'}}>
          <TablesChooser selected={tables} onChange={setTables} />
        </div>
        <div className="tool-row" style={{justifyContent: 'center', marginTop: '1rem'}}>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={calculate}>
            {busy ? t('loading') : t('calculate')}
          </button>
        </div>
        {error && <div className="result-banner error">{error}</div>}
      </div>

      {stats && (
        <>
          <div className="tool-card">
            <h3 className="tool-section-title">{t('compare_summary')}</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>A</th>
                    <th>B</th>
                    <th>A / B</th>
                    <th>A − B</th>
                    <th>A + B</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(m => (
                    <tr key={m.label}>
                      <td>{m.label}</td>
                      <td><NumberValue value={m.a} /></td>
                      <td><NumberValue value={m.b} /></td>
                      <td><ResultValue value={ratio(m.a, m.b)} /></td>
                      <td><ResultValue value={m.a - m.b} /></td>
                      <td><NumberValue value={m.a + m.b} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="tool-section-title" style={{marginTop: '1.25rem'}}>{t('compare_chart_ratio')}</h3>
            <RangeChart
              data={metrics.filter(m => m.b !== 0).map(m => ({name: m.label, ratio: m.a / m.b}))}
              series={[{key: 'ratio', label: 'A / B', color: SERIES_COLORS[0]}]}
              tickSize={12}
              angle={-30}
              height={340}
            />
            <h3 className="tool-section-title" style={{marginTop: '1.25rem'}}>{t('compare_chart_letters')}</h3>
            <RangeChart
              data={BASE_LETTERS.map(c => ({name: c, A: stats.A.letterCounts[c], B: stats.B.letterCounts[c]}))}
              series={[
                {key: 'A', label: t('range_label', {name: 'A'}), color: SERIES_COLORS[0]},
                {key: 'B', label: t('range_label', {name: 'B'}), color: SERIES_COLORS[1]}
              ]}
            />
          </div>

          <div className="tool-card">
            <h3 className="tool-section-title">{t('compare_words')}</h3>
            <div className="tool-row">
              <input
                className="tool-input"
                style={{flex: 1, minWidth: 160}}
                placeholder={t('compare_word_placeholder')}
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addWord();
                  }
                }}
              />
              <select className="tool-select" style={{minWidth: 150}} value={wordMode} onChange={(e) => setWordMode(e.target.value)}>
                <option value="exact">{t('compare_mode_exact')}</option>
                <option value="contains">{t('compare_mode_contains')}</option>
              </select>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addWord}>
                <Plus size={14} style={{marginInlineEnd: 4}} /> {t('add')}
              </button>
            </div>
            {words.length > 0 && (
              <div className="table-wrap" style={{marginTop: '0.75rem'}}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('eq_variable')}</th>
                      <th>{t('range_word')}</th>
                      <th>A</th>
                      <th>B</th>
                      <th>A / B</th>
                      <th>A + B</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {words.map((w, i) => (
                      <tr key={w}>
                        <td dir="ltr">w{i + 1}</td>
                        <td className="text-cell">{w}</td>
                        <td><NumberValue value={wordCounts.A[i]} /></td>
                        <td><NumberValue value={wordCounts.B[i]} /></td>
                        <td><ResultValue value={ratio(wordCounts.A[i], wordCounts.B[i])} /></td>
                        <td><NumberValue value={wordCounts.A[i] + wordCounts.B[i]} /></td>
                        <td style={{width: 50}}>
                          <button type="button" className="btn btn-danger btn-sm" title={t('delete')} onClick={() => setWords(words.filter(x => x !== w))}>
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {words.length > 0 && (
              <div style={{marginTop: '1rem'}}>
                <RangeChart
                  data={words.map((w, i) => ({name: w, A: wordCounts.A[i], B: wordCounts.B[i]}))}
                  series={[
                    {key: 'A', label: t('range_label', {name: 'A'}), color: SERIES_COLORS[0]},
                    {key: 'B', label: t('range_label', {name: 'B'}), color: SERIES_COLORS[1]}
                  ]}
                  height={280}
                />
              </div>
            )}
          </div>

          <div className="tool-card">
            <h3 className="tool-section-title">{t('equations')}</h3>
            <p className="tool-hint" style={{marginBottom: '0.5rem'}}>{t('equations_hint')}</p>
            <div className="tool-row">
              <input
                className="tool-input"
                dir="ltr"
                style={{flex: 1, minWidth: 200}}
                placeholder="(A.letters + A.words) / (B.letters + B.words)"
                value={equationInput}
                onChange={(e) => setEquationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addEquation(equationInput);
                    setEquationInput('');
                  }
                }}
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={() => {
                addEquation(equationInput);
                setEquationInput('');
              }}>
                <Plus size={14} style={{marginInlineEnd: 4}} /> {t('add')}
              </button>
            </div>
            {equationInput.trim() && (
              <p className="tool-hint" style={{marginTop: '0.4rem'}}>
                = {(() => {
                  const r = evaluateExpression(equationInput, vars);
                  return r.error ? errorText(r.error) : <ResultValue value={r.value} />;
                })()}
              </p>
            )}
            <div className="tool-row" style={{marginTop: '0.5rem', gap: '0.4rem'}}>
              <span className="tool-hint">{t('eq_presets')}:</span>
              {PRESETS.map(p => (
                <button key={p} type="button" className="btn btn-secondary btn-sm" dir="ltr" onClick={() => addEquation(p)}>{p}</button>
              ))}
            </div>
            <div className="table-wrap" style={{marginTop: '0.75rem'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('equation')}</th>
                    <th>{t('eq_result')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {equations.map((eq, i) => {
                    const r = evaluateExpression(eq, vars);
                    return (
                      <tr key={eq}>
                        <td style={{width: 40}}>{i + 1}</td>
                        <td dir="ltr" className="text-cell" style={{textAlign: 'left'}}>{eq}</td>
                        <td>{r.error ? <span className="eq-error">{errorText(r.error)}</span> : <ResultValue value={r.value} />}</td>
                        <td style={{width: 50}}>
                          <button type="button" className="btn btn-danger btn-sm" title={t('delete')} onClick={() => removeEquation(i)}>
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {equationResults.length > 0 && (
              <div style={{marginTop: '1rem'}}>
                <RangeChart
                  data={equationResults}
                  series={[{key: 'value', label: t('eq_result'), color: SERIES_COLORS[0]}]}
                  tickSize={11}
                  angle={-30}
                  height={340}
                />
              </div>
            )}
            <details style={{marginTop: '0.75rem'}}>
              <summary className="tool-hint" style={{cursor: 'pointer'}}>{t('eq_variables_help')}</summary>
              <div className="eq-vars">
                {variableHelp.map(([key, label]) => (
                  <button key={key} type="button" className="btn btn-secondary btn-sm" onClick={() => setEquationInput(`${equationInput}A.${key}`)}>
                    <span dir="ltr">A.{key}</span> · {label}
                  </button>
                ))}
              </div>
              <p className="tool-hint" style={{marginTop: '0.5rem'}}>{t('eq_functions_help')}</p>
            </details>
          </div>

          <div className="tool-card">
            <div className="tool-row">
              {['A', 'B'].map(k => (
                <button key={k} type="button" className={`btn btn-sm ${view === k ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView(k)}>
                  {t('range_details', {name: k})}
                </button>
              ))}
            </div>
          </div>
          <RangeStatsView key={view} stats={stats[view]} tables={tables} csvName={`range-${view}`} />
        </>
      )}
    </div>
  );
}
