import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Table, DatePicker, Row, Col, Statistic, message, Tabs, Button, Space } from 'antd';
import { ArrowLeftOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getDailySales, DailySalesData, SalesTransaction } from '../../api/sales';
import { COLORS } from '../../constants/colors';

const { Content } = Layout;
const { Title } = Typography;

const SalesPage: React.FC = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<DailySalesData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSales(date.format('YYYY-MM-DD'));
    }, [date]);

    const fetchSales = async (dateStr: string) => {
        setLoading(true);
        try {
            const result = await getDailySales(dateStr);
            setData(result);
        } catch (error) {
            console.error(error);
            message.error('매출 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const transactionColumns = [
        {
            title: '시간',
            dataIndex: 'time',
            key: 'time',
            render: (time: string) => dayjs(time).format('HH:mm'),
            sorter: (a: SalesTransaction, b: SalesTransaction) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        },
        {
            title: '고객명',
            dataIndex: 'customer',
            key: 'customer',
            render: (text: string, record: SalesTransaction) => (
                <a onClick={() => navigate(`/client/${record.customerId}`)} style={{ fontWeight: 'bold' }}>
                    {text}
                </a>
            ),
        },
        {
            title: '시술 내역',
            dataIndex: 'menus',
            key: 'menus',
        },
        {
            title: '담당 디자이너',
            dataIndex: 'designer',
            key: 'designer',
        },
        {
            title: '결제 수단',
            dataIndex: 'paymentType',
            key: 'paymentType',
        },
        {
            title: '결제 금액',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price: number) => `${price.toLocaleString()}원`,
            sorter: (a: SalesTransaction, b: SalesTransaction) => a.totalPrice - b.totalPrice,
            align: 'right' as const,
        },
    ];

    const statsColumns = [
        {
            title: '구분',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
        },
        {
            title: '건수',
            dataIndex: 'count',
            key: 'count',
            align: 'right' as const,
            render: (count: number) => `${count}건`,
        },
        {
            title: '총 매출',
            dataIndex: 'totalSales',
            key: 'totalSales',
            align: 'right' as const,
            render: (price: number) => <span style={{ color: COLORS.STATS.POSITIVE, fontWeight: 'bold' }}>{price.toLocaleString()}원</span>,
            sorter: (a: any, b: any) => a.totalSales - b.totalSales,
        },
    ];

    const items = [
        {
            key: '1',
            label: '일간 리포트',
            children: (
                <>
                    {/* Dashboard Stats */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="총 매출"
                                    value={data?.stats.totalSales || 0}
                                    precision={0}
                                    suffix="원"
                                    valueStyle={{ color: COLORS.STATS.POSITIVE, fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="카드/계좌"
                                    value={data?.stats.cardSales || 0}
                                    precision={0}
                                    suffix="원"
                                    valueStyle={{ color: COLORS.PRIMARY }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="현금"
                                    value={data?.stats.cashSales || 0}
                                    precision={0}
                                    suffix="원"
                                    valueStyle={{ color: COLORS.WARNING }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="총 결제 건수"
                                    value={data?.stats.count || 0}
                                    precision={0}
                                    suffix="건"
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Transaction Table */}
                    <Table
                        columns={transactionColumns}
                        dataSource={data?.reservations || []}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        bordered
                        title={() => `상세 내역 (${date.format('YYYY-MM-DD')})`}
                        summary={(pageData) => {
                            let total = 0;
                            pageData.forEach(({ totalPrice }) => {
                                total += totalPrice;
                            });
                            return (
                                <Table.Summary.Row style={{ background: COLORS.BACKGROUND.LIGHT, fontWeight: 'bold' }}>
                                    <Table.Summary.Cell index={0} colSpan={5} align="right">합계</Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <span style={{ color: COLORS.STATS.NEGATIVE }}>{total.toLocaleString()}원</span>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />
                </>
            ),
        },
        {
            key: '2',
            label: '디자이너별 매출',
            children: (
                <Table
                    columns={statsColumns}
                    dataSource={data?.designerStats || []}
                    rowKey="name"
                    loading={loading}
                    pagination={false}
                    bordered
                    title={() => `디자이너별 실적 (${date.format('YYYY-MM-DD')})`}
                />
            ),
        },
        {
            key: '3',
            label: '시술별 매출',
            children: (
                <Table
                    columns={statsColumns}
                    dataSource={data?.menuStats || []}
                    rowKey="name"
                    loading={loading}
                    pagination={false}
                    bordered
                    title={() => `시술 메뉴별 실적 (${date.format('YYYY-MM-DD')})`}
                />
            ),
        },
    ];

    return (
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div style={{ padding: 24, background: COLORS.BACKGROUND.WHITE, minHeight: 360 }}>
                {/* Header: Title and Centered Date Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ width: '200px' }}>
                        <Title level={3} style={{ margin: 0 }}>일간 매출 리포트</Title>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button
                            icon={<LeftOutlined />}
                            onClick={() => setDate(date.subtract(1, 'day'))}
                        />
                        <DatePicker
                            value={date}
                            onChange={(d) => setDate(d || dayjs())}
                            allowClear={false}
                            format="YYYY. MM. DD"
                            style={{ width: 160, textAlign: 'center' }}
                            inputReadOnly // Mobile friendly
                        />
                        <Button
                            icon={<RightOutlined />}
                            onClick={() => setDate(date.add(1, 'day'))}
                        />
                        <Button onClick={() => setDate(dayjs())}>오늘</Button>
                    </div>

                    <div style={{ width: '200px' }}>
                        {/* Spacer for centering */}
                    </div>
                </div>

                <Tabs defaultActiveKey="1" items={items} />
            </div>
        </Content>
    );
};

export default SalesPage;
