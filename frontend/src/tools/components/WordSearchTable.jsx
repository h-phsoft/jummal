// =====================================================
// جدول نتائج البحث عن رقم في الكلمات مع العدادات وتلوين المطابق
// =====================================================
import {useTranslation} from 'react-i18next';
import NumberValue from './NumberValue.jsx';

export default function WordSearchTable({found, types, maxHeight = '60vh'}) {
  const {t} = useTranslation();
  const counts = found ? found.counts : {total: 0, jummal: 0, abjad: 0, ayqagh: 0};
  const count = (key) => (types[key] ? counts[key] : 0);

  return (
    <div className="table-wrap" style={{maxHeight}}>
      <table className="data-table">
        <thead>
          <tr>
            <th>{t('col_word')} ({counts.total})</th>
            <th>{t('jummal')} ({count('jummal')})</th>
            <th>{t('abjad')} ({count('abjad')})</th>
            <th>{t('ayqagh')} ({count('ayqagh')})</th>
          </tr>
        </thead>
        <tbody>
          {!found && (
            <tr><td colSpan={4} className="empty-state">{t('search_hint')}</td></tr>
          )}
          {found && found.items.length === 0 && (
            <tr><td colSpan={4} className="empty-state">{t('no_matching_words')}</td></tr>
          )}
          {found && found.items.map(item => (
            <tr key={item.id}>
              <td className="text-cell" title={item.ntext}>{item.text}</td>
              <td className={item.match.jummal ? 'cell-match' : ''}><NumberValue value={item.jummal} format={false} /></td>
              <td className={item.match.abjad ? 'cell-match' : ''}><NumberValue value={item.abjad} format={false} /></td>
              <td className={item.match.ayqagh ? 'cell-match' : ''}><NumberValue value={item.ayqagh} format={false} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
