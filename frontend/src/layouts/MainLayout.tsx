import React, { useState } from 'react';
import { Layout, Menu, theme, Button, Space, Typography, Avatar, Flex } from 'antd';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    CalendarOutlined,
    UserOutlined,
    DollarOutlined,
    SettingOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { STRINGS } from '../constants/strings';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const { shopId } = useParams<{ shopId: string }>();
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        {
            key: `/shops/${shopId}/schedule`,
            icon: <CalendarOutlined />,
            label: STRINGS.MENU.SCHEDULE,
        },
        {
            key: `/shops/${shopId}/client`,
            icon: <UserOutlined />,
            label: STRINGS.MENU.CLIENT,
        },
        {
            key: 'sales-submenu',
            icon: <DollarOutlined />,
            label: STRINGS.MENU.SALES,
            children: [
                { key: `/shops/${shopId}/sales/daily`, label: '일간 리포트' },
                { key: `/shops/${shopId}/sales/weekly`, label: '주간 리포트' },
            ]
        },
        {
            key: `/shops/${shopId}/settings`,
            icon: <SettingOutlined />,
            label: STRINGS.MENU.SETTINGS,
        },
    ];

    const handleMenuClick = (e: { key: string }) => {
        navigate(e.key);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Select the key that matches the current path
    // Select the key that matches the current path.
    // For nested routes (like customer detail), we need to ensure we highlight the parent.
    // But for sales/daily and sales/weekly, they are distinct.
    const selectedKey = React.useMemo(() => {
        const flatItems = menuItems.flatMap(item => item.children ? item.children : [item]);

        // Exact match first
        const exactMatch = flatItems.find(item => location.pathname === item.key);
        if (exactMatch) return exactMatch.key;

        // Prefix match for detail pages (customer detail), but exclude sales overlap
        // If current path is /sales/weekly, we don't want to match /sales/daily just because they share a prefix (they don't really share prefix in full key if daily is explicit)
        // However, before we had /sales and /sales/weekly. Now we have /sales/daily and /sales/weekly.
        // So /sales/daily shouldn't match /sales/weekly.

        return flatItems.find(item => location.pathname.startsWith(item.key + '/'))?.key || `/shops/${shopId}/schedule`;
    }, [location.pathname, menuItems]);


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
                    defaultSelectedKeys={[`/shops/${shopId}/schedule`]}
                    defaultOpenKeys={['sales-submenu']}
                    selectedKeys={[selectedKey]}
                    mode="inline"
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 24px', background: colorBgContainer }}>
                    <Flex justify="end" align="center" style={{ height: '100%' }}>
                        {user && (
                            <Space size="middle">
                                <Space>
                                    <Avatar icon={<UserOutlined />} src={user.profile_img} />
                                    <Typography.Text strong>
                                        {user.name} <Typography.Text type="secondary">({user.role})</Typography.Text>
                                    </Typography.Text>
                                </Space>
                                <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} danger>
                                    로그아웃
                                </Button>
                            </Space>
                        )}
                    </Flex>
                </Header>
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
