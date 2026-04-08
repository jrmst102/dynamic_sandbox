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
import { useAuth } from '../auth';

const STATS_PREFIX = 'dps_scenario_stats';

function statsKey(email) {
  return email ? `${STATS_PREFIX}_${email}` : STATS_PREFIX;
}

function loadStats(email) {
  try {
    const raw = localStorage.getItem(statsKey(email));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStats(email, stats) {
  try {
    localStorage.setItem(statsKey(email), JSON.stringify(stats));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export default function Sandbox() {
  const { user } = useAuth();
  const userEmail = user?.email;
  const [screen, setScreen] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [scenarioStats, setScenarioStats] = useState(() => loadStats(userEmail));
  const [gameKey, setGameKey] = useState(0);
  const [finalRevenue, setFinalRevenue] = useState(0);
  const [tickMode, setTickMode] = useState(null);
  const [tickHistory, setTickHistory] = useState([]);

  // Derive scores from stats for unlock logic
  const scores = Object.fromEntries(
    Object.entries(scenarioStats).map(([k, v]) => [k, v.bestScore])
  );

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

    setScenarioStats((prev) => {
      const existing = prev[currentLevel] || { bestScore: 0, attempts: 0, lastAttempt: null };
      const updated = {
        ...prev,
        [currentLevel]: {
          bestScore: Math.max(existing.bestScore, efficiency),
          attempts: existing.attempts + 1,
          lastAttempt: new Date().toISOString(),
        },
      };
      saveStats(userEmail, updated);
      return updated;
    });

    setScreen('results');
  }, [currentLevel, userEmail]);

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
          scenarioStats={scenarioStats}
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
