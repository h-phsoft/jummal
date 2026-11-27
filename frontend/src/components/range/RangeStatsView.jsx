// =====================================================
// عرض إحصاءات مقطع: النص، الأرقام الرئيسية، قيم الجداول المختارة،
// الحروف المستخدمة وغير المستخدمة، تفصيل السور، وتكرار الكلمات
// =====================================================
import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Download} from 'lucide-react';
import {BASE_LETTERS, calculateText, tablesData} from '@jummal/core';
import RangeChart from './RangeChart.jsx';
import {pointLabel, SERIES_COLORS} from './rangePoints.js';
import NumberValue from '../../tools/components/NumberValue.jsx';
import {exportCsv} from '../../tools/exportCsv.js';
import {InfoGrid, LettersUsage} from '../stats/StudyDetails.jsx';

const SEGMENTS_PREVIEW = 30;
const WORDS_PREVIEW = 100;
const TOP_WORDS_CHART = 20;

// اختيار الجداول المستخدمة في الحساب (selected: Set من أرقام الجداول)
export function TablesChooser({selected, onChange}) {
  const {t} = useTranslation();
  const toggle = (index) => {
    const next = new Set(selected);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    onChange(next);
  };
  return (
    <div>
      <h3 className="tool-section-title">{t('choose_tables')} ({selected.size})</h3>
      <div className="tool-row range-tables">
        {tablesData.map((table, index) => (
          <label key={table.name}>
            <input type="checkbox" checked={selected.has(index)} onChange={() => toggle(index)} />
            {table.name}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function RangeStatsView({stats, tables, csvName = 'range'}) {
  const {t} = useTranslation();
  const [showAllText, setShowAllText] = useState(false);
  const [showAllWords, setShowAllWords] = useState(false);
  const [filter, setFilter] = useState('');

  const tableIdx = useMemo(() => [...tables].sort((a, b) => a - b), [tables]);
  const words = useMemo(
    () => stats.wordFrequency.filter(x => x.word.includes(filter.trim())),
    [stats, filter]
  );
  const segments = showAllText ? stats.segments : stats.segments.slice(0, SEGMENTS_PREVIEW);
  const shownWords = showAllWords ? words : words.slice(0, WORDS_PREVIEW);

  const downloadWords = () => {
    exportCsv(`${csvName}-words.csv`,
      [t('range_word'), t('range_count'), ...tableIdx.map(i => tablesData[i].name)],
      words.map(x => [x.word, x.count, ...tableIdx.map(i => calculateText(x.word, tablesData[i].values))])
    );
  };

  return (
    <>
      <div className="tool-card">
        <p className="tool-hint" style={{marginBottom: '0.5rem'}}>
          {t('range_span', {from: pointLabel(t, stats, stats.start), to: pointLabel(t, stats, stats.end)})}
        </p>
        <div className="range-text">
          {segments.map(seg => (
            <span key={seg.ayatId}>
              {seg.text} <span className="range-ayah-num">({seg.surahId}:{seg.ayahNum})</span>{' '}
            </span>
          ))}
        </div>
        {stats.segments.length > SEGMENTS_PREVIEW && (
          <button type="button" className="btn btn-secondary btn-sm" style={{marginTop: '0.5rem'}} onClick={() => setShowAllText(!showAllText)}>
            {showAllText ? t('range_show_less') : t('range_show_all', {n: stats.segments.length.toLocaleString('en-US')})}
          </button>
        )}
      </div>

      <div className="tool-card">
        <h3 className="tool-section-title">{t('range_summary')}</h3>
        <InfoGrid items={[
          {label: t('range_surahs'), value: stats.surahs, isNumber: true},
          {label: t('st_verses'), value: stats.verses, isNumber: true},
          {label: t('range_full_verses'), value: stats.fullVerses, isNumber: true},
          {label: t('st_words'), value: stats.words, isNumber: true},
          {label: t('range_distinct_words'), value: stats.distinctWords, isNumber: true},
          {label: t('st_letters'), value: stats.letters, isNumber: true},
          {label: t('range_letters_words'), value: stats.letters + stats.words, isNumber: true},
          {label: t('first_letter'), value: stats.firstLetter},
          {label: t('last_letter'), value: stats.lastLetter}
        ]} />
        {tableIdx.length > 0 && (
          <>
            <h4 className="tool-section-title" style={{marginTop: '1rem'}}>{t('range_table_values')}</h4>
            <InfoGrid items={tableIdx.map(i => ({label: stats.tables[i].name, value: stats.tables[i].total, isNumber: true}))} />
          </>
        )}
        <LettersUsage profile={stats} />
      </div>

      <div className="tool-card">
        <h3 className="tool-section-title">{t('range_chart_letters')}</h3>
        <RangeChart
          data={BASE_LETTERS.map(c => ({name: c, count: stats.letterCounts[c]}))}
          series={[{key: 'count', label: t('range_count'), color: SERIES_COLORS[0]}]}
          tickSize={14}
        />
        <h3 className="tool-section-title" style={{marginTop: '1.25rem'}}>{t('range_chart_top_words', {n: Math.min(TOP_WORDS_CHART, stats.distinctWords)})}</h3>
        <RangeChart
          data={stats.wordFrequency.slice(0, TOP_WORDS_CHART).map(x => ({name: x.word, count: x.count}))}
          series={[{key: 'count', label: t('range_count'), color: SERIES_COLORS[1]}]}
          tickSize={13}
          angle={-45}
          height={360}
        />
        {stats.bySurah.length > 1 && (
          <>
            <h3 className="tool-section-title" style={{marginTop: '1.25rem'}}>{t('range_chart_by_surah')}</h3>
            <RangeChart
              data={stats.bySurah.map(r => ({name: String(r.surahId), words: r.words, letters: r.letters}))}
              series={[
                {key: 'letters', label: t('st_letters'), color: SERIES_COLORS[0]},
                {key: 'words', label: t('st_words'), color: SERIES_COLORS[1]}
              ]}
              tickSize={stats.bySurah.length > 30 ? 9 : 12}
            />
          </>
        )}
      </div>

      {stats.bySurah.length > 1 && (
        <div className="tool-card">
          <h3 className="tool-section-title">{t('range_by_surah')}</h3>
          <div className="table-wrap" style={{maxHeight: 360}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('col_surah_no')}</th>
                  <th>{t('col_surah')}</th>
                  <th>{t('st_verses')}</th>
                  <th>{t('st_words')}</th>
                  <th>{t('st_letters')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.bySurah.map(r => (
                  <tr key={r.surahId}>
                    <td>{r.surahId}</td>
                    <td>{r.surahName}</td>
                    <td><NumberValue value={r.verses} /></td>
                    <td><NumberValue value={r.words} /></td>
                    <td><NumberValue value={r.letters} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="tool-card">
        <div className="tool-row" style={{justifyContent: 'space-between', marginBottom: '0.75rem'}}>
          <h3 className="tool-section-title" style={{margin: 0}}>{t('range_word_frequency')} ({stats.distinctWords.toLocaleString('en-US')})</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={downloadWords}>
            <Download size={14} style={{marginInlineEnd: 4}} /> CSV
          </button>
        </div>
        <input
          className="tool-input"
          style={{marginBottom: '0.5rem'}}
          placeholder={t('range_filter_words')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="table-wrap" style={{maxHeight: 420}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('range_word')}</th>
                <th>{t('range_count')}</th>
                {tableIdx.map(i => <th key={i}>{tablesData[i].name}</th>)}
              </tr>
            </thead>
            <tbody>
              {shownWords.length === 0 && (
                <tr><td colSpan={3 + tableIdx.length} className="empty-state">{t('no_results')}</td></tr>
              )}
              {shownWords.map((x, n) => (
                <tr key={x.word}>
                  <td>{n + 1}</td>
                  <td className="text-cell">{x.word}</td>
                  <td><NumberValue value={x.count} /></td>
                  {tableIdx.map(i => <td key={i}><NumberValue value={calculateText(x.word, tablesData[i].values)} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {words.length > WORDS_PREVIEW && (
          <button type="button" className="btn btn-secondary btn-sm" style={{marginTop: '0.5rem'}} onClick={() => setShowAllWords(!showAllWords)}>
            {showAllWords ? t('range_show_less') : t('range_show_all', {n: words.length.toLocaleString('en-US')})}
          </button>
        )}
      </div>
    </>
  );
}
