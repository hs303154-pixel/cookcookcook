import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PremiumCard from '../components/PremiumCard';

const HistoryDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { foodName, image, cachedData } = location.state || {};

  const [lang, setLang] = useState('ko');
  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'ko');
  }, []);

  const t = {
    ko: {
      home: '처음으로',
      viewHistory: '요리보기',
      nutriTitle: '영양 성분 리포트',
      cal: '칼로리', pro: '단백질', car: '탄수화물', fat: '지방',
      ingTitle: '신선한 재료 정보',
      serving: '1인분 기준',
      recTitle: '단계별 조리 레시피',
      tipsTitle: '시크릿 꿀팁!',
      making: '만들기'
    },
    en: {
      home: 'Home',
      viewHistory: 'History',
      nutriTitle: 'Nutrition Report',
      cal: 'Calories', pro: 'Protein', car: 'Carbs', fat: 'Fat',
      ingTitle: 'Fresh Ingredients',
      serving: '1 Serving',
      recTitle: 'Step-by-Step Recipe',
      tipsTitle: 'Secret Tips!',
      making: 'Recipe'
    }
  }[lang] || {};

  if (!cachedData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '24px', textAlign: 'center' }}>
        <p>데이터를 불러올 수 없습니다.</p>
        <button onClick={() => navigate('/history')} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '12px' }}>
          {t.viewHistory}
        </button>
      </div>
    );
  }

  const data = cachedData;
  const displayName = foodName || data.foodName;
  const displayImage = image;

  return (
    <div style={{ padding: '0', backgroundColor: '#FFFFFF', minHeight: '100vh', paddingBottom: '140px' }}>
      {/* Visual Header */}
      <div style={{ padding: '40px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ 
          width: '220px', 
          height: '220px', 
          borderRadius: '35px', 
          overflow: 'hidden', 
          boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <img 
            src={displayImage} 
            alt={displayName} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'; }}
          />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary-navy)', textAlign: 'center' }}>{displayName}</h1>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Nutrition Card */}
        <section style={{ backgroundColor: '#F8FBF9', padding: '28px 24px', borderRadius: '30px', marginBottom: '40px', border: '1px solid #EAF6ED' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            📊 {t.nutriTitle}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#F1F5F9', width: '100%', aspectRatio: '1', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800' }}>{t.cal}</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--primary-green)' }}>{data.nutrition.calories}kcal</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#F1F5F9', width: '100%', aspectRatio: '1', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800' }}>{t.pro}</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#3b82f6' }}>{data.nutrition.protein}g</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#F1F5F9', width: '100%', aspectRatio: '1', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800' }}>{t.car}</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#f59e0b' }}>{data.nutrition.carbs}g</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#F1F5F9', width: '100%', aspectRatio: '1', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800' }}>{t.fat}</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#ef4444' }}>{data.nutrition.fat}g</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section style={{ marginBottom: '44px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary-navy)' }}>{t.ingTitle}</h2>
            <span style={{ fontSize: '14px', color: 'var(--primary-green)', fontWeight: '800' }}>{data.servingSize || t.serving}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.ingredients && data.ingredients.map((group, idx) => (
              <div key={idx} style={{ backgroundColor: '#F9FAFB', padding: '22px', borderRadius: '24px', border: '1px solid #F1F3F5' }}>
                <h3 style={{ fontSize: '15px', color: 'var(--primary-green)', fontWeight: '900', marginBottom: '16px' }}>{group.name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {group.items.map((item, i) => (
                    <span key={i} style={{ backgroundColor: 'white', padding: '10px 18px', borderRadius: '15px', fontSize: '14px', border: '1px solid #EAECEE', fontWeight: '600' }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Instructions Section */}
        <section style={{ marginBottom: '44px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px', color: 'var(--primary-navy)' }}>🥘 {displayName} {t.making}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {data.instructions && data.instructions.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '22px' }}>
                <div style={{ flexShrink: 0, position: 'relative' }}>
                  <div style={{ backgroundColor: 'var(--primary-green)', color: 'white', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '900' }}>{idx + 1}</div>
                  {idx < data.instructions.length - 1 && <div style={{ position: 'absolute', top: '32px', left: '15px', width: '2px', bottom: '-32px', backgroundColor: '#F1F3F5' }}></div>}
                </div>
                <p style={{ fontSize: '15px', color: '#4A5568', lineHeight: '1.8', fontWeight: '500' }}>{step.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Chef's Tips */}
        <PremiumCard title={t.tipsTitle} icon="💡" gradient={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.tips && data.tips.map((tip, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', fontSize: '15px', color: '#2D6A4F', lineHeight: '1.7', fontWeight: '600' }}>
                <span>✨</span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Floating Buttons Bar */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 'max(0px, calc(50% - 240px))', width: 'min(100%, 480px)', 
        padding: '20px 24px 40px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', 
        borderTop: '1px solid #f1f5f9', zIndex: 10, display: 'flex', gap: '12px' 
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            flex: 1, backgroundColor: '#F1F3F5', color: '#495057', padding: '18px', 
            borderRadius: '20px', fontWeight: '800', fontSize: '16px', border: 'none', cursor: 'pointer' 
          }}
        >
          {t.home}
        </button>
        <button 
          onClick={() => navigate('/history')}
          style={{ 
            flex: 1.5, backgroundColor: 'var(--primary-green)', color: 'white', padding: '18px', 
            borderRadius: '20px', fontWeight: '800', fontSize: '16px', border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
          }}
        >
          {t.viewHistory}
        </button>
      </div>
    </div>
  );
};

export default HistoryDetailPage;
