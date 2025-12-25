import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ResidentDashboard from './pages/ResidentDashboard';
import FlatsManagement from './pages/FlatsManagement';
import MonthlyCharges from './pages/MonthlyCharges';
import Payments from './pages/Payments';
import DuesManagement from './pages/DuesManagement';
import PaymentSuccess from './pages/PaymentSuccess';
import './App.css';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flats"
            element={
              <ProtectedRoute role="admin">
                <FlatsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/charges"
            element={
              <ProtectedRoute role="admin">
                <MonthlyCharges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute role="admin">
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

const DashboardRouter = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }
  
  return <ResidentDashboard />;
};

export default App;
