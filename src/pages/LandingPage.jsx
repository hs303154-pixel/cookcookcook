import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import chefImg from '../assets/chef.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [lang, setLang] = useState('ko');

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'ko');
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const getLangLabel = (l) => {
    if (l === 'en') return 'English';
    if (l === 'ja') return '日本語';
    if (l === 'zh') return '中文';
    return 'Korea';
  };

  const t = {
    ko: { alert: '분석할 사진을 업로드하거나 요리 이름을 입력해 주세요!', placeholder: '텍스트', start: '분석 시작', view: '내 요리 보기' },
    en: { alert: 'Please upload a photo or enter a dish name!', placeholder: 'Dish Name', start: 'Start Analysis', view: 'View My Cooking' },
    ja: { alert: '写真をアップロードするか、料理名を入力してください！', placeholder: '料理名', start: '分析開始', view: '料理記録を見る' },
    zh: { alert: '请上传照片或输入菜名！', placeholder: '菜名', start: '开始分析', view: '我的烹饪记录' },
  }[lang] || {};

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!image && !foodName.trim()) {
      alert(t.alert);
      return;
    }
    navigate('/result', { state: { image, base64Image, foodName } });
  };

  return (
    <div className="landing-container" style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-page)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      position: 'relative'
    }}>
      
      <div style={{
          position: 'absolute',
          top: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 10
      }}>
        {['ko', 'en', 'ja', 'zh'].map((l) => (
          <button 
            key={l}
            onClick={() => changeLanguage(l)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: lang === l ? '2px solid var(--primary-green)' : '1px solid #EAECEE',
              backgroundColor: lang === l ? '#F0FDF4' : '#FFFFFF',
              fontSize: '12px',
              fontWeight: '800',
              color: lang === l ? 'var(--primary-green)' : '#94a3b8',
              cursor: 'pointer',
              boxShadow: lang === l ? '0 4px 10px rgba(39, 174, 96, 0.1)' : '0 2px 5px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease'
            }}
          >
            {getLangLabel(l)}
          </button>
        ))}
      </div>

      <div style={{ 
        width: '100%', 
        maxWidth: '320px', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        position: 'relative'
      }}>
        
        {/* Interaction Group */}
        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
          {/* Chef Illustration overlap */}
          <div style={{
            position: 'absolute',
            top: '-110px',
            right: '-50px',
            width: '160px',
            height: '240px',
            zIndex: 1,
            pointerEvents: 'none',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}>
            <img 
              src={chefImg} 
              alt="Chef" 
              style={{ 
                width: '100%', 
                height: 'auto',
                marginTop: '10px',
                mixBlendMode: 'multiply',
                filter: 'brightness(1.05) contrast(1.05)'
              }} 
            />
          </div>

          {/* Image Upload Area */}
          <label 
            htmlFor="image-upload"
            style={{ 
              width: '100%', 
              height: '100%', 
              border: '1.5px solid #000', 
              borderRadius: '12px', 
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 5
            }}
          >
            {image ? (
              <img src={image} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontSize: '60px', color: '#000', fontWeight: '200' }}>+</div>
            )}
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Input & Action Group */}
        <div style={{ 
          width: '75%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Text Input Area */}
          <div style={{ width: '100%' }}>
            <input 
              type="text"
              placeholder={t.placeholder}
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '12px', 
                border: '1.5px solid #000', 
                fontSize: '15px',
                outline: 'none',
                backgroundColor: '#FFF',
                textAlign: 'left',
                color: '#333',
                fontWeight: '500'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={handleAnalyze}
              style={{ 
                backgroundColor: 'white', 
                color: '#000', 
                padding: '14px', 
                borderRadius: '12px', 
                fontWeight: '800', 
                fontSize: '16px',
                border: '1.5px solid #000',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {t.start}
            </button>

            <button 
              onClick={() => navigate('/history')}
              style={{ 
                backgroundColor: 'white', 
                color: '#000', 
                padding: '12px', 
                borderRadius: '12px', 
                fontWeight: '800', 
                fontSize: '16px',
                border: '1.5px solid #000',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {t.view}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
