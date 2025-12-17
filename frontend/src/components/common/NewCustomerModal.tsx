import React, { useState } from 'react';
import { Modal, Form, Input, Radio, DatePicker, message } from 'antd';
import { CreateUserDTO } from '../../types/user';
import { createUser } from '../../api/user';


interface NewCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCustomer: any) => void;
    initialName?: string;
}

const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose, onSuccess, initialName = '' }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload: CreateUserDTO = {
                name: values.name,
                phone: values.phone,
                gender: values.gender,
                birthdate: values.birthdate ? values.birthdate.format('YYYYMMDD') : undefined,
                memo: values.memo,
            };

            const createdUser = await createUser(payload);
            message.success('신규 고객이 등록되었습니다.');
            onSuccess(createdUser);
            form.resetFields();
            onClose();
        } catch (error) {
            console.error(error);
            // Form validation error is handled by AntD
            if (!(error as any).errorFields) {
                message.error('고객 등록 실패');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="신규 고객 추가"
            open={isOpen}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={loading}
            okText="저장"
            cancelText="취소"
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ name: initialName, gender: 'FEMALE' }}
            >
                <Form.Item
                    name="name"
                    label="이름"
                    rules={[{ required: true, message: '이름을 입력해주세요.' }]}
                >
                    <Input placeholder="고객명 입력" />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="연락처"
                    rules={[{ required: true, message: '연락처를 입력해주세요.' }]}
                >
                    <Input placeholder="010-0000-0000" />
                </Form.Item>

                <Form.Item name="gender" label="성별">
                    <Radio.Group>
                        <Radio value="FEMALE">여성</Radio>
                        <Radio value="MALE">남성</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item name="birthdate" label="생년월일">
                    <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} placeholder="생년월일 선택" />
                </Form.Item>

                <Form.Item name="memo" label="메모">
                    <Input.TextArea rows={4} placeholder="고객 특이사항 입력" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default NewCustomerModal;
