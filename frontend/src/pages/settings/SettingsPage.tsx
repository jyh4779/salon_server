import React, { useState } from 'react';
import { Tabs, Typography, Layout, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import PasswordConfirmModal from '../../components/common/PasswordConfirmModal';
import ShopSettings from './components/ShopSettings';
import DesignerSettings from './components/DesignerSettings';
import MenuSettings from './components/MenuSettings';
import CategorySettings from './components/CategorySettings';
import PrepaidSettings from './components/PrepaidSettings';

const { Content } = Layout;
const { Title } = Typography;

const SettingsPage: React.FC = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();

    // Authentication State
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(true);

    const handleConfirm = () => {
        setIsAuthorized(true);
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        // Redirect to home or previous page if cancelled
        navigate('/');
    };

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
            label: '메뉴 카테고리',
            children: <CategorySettings />,
        },
        {
            key: '4',
            label: '시술 메뉴',
            children: <MenuSettings />,
        },
        {
            key: '5',
            label: '선불권 관리',
            children: <PrepaidSettings />,
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
                {/* Always rendered but hidden content or conditional rendering? 
                    Conditional is safer. */}
                {isAuthorized ? (
                    <>
                        <Title level={4} style={{ marginBottom: 24 }}>설정</Title>
                        <Tabs defaultActiveKey="1" items={items} />
                    </>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Typography.Text type="secondary">설정 내용에 접근하려면 비밀번호 인증이 필요합니다.</Typography.Text>
                    </div>
                )}
            </div>

            <PasswordConfirmModal
                visible={isModalVisible}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </Content>
    );
};

export default SettingsPage;
