import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Header from './components/Header';
import GlobalDashboard from './components/GlobalDashboard';
import WilayaDashboard from './components/WilayaDashboard';
import WilayaList from './components/WilayaList';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 rtl">
          <Header />
          <main className="container mx-auto py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <GlobalDashboard />
                </ProtectedRoute>
              } />
              <Route path="/wilayas" element={
                <ProtectedRoute>
                  <WilayaList />
                </ProtectedRoute>
              } />
              <Route path="/wilaya/:id" element={
                <ProtectedRoute>
                  <WilayaDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;