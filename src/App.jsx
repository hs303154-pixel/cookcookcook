import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RecipeDetail from './pages/RecipeDetail';
import AnalysisPage from './pages/AnalysisPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetailPage from './pages/HistoryDetailPage';

function App() {
  // 전체 칼로리와 영양 정보, 그리고 '식단 히스토리'를 관리하는 상태
  const [userStats, setUserStats] = useState({
    calories: 1030,
    maxCalories: 2100,
    protein: 45,
    carbs: 80,
    fat: 30,
    meals: [
      { id: 1, name: 'Chicken Breast Salad', calories: 350, time: '8:30 AM' },
      { id: 2, name: 'Brown Rice and Bulgogi', calories: 680, time: '12:30 PM' }
    ]
  });

  // 식단을 기록하는 함수 (이름도 같이 저장!)
  const recordMeal = (mealName, mealCalories, mealNutrition) => {
    const now = new Date();
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const hours = now.getHours() % 12 || 12;
    
    const newMeal = {
      id: Date.now(),
      name: mealName,
      calories: mealCalories,
      time: `${hours}:${now.getMinutes().toString().padStart(2, '0')} ${ampm}`
    };

    setUserStats(prev => ({
      ...prev,
      calories: prev.calories + mealCalories,
      protein: prev.protein + mealNutrition.protein,
      carbs: prev.carbs + mealNutrition.carbs,
      fat: prev.fat + mealNutrition.fat,
      meals: [newMeal, ...prev.meals] // 최신 기록이 위로 오게!
    }));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history-detail" element={<HistoryDetailPage />} />
        <Route 
          path="/dashboard" 
          element={<Dashboard stats={userStats} />} 
        />
        <Route 
          path="/recipe" 
          element={<RecipeDetail onRecord={recordMeal} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
