import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import SchedulePage from './pages/schedule/SchedulePage';
import CustomerPage from './pages/customer/CustomerPage';

const SalesPage = () => <div>Sales Page Content</div>;
const SettingsPage = () => <div>Settings Page Content</div>;

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Navigate to="/schedule" replace />} />
                    <Route path="schedule" element={<SchedulePage />} />
                    <Route path="client" element={<CustomerPage />} />
                    <Route path="sales" element={<SalesPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
