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

  // 텍스트 입력 시 이름은 절대 바꾸지 않음 - 사진 분석 시에만 AI가 이름 결정
  const [analyzedName, setAnalyzedName] = useState(cachedData?.foodName || inputName || t.analyzing);
  const displayName = analyzedName;

  // 음식 이미지 검색 - Unsplash(공식 API) → Wikimedia Commons → Wikipedia 순서로 시도
  const fetchFoodImage = async (koreanName, englishTerm) => {
    const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    // 1순위: Unsplash Official API (검색 품질 최상)
    const tryUnsplash = async (term) => {
      if (!term || !unsplashKey) return null;
      try {
        // 'food dish'를 붙여 더 정확한 음식 사진 유도
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term + ' food')}&client_id=${unsplashKey}&per_page=1&content_filter=high`;
        const res = await fetch(url);
        const json = await res.json();
        const result = json?.results?.[0];
        if (!result) return null;
        
        // 결과가 문서나 텍스트 위주인지 간단히 체크 (Alt text 등에 document, text 등이 있으면 제외)
        const alt = (result.alt_description || '').toLowerCase();
        if (alt.includes('document') || alt.includes('text') || alt.includes('paper') || alt.includes('archive')) return null;
        
        return result.urls?.regular || null;
      } catch { return null; }
    };

    // 2순위: Wikimedia Commons 검색 (음식 이미지 풍부)
    const tryCommons = async (term) => {
      if (!term) return null;
      try {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json&origin=*`;
        const res = await fetch(url);
        const json = await res.json();
        const pages = json?.query?.pages || {};
        const validImg = Object.values(pages).find(p => {
          const url = p?.imageinfo?.[0]?.thumburl || '';
          const title = (p.title || '').toLowerCase();
          // 문서나 아이콘 파일 제외
          if (title.includes('document') || title.includes('text') || title.includes('icon')) return false;
          return url && /\.(jpe?g|png)/i.test(url);
        });
        return validImg?.imageinfo?.[0]?.thumburl || null;
      } catch { return null; }
    };

    // 3순위: Wikipedia 문서 썸네일 검색
    const tryWikipedia = async (lang, term) => {
      if (!term) return null;
      try {
        const url = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=600&origin=*`;
        const res = await fetch(url);
        const json = await res.json();
        const pages = json?.query?.pages || {};
        const page = Object.values(pages)[0];
        return page?.thumbnail?.source || null;
      } catch { return null; }
    };

    // 시도 순서 최적화: 가장 구체적인 검색어부터 일반적인 순으로
    const searches = [
      () => tryUnsplash(englishTerm), // AI가 생성한 최적화된 검색어
      () => tryUnsplash(`authentic ${koreanName} dish`), // 한국어 이름 조합
      () => tryUnsplash(`${englishTerm} food photography`), // 사진 퀄리티 강조
      () => englishTerm ? tryCommons(englishTerm) : null,
      () => tryCommons(koreanName),
      () => englishTerm ? tryWikipedia('en', englishTerm) : null,
      () => tryWikipedia('ko', koreanName),
    ];

    for (const search of searches) {
      const img = await search();
      if (img) return img;
    }

    return null;
  };

  const [foodImageUrl, setFoodImageUrl] = useState(image || null);
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  const displayImage = foodImageUrl || FALLBACK_IMAGE;

  // 캐시된 데이터(저장소에서 다시 볼 때)도 위키피디아 이미지 로드
  useEffect(() => {
    if (!image && cachedData?.foodName) {
      fetchFoodImage(cachedData.foodName, cachedData.imageSearchTerm).then(url => {
        if (url) setFoodImageUrl(url);
      });
    }
  }, [cachedData]);

  useEffect(() => {
    if (cachedData) return;

    const fetchAiData = async () => {
      // 1. 로컬 캐시 확인 (이미 분석한 적이 있는 요리인지)
      if (!base64Image && inputName) {
        const cached = localStorage.getItem(`ai_cache_${inputName}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setData(parsed);
            setAnalyzedName(parsed.foodName);
            setLoading(false);
            
            // 캐시된 데이터가 있어도 이미지는 다시 검색해볼 수 있음 (업데이트용)
            fetchFoodImage(parsed.foodName, parsed.imageSearchTerm).then(url => {
              if (url) setFoodImageUrl(url);
            });
            return; // API 호출 없이 종료
          } catch (e) {
            console.error("Cache parsing error", e);
          }
        }
      }

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error(t.apiKey);

        // 1. 이미지 없이 텍스트만 입력한 경우: 위키피디아 이미지 먼저 검색
        let wikiImagePromise = null;
        if (!base64Image && inputName) {
          wikiImagePromise = fetchFoodImage(inputName, null);
        }

        // 2. 프롬프트 구성 - 텍스트 전용 vs 이미지 분석 완전 분리
        let promptStr;

        if (!base64Image && inputName) {
          // ── 텍스트 전용: 요리 이름은 절대 변경하지 말 것 ──
          promptStr = `당신은 영양학 및 요리 전문 AI입니다.
          사용자가 요리 이름을 직접 입력했습니다. 아래 이름을 절대 바꾸지 마세요.
          
          요리명: "${inputName}"
          
          위 요리명을 기반으로 1인분 기준의 영양 정보, 재료, 레시피, 꿀팁을 작성하세요.
          반드시 아래 JSON 형식 그대로, 마크다운 없이 순수 JSON만 반환하세요.
          
          {
            "foodName": "${inputName}",
            "servingSize": "1인분(000g)",
            "imageSearchTerm": "A highly descriptive, visual English search term for professional food photography of this dish (e.g., 'Authentic Korean ginseng chicken soup bowl in stone pot' instead of 'Baeksuk')",
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
        } else {
          // ── 이미지 분석: 사진 보고 음식 이름 판별 ──
          promptStr = `당신은 세계 최고의 음식 인식 AI입니다.
          제공된 이미지를 보고 어떤 요리인지 정확하게 판별하세요.
          입력 힌트가 있더라도 반드시 이미지를 최우선으로 분석하세요.
          힌트: "${inputName || '이미지를 보고 요리명 판별'}"
          
          마크다운 없이 순수 JSON만 반환하세요.
          
          {
            "foodName": "정확한 한국어 요리명",
            "servingSize": "1인분(000g)",
            "imageSearchTerm": "A highly descriptive English search term for high-quality food photography of this dish (e.g., 'Korean braised spicy chicken' for Dak-bokkeum-tang)",
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
        }
        
        const currentLang = localStorage.getItem('lang') || 'ko';
        if (currentLang !== 'ko') {
          promptStr += `\n\nCRITICAL: Respond ENTIRELY in ${currentLang}. No Korean.`;
        }

        // 3. 구글 API 직접 호출 (안정적인 gemini-1.5-flash 사용)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{
            parts: [
              { text: promptStr },
              ...(base64Image ? [{
                inline_data: {
                  mime_type: base64Image.match(/data:(.*?);/)[1],
                  data: base64Image.split(',')[1]
                }
              }] : [])
            ]
          }],
          generationConfig: {
            temperature: 0.1
          }
        };

        // AI 분석과 이미지 가져오기를 동시에 시작
        const [aiResponse, earlyWikiImg] = await Promise.all([
          fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }),
          wikiImagePromise
        ]);

        if (!aiResponse.ok) {
          const errorData = await aiResponse.json();
          throw new Error(errorData.error?.message || "AI Analysis failed");
        }

        if (earlyWikiImg) setFoodImageUrl(earlyWikiImg);

        const result = await aiResponse.json();
        let responseText = result.candidates[0].content.parts[0].text;
        
        // 마크다운 백틱(```json, ```) 제거 로직 추가
        responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        const parsedData = JSON.parse(responseText);

        setData(parsedData);
        // 분석 결과 로컬 캐시에 저장
        if (!base64Image && inputName) {
          localStorage.setItem(`ai_cache_${inputName}`, JSON.stringify(parsedData));
        }

        // 텍스트 입력이면 이름 절대 안 바꿈, 이미지 분석이면 AI가 판별한 이름 사용
        const finalFoodName = (!base64Image && inputName) ? inputName : (parsedData.foodName || inputName || t.unknown);
        setAnalyzedName(finalFoodName);
        // AI가 반환한 foodName도 inputName으로 고정 (저장 시에도 동일)
        if (!base64Image && inputName) parsedData.foodName = inputName;

        // 이미지 없는 경우: AI가 반환한 imageSearchTerm으로 더 나은 이미지 재시도
        if (!base64Image) {
          if (!earlyWikiImg) {
            const finalImg = await fetchFoodImage(inputName, parsedData.imageSearchTerm);
            if (finalImg) setFoodImageUrl(finalImg);
          } else {
            // earlyImg로 가져왔어도 imageSearchTerm으로 재시도하면 더 정확할 수 있음
            const betterImg = await fetchFoodImage(inputName, parsedData.imageSearchTerm);
            if (betterImg) setFoodImageUrl(betterImg);
          }
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
              image: base64Image || displayImage,
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
