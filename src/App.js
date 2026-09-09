import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Sandbox from './components/Sandbox';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pricing" element={<Sandbox />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
