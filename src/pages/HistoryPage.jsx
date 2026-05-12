import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  
  const lang = localStorage.getItem('lang') || 'ko';
  const t = {
    ko: { title: '요리기록', main: '처음으로', empty: '기록이 없습니다.', start: '분석 시작하기' },
    en: { title: 'Cooking History', main: 'Main', empty: 'No records found.', start: 'Start Analysis' },
    ja: { title: '料理記録', main: 'メインへ', empty: '記録がありません。', start: '分析を開始する' },
    zh: { title: '烹饪记录', main: '返回首页', empty: '暂无记录。', start: '开始分析' },
  }[lang] || {};

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = JSON.parse(localStorage.getItem('foodHistory') || '[]');
    setHistory(savedHistory);
  }, []);

  const handleItemClick = (item) => {
    // Navigate back to result page with the saved item's data
    navigate('/result', { state: { image: item.image, foodName: item.foodName, cachedData: item.cachedData } });
  };

  return (
    <div className="history-container" style={{ minHeight: '100vh', backgroundColor: '#fcfcfc', paddingBottom: '40px' }}>
      {/* Header */}
      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 10, 
        backgroundColor: '#FFFFFF', 
        padding: '16px 20px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #F1F3F5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary-navy)' }}>{t.title}</h1>
        </div>

        <button 
          onClick={() => navigate('/')}
          style={{ 
            backgroundColor: 'var(--primary-green)', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            border: 'none', 
            fontWeight: '800', 
            fontSize: '13px', 
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(39, 174, 96, 0.2)'
          }}
        >
          {t.main}
        </button>
      </header>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
            <span style={{ fontSize: '50px', marginBottom: '16px', display: 'block' }}>🍽️</span>
            <p style={{ fontSize: '16px', fontWeight: '800', color: '#CCC' }}>{t.empty}</p>
            <button 
              onClick={() => navigate('/')}
              style={{ marginTop: '24px', backgroundColor: 'var(--primary-green)', color: 'white', padding: '12px 24px', borderRadius: '15px', border: 'none', fontWeight: '800', cursor: 'pointer' }}
            >
              {t.start}
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '12px',
            alignItems: 'start'
          }}>
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative'
                }}
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newHistory = history.filter(h => h.id !== item.id);
                    setHistory(newHistory);
                    localStorage.setItem('foodHistory', JSON.stringify(newHistory));
                  }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#FF4757',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    zIndex: 2,
                    boxShadow: '0 2px 4px rgba(255, 71, 87, 0.4)'
                  }}
                >
                  ✕
                </button>

                {/* Image Thumbnail */}
                <div style={{ 
                  width: '100%', 
                  height: '0',
                  paddingBottom: '100%',
                  position: 'relative',
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #F1F3F5',
                  backgroundColor: '#f1f5f9',
                  flexShrink: 0
                }}>
                  <img 
                    src={item.image} 
                    alt={item.foodName} 
                    style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; }}
                  />
                </div>
                
                {/* Text Info (Brief) */}
                <div style={{ padding: '0 2px' }}>
                  <h3 style={{ 
                    fontSize: '11px', 
                    fontWeight: '800', 
                    color: '#333', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {item.foodName}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
