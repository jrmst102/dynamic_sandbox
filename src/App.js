import React, { useState, useCallback } from 'react';
import scenarios from './scenarios';
import { calculateGrade } from './engine';
import LevelSelect from './components/LevelSelect';
import Gameplay from './components/Gameplay';
import Results from './components/Results';
import HelpPage from './components/HelpPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';

export default function App() {
  // Application state per spec §8.3
  const [screen, setScreen] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [scores, setScores] = useState({});
  const [gameKey, setGameKey] = useState(0);
  const [finalRevenue, setFinalRevenue] = useState(0);

  const handleSelectLevel = useCallback((index) => {
    setCurrentLevel(index);
    setGameKey((k) => k + 1);
    setScreen('playing');
  }, []);

  const handleFinish = useCallback((revenue) => {
    setFinalRevenue(revenue);
    const scenario = scenarios[currentLevel];
    const { efficiency } = calculateGrade(revenue, scenario.optimalRevenue);

    setScores((prev) => {
      const prevScore = prev[currentLevel];
      if (prevScore === undefined || efficiency > prevScore) {
        return { ...prev, [currentLevel]: efficiency };
      }
      return prev;
    });

    setScreen('results');
  }, [currentLevel]);

  const handleRetry = useCallback(() => {
    setGameKey((k) => k + 1);
    setScreen('playing');
  }, []);

  const handleNext = useCallback(() => {
    if (currentLevel < scenarios.length - 1) {
      setCurrentLevel((l) => l + 1);
      setGameKey((k) => k + 1);
      setScreen('playing');
    } else {
      setScreen('menu');
    }
  }, [currentLevel]);

  const handleBack = useCallback(() => {
    setScreen('menu');
  }, []);

  const handleNavigate = useCallback((page) => {
    setScreen(page);
  }, []);

  const scenario = scenarios[currentLevel];

  switch (screen) {
    case 'menu':
      return (
        <LevelSelect
          scores={scores}
          onSelectLevel={handleSelectLevel}
          onNavigate={handleNavigate}
        />
      );
    case 'help':
      return <HelpPage onBack={handleBack} />;
    case 'terms':
      return <TermsPage onBack={handleBack} />;
    case 'privacy':
      return <PrivacyPage onBack={handleBack} />;
    case 'playing':
      return (
        <Gameplay
          key={gameKey}
          scenario={scenario}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      );
    case 'results':
      return (
        <Results
          scenario={scenario}
          totalRevenue={finalRevenue}
          onRetry={handleRetry}
          onNext={handleNext}
          canAdvance={currentLevel < scenarios.length - 1}
        />
      );
    default:
      return null;
  }
}
