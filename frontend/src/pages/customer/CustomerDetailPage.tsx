import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Card, Descriptions, Tag, Table, List, Flex, Skeleton, Button, message, Modal, Input, Space } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getCustomer, CustomerDetail, createMemo } from '../../api/customers';
import { formatPhoneNumber } from '../../utils/format';
import ReservationDetailModal from '../../components/schedule/ReservationDetailModal';

const { Content } = Layout;
const { Title, Text } = Typography;

const CustomerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
    const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
    const [memoContent, setMemoContent] = useState('');
    const [isMemoSubmitting, setIsMemoSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCustomer(parseInt(id));
        }
    }, [id]);

    const fetchCustomer = async (customerId: number) => {
        try {
            setLoading(true);
            const data = await getCustomer(customerId);
            setCustomer(data);
        } catch (error) {
            console.error(error);
            message.error('고객 정보를 불러오는데 실패했습니다.');
            navigate('/client');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMemo = async () => {
        if (!memoContent.trim()) {
            message.warning('메모 내용을 입력해주세요.');
            return;
        }
        if (!id) return;

        try {
            setIsMemoSubmitting(true);
            await createMemo(parseInt(id), memoContent);
            message.success('메모가 저장되었습니다.');
            setMemoContent('');
            setIsMemoModalOpen(false);
            fetchCustomer(parseInt(id)); // Refresh list
        } catch (error) {
            console.error(error);
            message.error('메모 저장에 실패했습니다.');
        } finally {
            setIsMemoSubmitting(false);
        }
    };

    const getGradeColor = (grade?: string) => {
        switch (grade) {
            case 'VIP': return 'gold';
            case 'CAUTION': return 'red';
            case 'NEW': return 'green';
            default: return 'blue';
        }
    };

    if (loading) {
        return (
            <Content style={{ margin: '24px 16px 0', padding: 24, background: '#fff' }}>
                <Skeleton active />
            </Content>
        );
    }

    if (!customer) return null;

    const historyColumns = [
        {
            title: '날짜',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                let text = status;
                if (status === 'COMPLETED') { color = 'green'; text = '시술완료'; }
                else if (status === 'NOSHOW') { color = 'red'; text = '노쇼'; }
                else if (status === 'CANCELED') { color = 'gray'; text = '취소'; }
                else if (status === 'CONFIRMED') { color = 'blue'; text = '예약확정'; }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: '시술 내역',
            dataIndex: 'menus',
            key: 'menus',
        },
        {
            title: '디자이너',
            dataIndex: 'designer',
            key: 'designer',
        },
        {
            title: '결제금액',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `${price.toLocaleString()}원`,
        },
    ];

    return (
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                {/* Header */}
                <Flex align="center" gap="middle" style={{ marginBottom: 24 }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/client')}
                        type="text"
                    />
                    <Title level={3} style={{ margin: 0 }}>
                        {customer.name}
                    </Title>
                    <Tag color={getGradeColor(customer.grade)}>{customer.grade || 'NORMAL'}</Tag>
                </Flex>

                <Flex gap="large" vertical>
                    {/* Basic Info */}
                    <Card title="기본 정보" size="small">
                        <Descriptions layout="vertical" column={4}>
                            <Descriptions.Item label="연락처">{formatPhoneNumber(customer.phone)}</Descriptions.Item>
                            <Descriptions.Item label="성별">{customer.gender === 'MALE' ? '남성' : '여성'}</Descriptions.Item>
                            <Descriptions.Item label="총 방문">{customer.visit_count}회</Descriptions.Item>
                            <Descriptions.Item label="총 결제">{customer.total_pay.toLocaleString()}원</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Flex gap="large" style={{ minHeight: 400 }}>
                        {/* History */}
                        <Card title="시술 이력" style={{ flex: 2 }} size="small">
                            <Table
                                dataSource={customer.history}
                                columns={historyColumns}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                                size="small"
                                onRow={(record) => ({
                                    onClick: () => {
                                        setSelectedReservationId(record.id.toString());
                                        setIsModalOpen(true);
                                    },
                                    style: { cursor: 'pointer' }
                                })}
                            />
                        </Card>

                        {/* Memos */}
                        <Card
                            title="메모"
                            style={{ flex: 1 }}
                            size="small"
                            extra={<Button icon={<PlusOutlined />} size="small" onClick={() => setIsMemoModalOpen(true)} />}
                        >
                            <List
                                dataSource={customer.memos}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={
                                                <Flex justify="space-between" align="center">
                                                    <Space>
                                                        {item.type === 'RESERVATION' ? <Tag color="blue">예약</Tag> : <Tag color="default">일반</Tag>}
                                                        <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.created_at).format('YYYY-MM-DD')}</Text>
                                                    </Space>
                                                </Flex>
                                            }
                                            description={<Text style={{ whiteSpace: 'pre-wrap', display: 'block', marginTop: 8 }}>{item.content}</Text>}
                                        />
                                    </List.Item>
                                )}
                                locale={{ emptyText: '등록된 메모가 없습니다.' }}
                                style={{ maxHeight: 400, overflowY: 'auto' }}
                            />
                        </Card>
                    </Flex>
                </Flex>
            </div>
            <ReservationDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                reservationId={selectedReservationId}
                onUpdate={() => {
                    if (id) fetchCustomer(parseInt(id));
                }}
            />
            <Modal
                title="새 메모 추가"
                open={isMemoModalOpen}
                onOk={handleCreateMemo}
                onCancel={() => setIsMemoModalOpen(false)}
                confirmLoading={isMemoSubmitting}
            >
                <Input.TextArea
                    rows={4}
                    value={memoContent}
                    onChange={(e) => setMemoContent(e.target.value)}
                    placeholder="메모 내용을 입력하세요."
                />
            </Modal>
        </Content>
    );
};

export default CustomerDetailPage;
