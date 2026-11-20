// =====================================================
// حالة التحميل أو الخطأ الموحدة لصفحات الإحصاءات
// =====================================================
import {Loader2} from 'lucide-react';

export default function LoadingState({error}) {
  if (error) {
    return <div className="tool-card result-banner error">{error}</div>;
  }
  return (
    <div style={{display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--accent-primary)'}}>
      <Loader2 className="animate-spin" size={40} />
    </div>
  );
}
