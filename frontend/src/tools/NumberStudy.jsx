// =====================================================
// دراسة رقم: الجوهر، القواسم، الأولية، فيبوناتشي، شجرة التحليل...
// =====================================================
import {useMemo, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ZoomIn, ZoomOut, RotateCcw} from 'lucide-react';
import {studyNumber} from '@jummal/core';
import NumberValue from './components/NumberValue.jsx';

const MAX_NUMBER = 10000000;
// الشجرة تُرسم كاملة حتى هذا العدد من العقد، وبعده يظهر التحليل المجمّع فقط
const MAX_TREE_NODES = 1023;

function TreeNode({value}) {
  return (
    <li>
      <div className="node">{value}</div>
      {value > 1 && (
        <ul>
          <TreeNode value={Math.floor(value / 2)} />
          <TreeNode value={Math.ceil(value / 2)} />
        </ul>
      )}
    </li>
  );
}

const fmt = (n) => Number(n).toLocaleString('en-US');

export default function NumberStudy() {
  const {t} = useTranslation();
  const [params] = useSearchParams();
  const [input, setInput] = useState(params.get('n') || '');
  const [number, setNumber] = useState(null);
  const [zoom, setZoom] = useState(1);

  const study = useMemo(() => (number ? studyNumber(number) : null), [number]);

  const run = () => {
    const n = parseInt(input, 10);
    if (isNaN(n) || n < 1 || n > MAX_NUMBER) {
      window.alert(t('err_number_range', {max: fmt(MAX_NUMBER)}));
      return;
    }
    setZoom(1);
    setNumber(n);
  };

  const rows = study ? [
    [t('ns_root'), study.digitalRoot.join(' ⟵ ')],
    [t('ns_sum'), <>{fmt(study.sum1toN)} <small className="tool-hint">({t('ns_sum_hint', {n: number})})</small></>],
    [t('ns_square_sum', {sq: fmt(study.nSquared)}), study.sum1toNSquaredText.replace(/\B(?=(\d{3})+(?!\d))/g, ',')],
    [t('ns_palindrome'), study.palindrome ? t('yes') : t('no')],
    [t('ns_reverse'), (
      <div style={{direction: 'ltr', textAlign: 'start'}}>
        <div>{t('ns_number')}: <strong>{fmt(number)}</strong> | {t('ns_reversed')}: <strong>{fmt(study.reverse.reversed)}</strong></div>
        <div className="tool-hint">{t('ns_ratio')}: {study.reverse.ratio === null ? '-' : study.reverse.ratio}</div>
        <div className="tool-hint">{t('ns_reverse_ratio')}: {study.reverse.reverseRatio === null ? '-' : study.reverse.reverseRatio}</div>
      </div>
    )],
    [t('ns_perfect'), study.perfect ? <span className="badge success">{t('yes')}</span> : t('no')],
    [t('ns_prime'), study.prime ? <span className="badge success">{t('yes')}</span> : <span className="badge">{t('no')}</span>],
    ...(study.prime ? [
      [t('ns_prime_rank'), fmt(study.primeRanks.rank)],
      [t('ns_prime_rank_ones'), fmt(study.primeRanks.sameOnes)]
    ] : []),
    [t('ns_factors'), <span style={{direction: 'ltr', display: 'inline-block'}}>{study.primeFactors.length ? study.primeFactors.join(' × ') : '-'}</span>],
    [t('ns_divisors'), (
      <div>
        <div style={{direction: 'ltr', textAlign: 'start', wordBreak: 'break-word'}}>{study.divisors.join(' ، ')}</div>
        <div className="tool-hint">{t('ns_divisors_info', {count: study.divisors.length, sum: fmt(study.divisorsSum)})}</div>
      </div>
    )],
    [t('ns_odd_even', {type: study.oddEven.type}), fmt(study.oddEven.rank)],
    [t('ns_fibonacci'), study.fibonacciRank ? t('ns_fib_yes', {rank: study.fibonacciRank}) : t('no')]
  ] : [];

  const decomposition = study ? study.decomposition : null;

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('tool_number_study')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('tool_number_study_desc')}</p>
        <div className="tool-row" style={{justifyContent: 'center'}}>
          <input
            type="number"
            min="1"
            className="tool-input number"
            placeholder={t('enter_number')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            autoFocus
          />
          <button type="button" className="btn btn-primary" onClick={run}>{t('study')}</button>
        </div>
      </div>

      {study && (
        <div className="tool-card">
          <h3 className="tool-section-title" style={{textAlign: 'center'}}>
            {t('ns_results_title')} <NumberValue value={number} />
          </h3>
          <div className="table-wrap">
            <table className="data-table study-table">
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label}>
                    <th>{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {decomposition && (
        <div className="tool-card">
          <div className="tool-row" style={{justifyContent: 'space-between', marginBottom: '0.75rem'}}>
            <h3 className="tool-section-title" style={{margin: 0}}>{t('ns_tree')}</h3>
            {decomposition.totalNodes <= MAX_TREE_NODES && (
              <div className="tool-row">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.min(3, z + 0.1))}><ZoomIn size={14} /></button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setZoom(1)}><RotateCcw size={14} /></button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}><ZoomOut size={14} /></button>
              </div>
            )}
          </div>
          {decomposition.totalNodes <= MAX_TREE_NODES ? (
            <div className="number-tree-wrap">
              <div className="number-tree" style={{zoom: zoom}}>
                <ul><TreeNode value={number} /></ul>
              </div>
            </div>
          ) : (
            <p className="tool-hint" style={{textAlign: 'center'}}>{t('ns_tree_too_big', {nodes: fmt(decomposition.totalNodes)})}</p>
          )}
          <div style={{direction: 'ltr', textAlign: 'start', marginTop: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-word'}}>
            {decomposition.entries.map(e => `(${e.value}×${e.count})`).join(' + ')} = <strong>{fmt(decomposition.total)}</strong>
          </div>
          <div className="stats-badges" style={{marginTop: '0.75rem'}}>
            <span className="badge">{t('ns_tree_sum')}: {fmt(decomposition.total)}</span>
            <span className="badge">{t('ns_tree_nodes')}: {fmt(decomposition.totalNodes)}</span>
            <span className="badge">{t('ns_tree_links')}: {fmt(decomposition.connections)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
