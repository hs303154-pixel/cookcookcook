import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AnalysisPage = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="analysis-container" style={{ padding: '24px', backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--primary-navy)' }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '700' }}>레시피 분석</h1>
      </header>

      {/* Image Upload Box */}
      <div style={{ marginBottom: '24px' }}>
        <label 
          htmlFor="image-upload"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%', 
            height: '240px', 
            border: '2px dashed #ddd', 
            borderRadius: 'var(--radius-lg)', 
            cursor: 'pointer',
            backgroundColor: '#f9f9f9',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {image ? (
            <img src={image} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <span style={{ fontSize: '48px', marginBottom: '12px' }}>📸</span>
              <span style={{ color: '#888', fontSize: '14px' }}>분석할 음식 사진을 업로드하세요</span>
            </>
          )}
          <input 
            id="image-upload" 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>

      {/* Text Input Box */}
      <div style={{ marginBottom: '32px' }}>
        <textarea 
          placeholder="추가적인 설명이나 질문을 입력해 주세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ 
            width: '100%', 
            height: '120px', 
            padding: '16px', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid #eee', 
            backgroundColor: '#f9f9f9',
            fontSize: '15px',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Analyze Button */}
      <button 
        onClick={() => navigate('/result', { state: { image, text } })}
        style={{ 
          width: '100%', 
          backgroundColor: 'var(--primary-green)', 
          color: 'white', 
          padding: '18px', 
          borderRadius: 'var(--radius-lg)', 
          fontWeight: '700', 
          fontSize: '18px',
          boxShadow: '0 10px 20px rgba(76, 175, 80, 0.2)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        분석하기
      </button>

      {/* Simple Footer Text */}
      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#bbb' }}>
        AI가 사진을 분석하여 영양 성분과 레시피를 제안합니다.
      </p>
    </div>
  );
};

export default AnalysisPage;
