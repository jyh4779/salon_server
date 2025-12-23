import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, Select, Input, Button, Flex, Spin, Typography, message, List, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { STRINGS } from '../../constants/strings';
import { getCustomerPrepaidBalance } from '../../api/prepaid';

interface PaymentMethod {
    paymentType: string;
    amount: number;
}

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { totalPrice: number; payments: PaymentMethod[]; paymentMemo: string }) => void;
    initialPrice: number;
    loading?: boolean;
    shopId: number;
    customerId: number;
}

const PAYMENT_TYPES = [
    { label: '카드 결제 (Site Card)', value: 'SITE_CARD' },
    { label: '현금 결제 (Site Cash)', value: 'SITE_CASH' },
    { label: '앱 입금 (App Deposit)', value: 'APP_DEPOSIT' },
    { label: '선불권 / 멤버십 (Membership)', value: 'PREPAID' },
];

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialPrice,
    loading = false,
    shopId,
    customerId
}) => {
    const [form] = Form.useForm();
    const [prepaidBalance, setPrepaidBalance] = useState<number | null>(null);
    const [checkingBalance, setCheckingBalance] = useState(false);

    // Split Payment State
    const [payments, setPayments] = useState<PaymentMethod[]>([]);
    const [currentAmount, setCurrentAmount] = useState<number>(initialPrice);
    const [currentType, setCurrentType] = useState<string>('SITE_CARD');

    useEffect(() => {
        if (isOpen) {
            form.setFieldsValue({
                totalPrice: initialPrice,
                paymentMemo: ''
            });
            // Initial State: One empty payment or Reset?
            // User probably wants to just pay full amount with one method by default.
            setPayments([]);
            setCurrentAmount(initialPrice);
            setCurrentType('SITE_CARD');
            setPrepaidBalance(null);

            // Fetch balance proactively if needed, or just when PREPAID is selected.
            // Let's fetch it if shop/customer exist so we can show it easily.
            if (shopId && customerId) fetchBalance();
        }
    }, [isOpen, initialPrice, form, shopId, customerId]);

    const fetchBalance = async () => {
        setCheckingBalance(true);
        try {
            const data = await getCustomerPrepaidBalance(shopId, customerId);
            setPrepaidBalance(data.balance);
        } catch (e) {
            console.error(e);
            // message.error('선불권 잔액을 불러오지 못했습니다.'); // Silent fail ok?
        } finally {
            setCheckingBalance(false);
        }
    };

    const handleAddPayment = () => {
        if (currentAmount <= 0) {
            message.warning('입력 금액을 확인해주세요.');
            return;
        }

        // Check sum
        const currentSum = payments.reduce((acc, p) => acc + p.amount, 0);
        const totalPrice = form.getFieldValue('totalPrice');
        if (currentSum + currentAmount > totalPrice) {
            message.warning('총 결제 금액을 초과할 수 없습니다.');
            return;
        }

        // Prepaid Check
        if (currentType === 'PREPAID') {
            if (prepaidBalance === null) {
                message.error('선불권 정보를 불러오는 중입니다.');
                return;
            }
            if (prepaidBalance < currentAmount) {
                message.error('선불권 잔액이 부족합니다.');
                return;
            }
            // Also need to check if multiple prepaid payments exceed balance? 
            // Simplifying: Assume user adds PREPAID once or we sum them up.
            const existingPrepaidUsed = payments.filter(p => p.paymentType === 'PREPAID').reduce((acc, p) => acc + p.amount, 0);
            if (prepaidBalance < (existingPrepaidUsed + currentAmount)) {
                message.error('선불권 잔액이 부족합니다.');
                return;
            }
        }

        setPayments([...payments, { paymentType: currentType, amount: currentAmount }]);

        // Auto-set next amount
        const newSum = currentSum + currentAmount;
        const remaining = totalPrice - newSum;
        setCurrentAmount(remaining > 0 ? remaining : 0);
    };

    const handleRemovePayment = (index: number) => {
        const newPayments = [...payments];
        newPayments.splice(index, 1);
        setPayments(newPayments);

        const currentSum = newPayments.reduce((acc, p) => acc + p.amount, 0);
        const totalPrice = form.getFieldValue('totalPrice');
        setCurrentAmount(totalPrice - currentSum);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const totalPrice = values.totalPrice;
            const currentSum = payments.reduce((acc, p) => acc + p.amount, 0);

            if (currentSum !== totalPrice) {
                // If payments are empty, maybe user just wants to pay full with current selection?
                // UX decision: If list is empty, treat current inputs as the single payment?
                // Let's support that for convenience.
                if (payments.length === 0) {
                    // Verify current input
                    if (currentType === 'PREPAID') {
                        if ((prepaidBalance || 0) < currentAmount) {
                            message.error('선불권 잔액이 부족합니다.');
                            return;
                        }
                    }
                    if (currentAmount !== totalPrice) {
                        message.error('결제 금액과 수단별 금액의 합이 일치하지 않습니다.');
                        return;
                    }
                    onConfirm({
                        totalPrice,
                        payments: [{ paymentType: currentType, amount: currentAmount }],
                        paymentMemo: values.paymentMemo
                    });
                    return;
                }

                message.error(`결제 금액(${totalPrice.toLocaleString()}원)과 입력된 금액 합계(${currentSum.toLocaleString()}원)가 일치하지 않습니다.`);
                return;
            }

            onConfirm({
                totalPrice,
                payments,
                paymentMemo: values.paymentMemo
            });
        } catch (e) {
            // validation failed
        }
    };

    // Calculate remaining
    const totalPriceWatched = Form.useWatch('totalPrice', form);
    const totalP = totalPriceWatched || 0;
    const paySum = payments.reduce((acc, p) => acc + p.amount, 0);
    const remaining = totalP - paySum;

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title="시술 완료 및 복합 결제"
            footer={null}
            destroyOnHidden
            width={600}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="총 결제 금액"
                    name="totalPrice"
                    rules={[{ required: true, message: '결제 금액을 입력해주세요.' }]}
                >
                    <InputNumber
                        style={{ width: '100%', fontSize: '16px', fontWeight: 'bold' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(displayValue) => displayValue?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                        suffix="원"
                        onChange={(val) => {
                            // Reset logic if total changes?
                            // Keep simple for now
                        }}
                    />
                </Form.Item>

                <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #f0f0f0' }}>
                    <Flex justify="space-between" align="center" style={{ marginBottom: '8px' }}>
                        <Typography.Text strong>결제 수단 추가</Typography.Text>
                        {prepaidBalance !== null && (
                            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                선불권 잔액: {prepaidBalance.toLocaleString()}원
                            </Typography.Text>
                        )}
                    </Flex>
                    <Flex gap="small">
                        <Select
                            style={{ width: '200px' }}
                            value={currentType}
                            onChange={setCurrentType}
                            options={PAYMENT_TYPES}
                        />
                        <InputNumber
                            style={{ flex: 1 }}
                            value={currentAmount}
                            onChange={(val) => setCurrentAmount(val || 0)}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(displayValue) => displayValue?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                            suffix="원"
                        />
                        <Button icon={<PlusOutlined />} onClick={handleAddPayment} />
                    </Flex>
                    {currentType === 'PREPAID' && prepaidBalance !== null && (prepaidBalance < currentAmount) && (
                        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                            * 잔액이 부족합니다.
                        </div>
                    )}
                </div>

                <List
                    size="small"
                    header={<div>결제 상세 목록</div>}
                    bordered
                    dataSource={payments}
                    locale={{ emptyText: '결제 수단을 추가해주세요. (목록이 비어있으면 위 입력값으로 단일 결제됩니다)' }}
                    renderItem={(item, index) => (
                        <List.Item
                            actions={[<Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemovePayment(index)} />]}
                        >
                            <Flex justify="space-between" style={{ width: '100%' }}>
                                <span>{PAYMENT_TYPES.find(t => t.value === item.paymentType)?.label}</span>
                                <span style={{ fontWeight: 'bold' }}>{item.amount.toLocaleString()}원</span>
                            </Flex>
                        </List.Item>
                    )}
                    style={{ marginBottom: '16px' }}
                />

                <Flex justify="flex-end" style={{ marginBottom: '16px' }}>
                    <Typography.Text type={remaining === 0 ? 'success' : 'danger'}>
                        남은 금액: {remaining.toLocaleString()}원
                    </Typography.Text>
                </Flex>

                <Form.Item label="결제 메모" name="paymentMemo">
                    <Input.TextArea placeholder="특이사항이 있다면 입력해주세요." rows={2} />
                </Form.Item>

                <Flex justify="flex-end" gap="small" style={{ marginTop: 24 }}>
                    <Button onClick={onClose} disabled={loading}>{STRINGS.COMMON.CANCEL}</Button>
                    <Button type="primary" onClick={handleOk} loading={loading} disabled={remaining !== 0 && payments.length > 0}>
                        결제 완료
                    </Button>
                </Flex>
            </Form>
        </Modal>
    );
};

export default PaymentConfirmationModal;
