import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import PremiumCard from '../components/PremiumCard';

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { image, base64Image, text, foodName, cachedData } = location.state || {};

  const inputName = foodName || text || '';
  const [data, setData] = useState(cachedData || null);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);
  
  const [lang, setLang] = useState('ko');
  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'ko');
  }, []);
  
  const t = {
    ko: {
      analyzing: '요리 분석 중...', unknown: '알 수 없는 요리', apiKey: 'Gemini API Key가 설정되지 않았습니다.',
      loadingTitle: '요청하신 요리를 정밀 분석중입니다...', loadingSub: '수백만 개의 데이터베이스를 검색하여\n최적의 식단을 구성하고 있어요 🍲',
      errorTitle: '분석에 실패했습니다 😢', errorSub: '데이터를 불러오는 중 오류가 발생했습니다.', back: '메인으로 돌아가기',
      nutriTitle: '영양 성분 리포트', cal: '칼로리', pro: '단백질', car: '탄수화물', fat: '지방',
      ingTitle: '신선한 재료 정보', serving: '1인분 기준', recTitle: '단계별 조리 레시피',
      tipsTitle: '시크릿 꿀팁!', save: '저장하기', making: '만들기'
    },
    en: {
      analyzing: 'Analyzing dish...', unknown: 'Unknown Dish', apiKey: 'Gemini API Key is not set.',
      loadingTitle: 'Analyzing your dish precisely...', loadingSub: 'Searching millions of databases to configure the optimal diet 🍲',
      errorTitle: 'Analysis failed 😢', errorSub: 'An error occurred while fetching data.', back: 'Back to Main',
      nutriTitle: 'Nutrition Report', cal: 'Calories', pro: 'Protein', car: 'Carbs', fat: 'Fat',
      ingTitle: 'Fresh Ingredients', serving: '1 Serving', recTitle: 'Step-by-Step Recipe',
      tipsTitle: 'Secret Tips!', save: 'Save Health Analysis', making: 'Recipe'
    },
    ja: {
      analyzing: '料理を分析中...', unknown: '不明な料理', apiKey: 'APIキーが設定されていません。',
      loadingTitle: 'リクエストされた料理を精密に分析しています...', loadingSub: '数百万のデータベースを検索し、\n最適な食事プランを構成しています 🍲',
      errorTitle: '分析に失敗しました 😢', errorSub: 'データの読み込み中にエラーが発生しました。', back: 'メインに戻る',
      nutriTitle: '栄養成分レポート', cal: 'カロリー', pro: 'タンパク質', car: '炭水化物', fat: '脂質',
      ingTitle: '新鮮な食材情報', serving: '1人前', recTitle: 'ステップ別レシピ',
      tipsTitle: '秘密のヒント！', save: '分析記録を保存', making: 'の作り方'
    },
    zh: {
      analyzing: '正在分析菜品...', unknown: '未知菜品', apiKey: '未设置API密钥。',
      loadingTitle: '正在精确分析您的菜品...', loadingSub: '正在搜索数百万个数据库以配置最佳饮食 🍲',
      errorTitle: '分析失败 😢', errorSub: '获取数据时发生错误。', back: '返回首页',
      nutriTitle: '营养成分报告', cal: '卡路里', pro: '蛋白质', car: '碳水化合物', fat: '脂肪',
      ingTitle: '新鲜食材信息', serving: '1人份', recTitle: '分步食谱',
      tipsTitle: '独家秘诀！', save: '保存健康分析记录', making: '制作方法'
    }
  }[lang] || {};

  const [analyzedName, setAnalyzedName] = useState(cachedData?.foodName || inputName || t.analyzing);
  const displayName = analyzedName;

  // Wikipedia Action API (CORS 지원, 정확한 요리 사진 반환)
  const fetchWikipediaImage = async (koreanName, englishTerm) => {
    const tryFetch = async (lang, title) => {
      try {
        const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600&origin=*`;
        const res = await fetch(url);
        const json = await res.json();
        const pages = json?.query?.pages || {};
        const page = Object.values(pages)[0];
        return page?.thumbnail?.source || null;
      } catch { return null; }
    };
    const koImg = await tryFetch('ko', koreanName);
    if (koImg) return koImg;
    if (englishTerm) {
      const enImg = await tryFetch('en', englishTerm);
      if (enImg) return enImg;
    }
    return null;
  };

  const [foodImageUrl, setFoodImageUrl] = useState(image || null);
  const displayImage = foodImageUrl;

  // 캐시된 데이터(저장소에서 다시 볼 때)도 위키피디아 이미지 로드
  useEffect(() => {
    if (!image && cachedData?.foodName) {
      fetchWikipediaImage(cachedData.foodName, cachedData.imageSearchTerm).then(url => {
        if (url) setFoodImageUrl(url);
      });
    }
  }, [cachedData]);

  useEffect(() => {
    if (cachedData) return;

    const fetchAiData = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error(t.apiKey);

        // 1. 이미지가 없을 경우 위키피디아 이미지 미리 가져오기 시작 (병렬 처리)
        let wikiImagePromise = null;
        if (!image && inputName) {
          wikiImagePromise = fetchWikipediaImage(inputName);
        }

        // API 버전을 v1으로 명시하여 404 에러 방지
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest", // 2026년 표준 최신 모델 별칭 사용
          generationConfig: { temperature: 0.1 }
        }, { apiVersion: "v1" }); // 정식 API 경로(v1) 강제 사용

        let promptStr = `당신은 초고속 푸드 스캐너입니다. 
          이미지를 분석하여 JSON으로만 출력하세요. 
          반드시 1인분 기준, 자연스러운 한국어로 작성할 것.
          
          입력 힌트: "${inputName || '사진 분석'}"
          
          {
            "foodName": "요리명",
            "servingSize": "1인분(000g)",
            "imageSearchTerm": "English Wikipedia Title",
            "nutrition": {
              "calories": 0, "protein": 0, "carbs": 0, "fat": 0,
              "details": [
                { "label": "나트륨", "value": "00mg", "dv": "0%" },
                { "label": "당류", "value": "0g", "dv": "0%" },
                { "label": "식이섬유", "value": "0g", "dv": "0%" },
                { "label": "콜레스테롤", "value": "0mg", "dv": "0%" },
                { "label": "포화지방", "value": "0g", "dv": "0%" },
                { "label": "비타민/무기질", "value": "풍부", "dv": "0%" }
              ]
            },
            "ingredients": [{ "name": "재료", "items": ["재료(양)"] }],
            "instructions": [{ "title": "단계", "content": "설명" }],
            "tips": ["꿀팁"]
          }`;
        
        const currentLang = localStorage.getItem('lang') || 'ko';
        if (currentLang !== 'ko') {
          promptStr += `\n\nCRITICAL: Respond ENTIRELY in ${currentLang}. No Korean.`;
        }

        // AI 분석과 이미지 가져오기를 동시에 기다림
        const [aiResult, earlyWikiImg] = await Promise.all([
          model.generateContent([promptStr, ...(base64Image ? [{ inlineData: { data: base64Image.split(',')[1], mimeType: base64Image.match(/data:(.*?);/)[1] } }] : [])]),
          wikiImagePromise
        ]);

        if (earlyWikiImg) setFoodImageUrl(earlyWikiImg);

        const responseText = aiResult.response.text();
        let jsonStr = responseText.trim().replace(/```json|```/g, '');
        const parsedData = JSON.parse(jsonStr);

        setData(parsedData);
        setAnalyzedName(parsedData.foodName || inputName || t.unknown);

        // AI 결과에서 나온 더 정확한 검색어로 다시 이미지 확인 (미리 가져온 게 없을 경우)
        if (!earlyWikiImg && !image) {
          const finalWikiImg = await fetchWikipediaImage(parsedData.foodName, parsedData.imageSearchTerm);
          if (finalWikiImg) setFoodImageUrl(finalWikiImg);
        }
        
      } catch (err) {
        console.error("AI Analysis Error:", err);
        setError(err.message || t.errorSub);
      } finally {
        setLoading(false);
      }
    };

    fetchAiData();
  }, [inputName, base64Image, cachedData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fcfcfc', padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', border: '5px solid #e2e8f0', borderTopColor: 'var(--primary-green)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary-navy)', marginBottom: '8px' }}>{t.loadingTitle}</h2>
        <p style={{ color: '#64748b', fontSize: '15px', whiteSpace: 'pre-line' }}>{t.loadingSub}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fcfcfc', padding: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444', marginBottom: '16px' }}>{t.errorTitle}</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
        <button onClick={() => navigate('/')} style={{ backgroundColor: 'var(--primary-green)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>{t.back}</button>
      </div>
    );
  }

  return (
    <div className="result-container" style={{ padding: '0', backgroundColor: '#FFFFFF', minHeight: '100vh', paddingBottom: '140px' }}>
      {/* Visual Header - Centered Square Box */}
      <div style={{ padding: '40px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ alignSelf: 'flex-start', background: '#F4F6F7', border: 'none', width: '44px', height: '44px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ←
        </button>

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
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '-0.5px' }}>{t.cal}</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--primary-green)', letterSpacing: '-0.5px' }}>{String(data.nutrition.calories).replace(/kcal/i, '')}kcal</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#F1F5F9', width: '100%', aspectRatio: '1', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '-0.5px' }}>{t.pro}</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#3b82f6', letterSpacing: '-0.5px' }}>{String(data.nutrition.protein).replace(/g/i, '')}g</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#F1F5F9', width: '100%', aspectRatio: '1', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '-0.5px' }}>{t.car}</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#f59e0b', letterSpacing: '-0.5px' }}>{String(data.nutrition.carbs).replace(/g/i, '')}g</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: '#F1F5F9', width: '100%', aspectRatio: '1', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '-0.5px' }}>{t.fat}</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#ef4444', letterSpacing: '-0.5px' }}>{String(data.nutrition.fat).replace(/g/i, '')}g</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {data.nutrition.details && data.nutrition.details.map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ backgroundColor: '#F1F5F9', width: '100%', aspectRatio: '1', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #E2E8F0', padding: '4px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '800', letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: 'var(--primary-navy)', letterSpacing: '-0.5px' }}>{item.value}</p>
                </div>
              </div>
            ))}
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
                <h3 style={{ fontSize: '15px', color: 'var(--primary-green)', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {group.name}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {group.items.map((item, i) => (
                    <span key={i} style={{ backgroundColor: 'white', padding: '10px 18px', borderRadius: '15px', fontSize: '14px', color: '#333', border: '1px solid #EAECEE', fontWeight: '600' }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Instructions Section */}
        <section style={{ marginBottom: '44px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px', color: 'var(--primary-navy)' }}>🥘 {displayName} {t.making}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {data.instructions && data.instructions.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '22px' }}>
                <div style={{ flexShrink: 0, position: 'relative' }}>
                  <div style={{ backgroundColor: 'var(--primary-green)', color: 'white', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '900', zIndex: 1, position: 'relative' }}>
                    {idx + 1}
                  </div>
                  {idx < data.instructions.length - 1 && <div style={{ position: 'absolute', top: '32px', left: '15px', width: '2px', bottom: '-32px', backgroundColor: '#F1F3F5' }}></div>}
                </div>
                <div style={{ paddingTop: '2px' }}>
                  <p style={{ fontSize: '15px', color: '#4A5568', lineHeight: '1.8', fontWeight: '500' }}>{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chef's Tips Section - Using PremiumCard Component */}
        <PremiumCard 
          title={t.tipsTitle} 
          subtitle={lang === 'ko' ? '셰프가 알려주는 맛있는 비결' : 'Chef\'s secret to a delicious meal'}
          icon="💡"
          gradient={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.tips && data.tips.map((tip, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', fontSize: '15px', color: '#2D6A4F', lineHeight: '1.7', fontWeight: '600' }}>
                <span style={{ fontSize: '18px' }}>✨</span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Save Button Overlay */}
      <div style={{ position: 'fixed', bottom: 0, left: 'max(0px, calc(50% - 240px))', width: 'min(100%, 480px)', padding: '24px 24px 44px', backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(15px)', borderTop: '1px solid #f1f5f9', zIndex: 10 }}>
        <button 
          onClick={() => {
            const newItem = {
              id: Date.now(),
              foodName: displayName,
              image: displayImage,
              date: new Date().toLocaleDateString(),
              cachedData: data // Save the AI result so we don't have to fetch again!
            };
            const existingHistory = JSON.parse(localStorage.getItem('foodHistory') || '[]');
            localStorage.setItem('foodHistory', JSON.stringify([newItem, ...existingHistory]));
            
            navigate('/history');
          }}
          style={{ width: '100%', backgroundColor: 'var(--primary-green)', color: 'white', padding: '20px', borderRadius: '22px', fontWeight: '800', fontSize: '19px', border: 'none', cursor: 'pointer', boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)', transition: 'transform 0.2s active' }}
        >
          {t.save}
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
