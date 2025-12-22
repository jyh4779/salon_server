import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import ShopGuard from './components/auth/ShopGuard';
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

const HomeRedirect = () => {
    const { isLoggedIn, isLoading } = useAuth();
    const [shopId, setShopId] = useState<number | null>(null);

    React.useEffect(() => {
        if (isLoggedIn && !isLoading) {
            import('./api/shops').then(({ getMyShop }) => {
                getMyShop().then(shop => setShopId(shop.shop_id)).catch(console.error);
            });
        }
    }, [isLoggedIn, isLoading]);

    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><Spin size="large" /></div>;
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (shopId) return <Navigate to={`/shops/${shopId}/schedule`} replace />;
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><Spin size="large" /></div>;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="/shops/:shopId" element={
                        <RequireAuth>
                            <ShopGuard>
                                <MainLayout />
                            </ShopGuard>
                        </RequireAuth>
                    }>
                        <Route index element={<Navigate to="schedule" replace />} />
                        <Route path="schedule" element={<SchedulePage />} />
                        <Route path="client" element={<CustomerPage />} />
                        <Route path="client/:id" element={<CustomerDetailPage />} />
                        <Route path="sales" element={<SalesPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
