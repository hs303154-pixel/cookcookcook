import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RecipeDetail = ({ onRecord }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);

  const handleRecord = () => {
    setIsRecording(true); // 기록 중 상태 (애니메이션 보여주기용)

    const mealName = '아보카도 훈제연어 샐러드';
    const mealCalories = 420;
    const nutrition = {
      protein: 30,
      carbs: 40,
      fat: 15
    };
    
    // 1. 데이터 기록
    onRecord(mealName, mealCalories, nutrition);
    
    // 2. 1.5초 후에 대시보드로 이동 (사용자가 성공 메시지를 볼 수 있게!)
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="recipe-detail" style={{ padding: '24px', paddingBottom: '60px', position: 'relative' }}>
      {/* 성공 메시지 오버레이 */}
      {isRecording && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(76, 175, 80, 0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>기록 완료!</h2>
          <p style={{ fontSize: '16px' }}>오늘도 건강한 한 끼 성공하셨어요!</p>
        </div>
      )}

      <button 
        onClick={() => navigate('/dashboard')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-navy)', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        ← 뒤로가기
      </button>

      <img 
        src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80" 
        alt="recipe" 
        style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }} 
      />

      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>아보카도 훈제연어 샐러드</h1>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>⏱ 15분</span>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>🔥 420 kcal</span>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>👨‍🍳 쉬움</span>
      </div>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '2px solid var(--primary-green)', display: 'inline-block' }}>재료 준비</h2>
        <ul style={{ listStyle: 'none', fontSize: '15px' }}>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>🥑 잘 익은 아보카도 1/2개</li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>🐟 훈제연어 100g</li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>🥗 샐러드 믹스 한 줌</li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>🍋 레몬 드레싱 2큰술</li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>🫒 올리브유, 통후추 약간</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '2px solid var(--primary-green)', display: 'inline-block' }}>조리 방법</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px' }}>
          <p><strong>Step 1.</strong> 샐러드 채소를 찬물에 씻어 물기를 완전히 제거한 뒤 그릇에 담아주세요.</p>
          <p><strong>Step 2.</strong> 아보카도는 껍질을 벗겨 먹기 좋은 크기로 슬라이스합니다.</p>
          <p><strong>Step 3.</strong> 훈제연어를 돌돌 말아 샐러드 위에 예쁘게 올려주세요.</p>
          <p><strong>Step 4.</strong> 준비한 레몬 드레싱과 올리브유, 통후추를 뿌리면 완성! ✨</p>
        </div>
      </section>

      <button 
        onClick={handleRecord}
        disabled={isRecording}
        style={{ marginTop: '40px', backgroundColor: isRecording ? '#ccc' : 'var(--primary-green)', color: 'white', width: '100%', padding: '16px', borderRadius: 'var(--radius-default)', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' }}
      >
        {isRecording ? '기록 중...' : '요리 완료! 식단에 기록하기 📝'}
      </button>
    </div>
  );
};

export default RecipeDetail;
