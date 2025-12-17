import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import { Spin } from 'antd';

import SchedulePage from './pages/schedule/SchedulePage';
import CustomerPage from './pages/customer/CustomerPage';
import CustomerDetailPage from './pages/customer/CustomerDetailPage';
import SalesPage from './pages/sales/SalesPage';
import SettingsPage from './pages/settings/SettingsPage';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const { isLoggedIn, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><Spin size="large" /></div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={
                        <RequireAuth>
                            <MainLayout />
                        </RequireAuth>
                    }>
                        <Route index element={<Navigate to="/schedule" replace />} />
                        <Route path="schedule" element={<SchedulePage />} />
                        <Route path="client" element={<CustomerPage />} />
                        <Route path="client/:id" element={<CustomerDetailPage />} />
                        <Route path="sales" element={<SalesPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
