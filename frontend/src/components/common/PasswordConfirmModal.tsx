import React, { useState } from 'react';
import { Modal, Input, Form, message } from 'antd';
import { verifyPassword } from '../../api/auth';

interface PasswordConfirmModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({ visible, onCancel, onConfirm }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await verifyPassword(values.password);

            // Password correct
            form.resetFields();
            onConfirm();
        } catch (error) {
            console.error(error);
            message.error('비밀번호가 일치하지 않습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="비밀번호 확인"
            open={visible}
            onOk={handleOk}
            confirmLoading={loading}
            onCancel={handleCancel}
            okText="확인"
            cancelText="취소"
        >
            <p>보안을 위해 비밀번호를 다시 입력해주세요.</p>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
                >
                    <Input.Password placeholder="비밀번호" onPressEnter={handleOk} autoFocus />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PasswordConfirmModal;
