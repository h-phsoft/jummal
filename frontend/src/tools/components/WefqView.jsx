// =====================================================
// عرض الوفق: الشبكة (تلوين خانة جبر الكسر فقط) + جدول الدليل
// =====================================================
import {useTranslation} from 'react-i18next';
import {buildWefeqInfoRows, wefeqCellClass} from '@jummal/core';
import NumberValue from './NumberValue.jsx';

export default function WefqView({result, shape, showInfo = true}) {
  const {t} = useTranslation();
  if (!result) {
    return null;
  }
  const n = result.square.length;

  return (
    <div>
      <div
        className={`magic-grid ${n >= 7 ? 'dense' : ''}`}
        style={{gridTemplateColumns: `repeat(${n}, 1fr)`}}
      >
        {result.square.map((row, i) => row.map((value, j) => (
          <div key={`${i}-${j}`} className={`magic-cell ${wefeqCellClass(result, shape, i, j)}`}>
            <NumberValue value={value} format={false} />
          </div>
        )))}
      </div>
      {showInfo && (
        <div className="table-wrap" style={{marginTop: '1rem'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('col_name')}</th>
                <th>{t('col_explanation')}</th>
                <th>{t('col_value')}</th>
              </tr>
            </thead>
            <tbody>
              {buildWefeqInfoRows(result, shape).map(row => (
                <tr key={row.name}>
                  <td><strong>{row.name}</strong></td>
                  <td className="text-cell">{row.explanation}</td>
                  <td><strong><NumberValue value={row.value} format={false} /></strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
