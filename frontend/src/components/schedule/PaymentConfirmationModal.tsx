import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, Select, Input, Button, Flex } from 'antd';
import { STRINGS } from '../../constants/strings';

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { totalPrice: number; paymentType: string; paymentMemo: string }) => void;
    initialPrice: number;
    loading?: boolean;
}

const PAYMENT_TYPES = [
    { label: '카드 결제 (Site Card)', value: 'SITE_CARD' },
    { label: '현금 결제 (Site Cash)', value: 'SITE_CASH' },
    { label: '앱 입금 (App Deposit)', value: 'APP_DEPOSIT' },
];

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialPrice,
    loading = false
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (isOpen) {
            form.setFieldsValue({
                totalPrice: initialPrice,
                paymentType: 'SITE_CARD',
                paymentMemo: ''
            });
        }
    }, [isOpen, initialPrice, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onConfirm(values);
        } catch (e) {
            // validation failed
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title="시술 완료 및 결제"
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="결제 금액"
                    name="totalPrice"
                    rules={[{ required: true, message: '결제 금액을 입력해주세요.' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(displayValue) => displayValue?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                        addonAfter="원"
                    />
                </Form.Item>

                <Form.Item
                    label="결제 방법"
                    name="paymentType"
                    rules={[{ required: true, message: '결제 방법을 선택해주세요.' }]}
                >
                    <Select options={PAYMENT_TYPES} />
                </Form.Item>

                <Form.Item label="결제 메모" name="paymentMemo">
                    <Input.TextArea placeholder="특이사항이 있다면 입력해주세요." rows={3} />
                </Form.Item>

                <Flex justify="flex-end" gap="small" style={{ marginTop: 24 }}>
                    <Button onClick={onClose} disabled={loading}>{STRINGS.COMMON.CANCEL}</Button>
                    <Button type="primary" onClick={handleOk} loading={loading}>
                        결제 완료
                    </Button>
                </Flex>
            </Form>
        </Modal>
    );
};

export default PaymentConfirmationModal;
