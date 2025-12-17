import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Flex } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const { Title, Text } = Typography;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to where user came from, or home
    const from = location.state?.from?.pathname || '/';

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await login(values.email, values.password);
            message.success('로그인되었습니다.');
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Login failed:', error);
            message.error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <StyledCard>
                <Flex vertical align="center" style={{ marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 0 }}>Salon Manager</Title>
                    <Text type="secondary">관리자 로그인</Text>
                </Flex>

                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: '이메일을 입력해주세요!' }, { type: 'email', message: '유효한 이메일 형식이 아닙니다.' }]}
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="이메일" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '비밀번호를 입력해주세요!' }]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="비밀번호"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button" block loading={loading}>
                            로그인
                        </Button>
                    </Form.Item>
                </Form>
            </StyledCard>
        </Container>
    );
};

export default LoginPage;
