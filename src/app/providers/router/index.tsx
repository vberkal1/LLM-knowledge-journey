import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from 'pages/LandingPage';
import { JourneyPage } from 'pages/JourneyPage';
import { ReportPage } from 'pages/ReportPage';

export function AppRouter(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/journey" element={<JourneyPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
