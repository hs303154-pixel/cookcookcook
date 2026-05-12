import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ stats }) => {
  const navigate = useNavigate();

  // 차트 퍼센트 계산
  const percentage = Math.min((stats.calories / stats.maxCalories) * 100, 100);
  const strokeDashoffset = 440 - (440 * percentage) / 100;

  return (
    <div className="dashboard-container" style={{ padding: '24px', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>안녕하세요,</p>
          <h1 style={{ fontSize: '24px' }}>대표님 👋</h1>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ddd', overflow: 'hidden' }}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Youngja" alt="profile" />
        </div>
      </header>

      {/* Daily Progress */}
      <section style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '16px' }}>오늘의 칼로리</h2>
        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 16px' }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#eee" strokeWidth="12" />
            <circle 
              cx="80" cy="80" r="70" fill="none" 
              stroke="var(--primary-green)" strokeWidth="12" 
              strokeDasharray="440" 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round" 
              transform="rotate(-90 80 80)" 
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-navy)' }}>{stats.calories.toLocaleString()}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ {stats.maxCalories.toLocaleString()} kcal</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: 'var(--radius-default)' }}>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>단백질</p>
            <p style={{ fontSize: '14px', fontWeight: '700' }}>{stats.protein}g</p>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: 'var(--radius-default)' }}>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>탄수화물</p>
            <p style={{ fontSize: '14px', fontWeight: '700' }}>{stats.carbs}g</p>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: 'var(--radius-default)' }}>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>지방</p>
            <p style={{ fontSize: '14px', fontWeight: '700' }}>{stats.fat}g</p>
          </div>
        </div>
      </section>

      {/* Recent Meal History */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>오늘의 식단 히스토리 📝</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats.meals.map(meal => (
            <div 
              key={meal.id} 
              onClick={() => navigate('/recipe')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'white', borderRadius: 'var(--radius-default)', border: '1px solid #eee', cursor: 'pointer' }}
            >
              <div>
                <p style={{ fontSize: '15px', fontWeight: '600' }}>{meal.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{meal.time}</p>
              </div>
              <p style={{ color: 'var(--primary-green)', fontWeight: '700' }}>+{meal.calories} kcal</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Recommendation */}
      <section>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>오늘의 AI 추천 식단 🥗</h2>
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '2px solid var(--accent-cyan)' }}>
          <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80" alt="meal" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px' }}>아보카도 훈제연어 샐러드</h3>
              <span style={{ backgroundColor: '#e0f7fa', color: '#00838f', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>420 kcal</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>오메가-3와 고단백질이 풍부한 완벽한 밸런스 식단입니다.</p>
            <button 
              onClick={() => navigate('/recipe')}
              style={{ backgroundColor: 'var(--primary-navy)', color: 'white', width: '100%', padding: '12px', borderRadius: 'var(--radius-default)', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
              레시피 보기
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Nav Placeholder */}
      <nav style={{ position: 'fixed', bottom: 0, left: 'max(0px, calc(50% - 240px))', width: 'min(100%, 480px)', height: '64px', backgroundColor: 'white', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 20px', zIndex: 10 }}>
        <div style={{ color: 'var(--primary-green)', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}><span style={{ fontSize: '20px' }}>🏠</span><p style={{ fontSize: '10px' }}>홈</p></div>
        <div style={{ color: '#ccc', textAlign: 'center' }}><span style={{ fontSize: '20px' }}>📝</span><p style={{ fontSize: '10px' }}>식단</p></div>
        <div style={{ color: '#ccc', textAlign: 'center' }}><span style={{ fontSize: '20px' }}>🤖</span><p style={{ fontSize: '10px' }}>코치</p></div>
        <div style={{ color: '#ccc', textAlign: 'center' }}><span style={{ fontSize: '20px' }}>⚙️</span><p style={{ fontSize: '10px' }}>설정</p></div>
      </nav>
    </div>
  );
};

export default Dashboard;
