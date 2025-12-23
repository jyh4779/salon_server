import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, InputNumber, message, Row, Col, Tag } from 'antd';
import { PrepaidTicket, getPrepaidTickets, createPrepaidTicket, CreateTicketRequest } from '../../../api/prepaid';

const PrepaidSettings: React.FC = () => {
    const { shopId } = useParams();
    const [tickets, setTickets] = useState<PrepaidTicket[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchTickets = async () => {
        setLoading(true);
        try {
            if (!shopId) return;
            const data = await getPrepaidTickets(Number(shopId));
            setTickets(data);
        } catch (error) {
            message.error('선불권 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shopId) fetchTickets();
    }, [shopId]);

    const handleCreate = () => {
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const payload: CreateTicketRequest = {
                name: values.name,
                price: values.price,
                credit_amount: values.credit_amount,
                validity_days: values.validity_days
            };

            await createPrepaidTicket(Number(shopId), payload);
            message.success('선불권이 생성되었습니다.');
            setIsModalOpen(false);
            fetchTickets();
        } catch (error) {
            message.error('저장에 실패했습니다.');
        }
    };

    const columns = [
        {
            title: '상품명',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: '판매 가격',
            dataIndex: 'price',
            key: 'price',
            render: (value: number) => `₩ ${value.toLocaleString()}`,
        },
        {
            title: '적립 금액 (실제 가치)',
            dataIndex: 'credit_amount',
            key: 'credit_amount',
            render: (value: number) => <span style={{ color: 'green', fontWeight: 'bold' }}>₩ {value.toLocaleString()}</span>,
        },
        {
            title: '혜택 (보너스)',
            key: 'bonus',
            render: (_: any, record: PrepaidTicket) => {
                const bonus = record.credit_amount - record.price;
                const percent = Math.round((bonus / record.price) * 100);
                return bonus > 0 ? (
                    <Tag color="geekblue">
                        + ₩ {bonus.toLocaleString()} ({percent}%)
                    </Tag>
                ) : <Tag>없음</Tag>;
            }
        },
        {
            title: '유효기간',
            dataIndex: 'validity_days',
            key: 'validity_days',
            render: (value: number) => `${value}일`,
        },
        {
            title: '상태',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean) => isActive ? <Tag color="success">판매중</Tag> : <Tag color="default">중단</Tag>,
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#888' }}>
                    * 고객에게 판매할 선불권 상품을 등록하고 관리합니다. 적립 금액은 실제 사용할 수 있는 금액입니다.
                </span>
                <Button type="primary" onClick={handleCreate}>+ 선불권 추가</Button>
            </div>

            <Table
                dataSource={tickets}
                columns={columns}
                rowKey="ticket_id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title="선불권 상품 등록"
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                destroyOnHidden
                okText="등록"
                cancelText="취소"
            >
                <Form form={form} layout="vertical" initialValues={{ validity_days: 365 }}>
                    <Form.Item label="상품명" name="name" rules={[{ required: true, message: '상품명을 입력해주세요' }]}>
                        <Input placeholder="예: 30만원 멤버십 (10% 추가 적립)" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="판매 가격 (결제 금액)" name="price" rules={[{ required: true, message: '판매 가격을 입력해주세요' }]}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\₩\s?|(,*)/g, '')}
                                    placeholder="300000"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="적립 금액 (실제 충전액)" name="credit_amount" rules={[{ required: true, message: '적립 금액을 입력해주세요' }]}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\₩\s?|(,*)/g, '')}
                                    placeholder="330000"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="유효기간 (일)" name="validity_days" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} placeholder="365" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PrepaidSettings;
