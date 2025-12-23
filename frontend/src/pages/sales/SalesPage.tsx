import React, { useEffect, useState, useRef } from 'react';
import { Layout, Typography, Card, Table, DatePicker, Row, Col, Statistic, message, Tabs, Button, Tag } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { getDailySales, DailySalesData, SalesTransaction } from '../../api/sales';
import { COLORS } from '../../constants/colors';

const { Content } = Layout;
const { Title } = Typography;



const SalesPage: React.FC = () => {
    const navigate = useNavigate();
    const { shopId } = useParams<{ shopId: string }>();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<DailySalesData | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [chartWidth, setChartWidth] = useState(0);
    const observer = useRef<ResizeObserver | null>(null);

    const onResizeRef = (node: HTMLDivElement | null) => {
        if (node) {
            if (observer.current) observer.current.disconnect();

            observer.current = new ResizeObserver((entries) => {
                const width = entries[0]?.contentRect.width;
                if (width && width > 0) {
                    setChartWidth(width);
                }
            });

            observer.current.observe(node);

            if (node.offsetWidth > 0) {
                setChartWidth(node.offsetWidth);
            }
        } else {
            if (observer.current) observer.current.disconnect();
        }
    };

    useEffect(() => {
        fetchSales(date.format('YYYY-MM-DD'));
    }, [date, shopId]);

    const fetchSales = async (dateStr: string) => {
        if (!shopId) return;
        setLoading(true);
        try {
            const result = await getDailySales(Number(shopId), dateStr);
            setData(result);
        } catch (error) {
            console.error(error);
            message.error('매출 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // Transform data for row spanning
    const expandedDatas = React.useMemo(() => {
        if (!data?.reservations) return [];
        const result: any[] = [];

        data.reservations.forEach((reservation) => {
            const payments = reservation.payments && reservation.payments.length > 0
                ? reservation.payments
                : [{ type: '', amount: 0 }]; // Placeholder for no payment

            payments.forEach((payment, index) => {
                result.push({
                    ...reservation,
                    key: `${reservation.id}-${index}`, // Unique key
                    rowSpan: index === 0 ? payments.length : 0,
                    paymentDetail: payment,
                });
            });
        });

        return result;
    }, [data]);

    const transactionColumns = [
        {
            title: '시간',
            dataIndex: 'time',
            key: 'time',
            render: (time: string) => dayjs(time).format('HH:mm'),
            sorter: (a: SalesTransaction, b: SalesTransaction) => new Date(a.time).getTime() - new Date(b.time).getTime(),
            onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                if (status === 'NOSHOW') return <Tag color="error">노쇼</Tag>;
                if (status === 'CANCELED') return <Tag color="default">취소</Tag>;
                return <Tag color="success">완료</Tag>;
            },
            onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        },
        {
            title: '고객명',
            dataIndex: 'customer',
            key: 'customer',
            render: (text: string, record: SalesTransaction) => (
                <a onClick={() => navigate(`/shops/${shopId}/client/${record.customerId}`)} style={{ fontWeight: 'bold' }}>
                    {text}
                </a>
            ),
            onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        },
        {
            title: '시술 내역',
            dataIndex: 'menus',
            key: 'menus',
            onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        },
        {
            title: '담당 디자이너',
            dataIndex: 'designer',
            key: 'designer',
            onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        },
        {
            title: '결제 수단',
            dataIndex: 'paymentDetail',
            key: 'paymentDetail',
            render: (payment: any) => {
                const type = payment.type;
                if (!type) return <Tag>미결제</Tag>;
                if (type === 'SITE_CARD') return <Tag color="blue">💳 카드</Tag>;
                if (type === 'SITE_CASH') return <Tag color="green">💵 현금</Tag>;
                if (type === 'PREPAID') return <Tag color="gold">🅿️ 선불권</Tag>;
                if (type === 'APP_DEPOSIT') return <Tag color="purple">📱 앱결제</Tag>;
                return <Tag>{type}</Tag>;
            }
        },
        {
            title: '결제 금액',
            dataIndex: 'paymentDetail', // Use paymentDetail to get specific amount
            key: 'amount', // Changed key to generic amount
            render: (payment: any) => `${payment.amount.toLocaleString()}원`,
            align: 'right' as const,
        },
    ];

    const designerColumns = [
        {
            title: '디자이너',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
        },
        {
            title: '시술 건수',
            dataIndex: 'count',
            key: 'count',
            align: 'right' as const,
            render: (count: number) => `${count}건`,
        },
        {
            title: '객단가',
            dataIndex: 'avgTicket',
            key: 'avgTicket',
            align: 'right' as const,
            render: (price: number) => `${price.toLocaleString()}원`,
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

    const menuColumns = [
        {
            title: '카테고리',
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
            title: '매출 기여도',
            dataIndex: 'value',
            key: 'value',
            align: 'right' as const,
            render: (value: number) => {
                const total = data?.menuStats.reduce((acc, curr) => acc + curr.value, 0) || 1; // Sum of category stats
                const percent = ((value / total) * 100).toFixed(1);
                return (
                    <span>
                        <span style={{ marginRight: 8 }}>{percent}%</span>
                        <span style={{ color: COLORS.STATS.POSITIVE, fontWeight: 'bold' }}>{value.toLocaleString()}원</span>
                    </span>
                );
            },
            sorter: (a: any, b: any) => a.value - b.value,
        },
    ];

    const items = [
        {
            key: '1',
            label: '일간 리포트',
            children: (
                <>
                    {/* Section 1: Service Revenue (시술 실적) */}
                    <Card title="오늘의 시술 실적 (Revenue)" variant="borderless" style={{ marginBottom: 24 }}>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title="총 시술 매출"
                                    value={data?.revenue?.total || 0}
                                    precision={0}
                                    suffix="원"
                                    valueStyle={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}
                                />
                                <div style={{ color: '#888', fontSize: '12px', marginTop: 4 }}>
                                    * 디자이너 인센티브 산정 기준
                                </div>
                            </Col>
                            <Col span={6}>
                                <Statistic title="카드 매출" value={data?.revenue?.breakdown?.card || 0} suffix="원" />
                            </Col>
                            <Col span={6}>
                                <Statistic title="현금 매출" value={data?.revenue?.breakdown?.cash || 0} suffix="원" />
                            </Col>
                            <Col span={6}>
                                <Statistic title="선불권 사용 (차감)" value={data?.revenue?.breakdown?.prepaid || 0} suffix="원" valueStyle={{ color: '#faad14' }} />
                            </Col>
                        </Row>
                    </Card>

                    {/* Section 2: Cash Flow (입금 현황) */}
                    <Card title="실제 입금 현황 (Cash Flow)" variant="borderless" style={{ marginBottom: 24 }}>
                        <Table
                            dataSource={[
                                { key: '1', type: '현장 카드 결제', amount: data?.cashFlow?.breakdown?.site_card || 0 },
                                { key: '2', type: '현장 현금 결제', amount: data?.cashFlow?.breakdown?.site_cash || 0 },
                                { key: '3', type: '선불권 충전 (카드)', amount: data?.cashFlow?.breakdown?.prepaid_charge_card || 0 },
                                { key: '4', type: '선불권 충전 (현금)', amount: data?.cashFlow?.breakdown?.prepaid_charge_cash || 0 },
                            ]}
                            columns={[
                                { title: '구분', dataIndex: 'type', key: 'type' },
                                {
                                    title: '금액',
                                    dataIndex: 'amount',
                                    key: 'amount',
                                    align: 'right',
                                    render: (val: number) => `${val.toLocaleString()}원`
                                }
                            ]}
                            pagination={false}
                            summary={(pageData) => {
                                let total = 0;
                                pageData.forEach(({ amount }) => { total += amount; });
                                return (
                                    <>
                                        <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
                                            <Table.Summary.Cell index={0}>실제 입금액 합계 (포스기 마감)</Table.Summary.Cell>
                                            <Table.Summary.Cell index={1} align="right">
                                                <span style={{ color: COLORS.STATS.POSITIVE }}>{total.toLocaleString()}원</span>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={2}>
                                                <div style={{ color: '#888', fontSize: '12px', textAlign: 'right' }}>
                                                    ※ 선불권 사용액({(data?.revenue?.breakdown?.prepaid || 0).toLocaleString()}원)은 이미 선수금으로 입금된 금액이므로 합계에서 제외됩니다.
                                                </div>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </>
                                );
                            }}
                        />
                    </Card>

                    {/* Transaction Detail Table */}
                    <Table
                        columns={transactionColumns}
                        dataSource={expandedDatas}
                        rowKey="key" // Used unique key from transformation
                        loading={loading}
                        pagination={{ pageSize: 20 }} // Pagination might behave fully on rows, which isn't ideal for "reservation count", but acceptable for now.
                        bordered
                        title={() => `상세 내역 (${date.format('YYYY-MM-DD')})`}
                    />
                </>
            ),
        },
        {
            key: '2',
            label: '디자이너별 매출',
            children: (
                <Table
                    columns={designerColumns}
                    dataSource={data?.designerStats || []}
                    rowKey="name"
                    loading={loading}
                    pagination={false}
                    bordered
                    title={() => `디자이너별 실적 분석`}
                />
            ),
        },
        {
            key: '3',
            label: '시술 카테고리 분석',
            children: (
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Card title="카테고리별 매출 비중" variant="borderless">
                            <div ref={onResizeRef} style={{ width: '100%', height: 300, minWidth: 300 }}>
                                {chartWidth > 0 && (
                                    <PieChart width={chartWidth} height={300}>
                                        <Pie
                                            data={(data?.menuStats || []) as any}
                                            dataKey="value" // 'value' from backend mapping (re-mapped to value: totalSales)
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            isAnimationActive={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {/* @ts-ignore */}
                                            {data?.menuStats.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.CHARTS[index % COLORS.CHARTS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                                        <Legend />
                                    </PieChart>
                                )}
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Table
                            columns={menuColumns}
                            dataSource={data?.menuStats || []}
                            rowKey="name"
                            loading={loading}
                            pagination={false}
                            bordered
                            title={() => `상세 데이터`}
                        />
                    </Col>
                </Row>
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

                <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} destroyOnHidden />
            </div>
        </Content>
    );
};

export default SalesPage;
