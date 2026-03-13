import React, { useState, useCallback } from 'react';
import scenarios from '../scenarios';
import { calculateGrade } from '../engine';
import LevelSelect from './LevelSelect';
import ScenarioBriefing from './ScenarioBriefing';
import Gameplay from './Gameplay';
import Results from './Results';
import HelpPage from './HelpPage';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import QuickStartPage from './QuickStartPage';

export default function Sandbox() {
  const [screen, setScreen] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [scores, setScores] = useState({});
  const [gameKey, setGameKey] = useState(0);
  const [finalRevenue, setFinalRevenue] = useState(0);
  const [tickMode, setTickMode] = useState(null);
  const [tickHistory, setTickHistory] = useState([]);

  const handleSelectLevel = useCallback((index) => {
    setCurrentLevel(index);
    setScreen('briefing');
  }, []);

  const handleStartFromBriefing = useCallback((mode) => {
    setTickMode(mode);
    setGameKey((k) => k + 1);
    setScreen('playing');
  }, []);

  const handleFinish = useCallback((revenue, history) => {
    setFinalRevenue(revenue);
    setTickHistory(history || []);
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
    setScreen('briefing');
  }, []);

  const handleNext = useCallback(() => {
    if (currentLevel < scenarios.length - 1) {
      setCurrentLevel((l) => l + 1);
      setScreen('briefing');
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
    case 'briefing':
      return (
        <ScenarioBriefing
          scenario={scenario}
          onStart={handleStartFromBriefing}
          onBack={handleBack}
        />
      );
    case 'help':
      return <HelpPage onBack={handleBack} />;
    case 'quickstart':
      return <QuickStartPage onBack={handleBack} />;
    case 'terms':
      return <TermsPage onBack={handleBack} />;
    case 'privacy':
      return <PrivacyPage onBack={handleBack} />;
    case 'playing':
      return (
        <Gameplay
          key={gameKey}
          scenario={scenario}
          tickMode={tickMode}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      );
    case 'results':
      return (
        <Results
          scenario={scenario}
          totalRevenue={finalRevenue}
          tickHistory={tickHistory}
          onRetry={handleRetry}
          onNext={handleNext}
          canAdvance={currentLevel < scenarios.length - 1}
        />
      );
    default:
      return null;
  }
}
