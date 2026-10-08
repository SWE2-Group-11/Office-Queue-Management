import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ServiceSelectionPage from './components/pages/ServiceSelectionPage';
import OfficerWorkstation from './components/officer/OfficerWorkstation';
// import OfficerLoginPage from './components/pages/OfficerLoginPage';
// import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ServiceSelectionPage />} />

        {/* TEMPORARY: officer login disabled, no backend support yet
        <Route path="/login" element={<OfficerLoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/counter/:counterId" element={<OfficerWorkstation />} />
        </Route>
        */}

        {/* TEMPORARY: open the counter directly, e.g. /counter/1 */}
        <Route path="/counter/:counterId" element={<OfficerWorkstation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;