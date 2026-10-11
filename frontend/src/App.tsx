import { useState } from 'react';
import './App.css';
import ServiceSelectionPage from './components/pages/ServiceSelectionPage';
import OfficerWorkstation from './components/officer/OfficerWorkstation';
import OfficerLoginPage from './components/pages/OfficerLoginPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <BrowserRouter>
      <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-gray-900">
      

        <Routes>
       
          <Route path="/" element={<ServiceSelectionPage />} />

         
         
          <Route path="/login" element={<OfficerLoginPage />} />

         
          <Route element={<ProtectedRoute />}>  </Route>
            <Route path="/counter" element={<OfficerWorkstation />} />
             
             
        
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;