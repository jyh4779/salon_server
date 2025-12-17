import React from 'react';
import { Tabs, Typography, Layout, theme } from 'antd';
import ShopSettings from './components/ShopSettings';
import DesignerSettings from './components/DesignerSettings';
import MenuSettings from './components/MenuSettings';

const { Content } = Layout;
const { Title } = Typography;

const SettingsPage: React.FC = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const items = [
        {
            key: '1',
            label: '매장 운영',
            children: <ShopSettings />,
        },
        {
            key: '2',
            label: '디자이너 관리',
            children: <DesignerSettings />,
        },
        {
            key: '3',
            label: '시술 메뉴',
            children: <MenuSettings />,
        },
    ];

    return (
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div
                style={{
                    padding: 24,
                    minHeight: 360,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                }}
            >
                <Title level={4} style={{ marginBottom: 24 }}>설정</Title>
                <Tabs defaultActiveKey="1" items={items} />
            </div>
        </Content>
    );
};

export default SettingsPage;
