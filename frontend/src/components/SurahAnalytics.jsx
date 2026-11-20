import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api.js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { Search, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SurahAnalytics() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('bar');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const swar = await apiGet('/api/swar');
        
        // Transform data for charting
        const chartData = swar.map(surah => ({
          name: surah.swarName,
          id: surah.swarId,
          ayahs: surah.swarAyat,
          order: surah.swarOrd,
          type: surah.tItmName
        }));
        
        setData(chartData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch surah data:", err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.name.includes(searchTerm) || item.id.toString().includes(searchTerm)
  );

  // Show all 114 surahs
  const displayData = filteredData;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--accent-primary)' }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{t('menu_stats_chapters', 'Surah Analytics')}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{t('ayahs_distribution')}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={18} />
            <input 
              type="text" 
              placeholder={t('search', 'Search...')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '0.5rem 1rem 0.5rem 2.5rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '250px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0.25rem', border: '1px solid var(--border-medium)' }}>
            <button 
              onClick={() => setActiveTab('bar')}
              style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '6px', 
                border: 'none', 
                background: activeTab === 'bar' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'bar' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'bar' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {t('chart_bar')}
            </button>
            <button 
              onClick={() => setActiveTab('area')}
              style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '6px', 
                border: 'none', 
                background: activeTab === 'area' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'area' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'area' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {t('chart_area')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: '400px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'bar' ? (
            <BarChart data={displayData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--text-tertiary)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} 
                tickMargin={10}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="var(--text-tertiary)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: 'var(--bg-secondary)' }}
                contentStyle={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'var(--shadow-lg)'
                }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}
              />
              <Bar 
                dataKey="ayahs" 
                name={t('st_verses')}
                fill="url(#colorAyahs)" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1500}
              />
              <defs>
                <linearGradient id="colorAyahs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={1}/>
                  <stop offset="95%" stopColor="var(--accent-tertiary)" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          ) : (
            <AreaChart data={displayData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--text-tertiary)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} 
                tickMargin={10}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="var(--text-tertiary)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="ayahs" 
                name={t('st_verses')}
                stroke="var(--accent-primary)" 
                fillOpacity={1} 
                fill="url(#colorAyahsArea)" 
                animationDuration={1500}
              />
              <defs>
                <linearGradient id="colorAyahsArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-tertiary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      
      {/* Data Grid Preview below chart */}
      <div style={{ marginTop: '3rem', overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('raw_data_view')}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
            <tr style={{ borderBottom: '2px solid var(--border-medium)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>#</th>
              <th style={{ padding: '1rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t('col_surah')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t('surah_type')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t('revelation_order')}</th>
              <th style={{ padding: '1rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t('st_verses')}</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{row.id}</td>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{row.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem',
                    background: row.type === 'مكية' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                    color: row.type === 'مكية' ? 'var(--accent-primary)' : 'var(--gold-accent)'
                  }}>
                    {row.type}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{row.order}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{row.ayahs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
