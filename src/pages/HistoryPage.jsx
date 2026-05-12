import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Wikipedia Action API로 실제 요리 사진을 가져옴 (CORS 지원)
async function fetchWikiImage(foodName, searchTerm) {
  const tryFetch = async (lang, title) => {
    try {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600&origin=*`;
      const res = await fetch(url);
      const json = await res.json();
      const pages = json?.query?.pages || {};
      const page = Object.values(pages)[0];
      return page?.thumbnail?.source || null;
    } catch {
      return null;
    }
  };

  // 1. 한국어 위키 (한국 요리는 여기가 더 정확)
  const koImg = await tryFetch('ko', foodName);
  if (koImg) return koImg;

  // 2. 영어 위키 (AI가 반환한 영문 제목)
  if (searchTerm) {
    const enImg = await tryFetch('en', searchTerm);
    if (enImg) return enImg;
  }

  return null;
}

// 카드 하나 - 마운트 시 Wikipedia에서 이미지 자동 로드
function HistoryCard({ item, onDelete, onClick }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // 업로드한 사진이 저장된 경우 그대로 사용
    if (item.image && !item.image.includes('pollinations') && !item.image.includes('unsplash')) {
      setImgSrc(item.image);
      return;
    }

    // 음식 이름으로 Wikipedia에서 새로 가져오기
    const searchTerm = item.cachedData?.imageSearchTerm || null;
    fetchWikiImage(item.foodName, searchTerm).then((url) => {
      if (url) setImgSrc(url);
      else setImgError(true);
    });
  }, [item.foodName]);

  return (
    <div style={{ position: 'relative' }}>
      {/* 삭제 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
        style={{
          position: 'absolute', top: '-6px', right: '-6px',
          width: '24px', height: '24px', borderRadius: '50%',
          backgroundColor: '#FF4757', color: 'white', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
          zIndex: 2, boxShadow: '0 2px 4px rgba(255, 71, 87, 0.4)'
        }}
      >✕</button>

      {/* 이미지 + 텍스트 (클릭 시 결과 페이지로) */}
      <div onClick={onClick} style={{ cursor: 'pointer' }}>
        <div style={{
          width: '100%', paddingTop: '100%', position: 'relative',
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          border: '1px solid #F1F3F5',
          backgroundColor: '#f1f5f9'
        }}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={item.foodName}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          ) : imgError ? (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '36px'
            }}>🍽️</div>
          ) : (
            // 로딩 스켈레톤
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }} />
          )}
        </div>
        <div style={{ padding: '6px 2px 0' }}>
          <h3 style={{
            fontSize: '11px', fontWeight: '800', color: '#333',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>{item.foodName}</h3>
        </div>
      </div>
    </div>
  );
}

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
    const saved = JSON.parse(localStorage.getItem('foodHistory') || '[]');
    setHistory(saved);
  }, []);

  const handleDelete = (id) => {
    const next = history.filter(h => h.id !== id);
    setHistory(next);
    localStorage.setItem('foodHistory', JSON.stringify(next));
  };

  const handleItemClick = (item) => {
    navigate('/result', { state: { image: item.image, foodName: item.foodName, cachedData: item.cachedData } });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fcfcfc', paddingBottom: '40px' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundColor: '#FFFFFF', padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #F1F3F5'
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary-navy)' }}>{t.title}</h1>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: 'var(--primary-green)', color: 'white',
            padding: '8px 16px', borderRadius: '20px', border: 'none',
            fontWeight: '800', fontSize: '13px', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(39, 174, 96, 0.2)'
          }}
        >{t.main}</button>
      </header>

      <div style={{ padding: '20px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
            <span style={{ fontSize: '50px', marginBottom: '16px', display: 'block' }}>🍽️</span>
            <p style={{ fontSize: '16px', fontWeight: '800', color: '#CCC' }}>{t.empty}</p>
            <button
              onClick={() => navigate('/')}
              style={{ marginTop: '24px', backgroundColor: 'var(--primary-green)', color: 'white', padding: '12px 24px', borderRadius: '15px', border: 'none', fontWeight: '800', cursor: 'pointer' }}
            >{t.start}</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {history.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
