import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    CalendarOutlined,
    UserOutlined,
    DollarOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { STRINGS } from '../constants/strings';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/schedule',
            icon: <CalendarOutlined />,
            label: STRINGS.MENU.SCHEDULE,
        },
        {
            key: '/client',
            icon: <UserOutlined />,
            label: STRINGS.MENU.CLIENT,
        },
        {
            key: '/sales',
            icon: <DollarOutlined />,
            label: STRINGS.MENU.SALES,
        },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: STRINGS.MENU.SETTINGS,
        },
    ];

    const handleMenuClick = (e: { key: string }) => {
        navigate(e.key);
    };

    // Select the key that matches the current path
    const selectedKey = menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/schedule';

    return (
        <Layout style={{ height: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{
                    height: 32,
                    margin: 16,
                    background: 'rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    lineHeight: '32px',
                    color: '#fff',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}>
                    {collapsed ? 'SM' : 'Salon Manager'}
                </div>
                <Menu
                    theme="dark"
                    defaultSelectedKeys={['/schedule']}
                    selectedKeys={[selectedKey]}
                    mode="inline"
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '16px', overflowY: 'auto' }}>
                    <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
