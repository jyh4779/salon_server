import React, { useEffect, useState } from 'react';
import { Card, Statistic, Button, Modal, Form, Radio, Select, InputNumber, message, Row, Col, Divider } from 'antd';
import { WalletOutlined, PlusOutlined } from '@ant-design/icons';
import { getCustomerPrepaidBalance, getPrepaidTickets, chargePrepaid, PrepaidBalance, PrepaidTicket, ChargePrepaidRequest } from '../../../api/prepaid';

interface Props {
    shopId: number;
    customerId: number;
}

const PrepaidCard: React.FC<Props> = ({ shopId, customerId }) => {
    const [balance, setBalance] = useState<PrepaidBalance>({ balance: 0, lastUsed: null });
    const [tickets, setTickets] = useState<PrepaidTicket[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chargeType, setChargeType] = useState<'TICKET' | 'MANUAL'>('TICKET');
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
    const [form] = Form.useForm();

    const fetchBalance = async () => {
        try {
            const data = await getCustomerPrepaidBalance(shopId, customerId);
            setBalance(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [shopId, customerId]);

    const handleChargeClick = async () => {
        setIsModalOpen(true);
        // Load tickets when modal opens
        try {
            const data = await getPrepaidTickets(shopId);
            setTickets(data.filter(t => t.is_active));
        } catch (error) {
            message.error('선불권 목록 로드 실패');
        }
    };

    const handleChargeSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: ChargePrepaidRequest = {
                paymentMethod: paymentMethod // Add paymentMethod
            };

            if (chargeType === 'TICKET') {
                payload.ticketId = values.ticketId;
            } else {
                payload.amount = values.amount;
                payload.bonusAmount = values.bonusAmount || 0;
            }

            await chargePrepaid(shopId, customerId, payload);
            message.success('충전이 완료되었습니다.');
            setIsModalOpen(false);
            form.resetFields();
            fetchBalance(); // Refresh balance
        } catch (error) {
            message.error('충전 실패');
        }
    };

    return (
        <Card
            title={<span><WalletOutlined /> 선불권 / 멤버십</span>}
            size="small"
            extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleChargeClick}>충전</Button>}
        >
            <Statistic
                title="현재 잔액"
                value={balance.balance}
                precision={0}
                suffix="원"
                valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
            />
            {balance.lastUsed && (
                <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
                    마지막 사용: {new Date(balance.lastUsed).toLocaleDateString()}
                </div>
            )}

            <Modal
                title="선불권 충전"
                open={isModalOpen}
                onOk={handleChargeSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="결제 및 충전"
                cancelText="취소"
            >
                <Form form={form} layout="vertical" initialValues={{ type: 'TICKET' }}>
                    <Form.Item label="충전 방식">
                        <Radio.Group value={chargeType} onChange={e => setChargeType(e.target.value)}>
                            <Radio.Button value="TICKET">상품 선택</Radio.Button>
                            <Radio.Button value="MANUAL">직접 입력</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="결제 수단">
                        <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                            <Radio.Button value="CARD">카드</Radio.Button>
                            <Radio.Button value="CASH">현금</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Divider style={{ margin: '12px 0' }} />

                    {chargeType === 'TICKET' ? (
                        <Form.Item name="ticketId" label="선불권 상품" rules={[{ required: true, message: '상품을 선택해주세요' }]}>
                            <Select placeholder="상품을 선택하세요">
                                {tickets.map(t => (
                                    <Select.Option key={t.ticket_id} value={t.ticket_id}>
                                        {t.name} (₩{t.price.toLocaleString()} 결제 → ₩{t.credit_amount.toLocaleString()} 적립)
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    ) : (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="amount" label="결제 금액" rules={[{ required: true }]}>
                                    <InputNumber style={{ width: '100%' }} formatter={v => `₩ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v!.replace(/\₩\s?|(,*)/g, '')} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="bonusAmount" label="보너스(추가) 적립">
                                    <InputNumber style={{ width: '100%' }} formatter={v => `₩ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v!.replace(/\₩\s?|(,*)/g, '')} />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                </Form>
            </Modal>
        </Card>
    );
};

export default PrepaidCard;
