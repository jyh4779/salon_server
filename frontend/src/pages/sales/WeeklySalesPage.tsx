import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Layout, Typography, Card, Table, DatePicker, Row, Col, Statistic, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LabelList } from 'recharts';
import { getWeeklySales, WeeklySalesData } from '../../api/sales';
import { COLORS } from '../../constants/colors';

// Extend dayjs plugins for current file scope if needed, though usually global is better
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(isoWeek);

const { Content } = Layout;
const { Title } = Typography;

const ResizableChart: React.FC<{ height: number; children: (width: number) => React.ReactNode }> = ({ height, children }) => {
    const [width, setWidth] = useState(0);
    const observer = useRef<ResizeObserver | null>(null);

    const ref = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            if (observer.current) observer.current.disconnect();
            observer.current = new ResizeObserver((entries) => {
                const w = entries[0]?.contentRect.width;
                if (w && w > 0) setWidth(w);
            });
            observer.current.observe(node);
            if (node.offsetWidth > 0) setWidth(node.offsetWidth);
        } else {
            observer.current?.disconnect();
        }
    }, []);

    return (
        <div ref={ref} style={{ width: '100%', height }}>
            {width > 0 && children(width)}
        </div>
    );
};

const WeeklySalesPage: React.FC = () => {
    const { shopId } = useParams<{ shopId: string }>();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<WeeklySalesData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSales(date.format('YYYY-MM-DD'));
    }, [date, shopId]);

    const fetchSales = async (dateStr: string) => {
        if (!shopId) return;
        setLoading(true);
        try {
            const result = await getWeeklySales(Number(shopId), dateStr);
            console.log('Weekly Data:', result);
            setData(result);
        } catch (error) {
            console.error(error);
            message.error('주간 매출 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const designerColumns = [
        {
            title: '디자이너',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
            width: 150,
        },
        {
            title: '매출',
            dataIndex: 'totalSales',
            key: 'totalSales',
            align: 'right' as const,
            render: (val: number) => <span style={{ color: COLORS.STATS.POSITIVE, fontWeight: 'bold' }}>{val.toLocaleString()}원</span>,
        },
        {
            title: '건수',
            dataIndex: 'count',
            key: 'count',
            align: 'right' as const,
            render: (val: number) => `${val}건`,
        },
        {
            title: '객단가',
            dataIndex: 'avgTicket',
            key: 'avgTicket',
            align: 'right' as const,
            render: (val: number) => `${val.toLocaleString()}원`,
        },
    ];

    const renderTrendIcon = (growth: number) => {
        if (growth > 0) return <ArrowUpOutlined style={{ color: COLORS.STATS.POSITIVE }} />;
        if (growth < 0) return <ArrowDownOutlined style={{ color: COLORS.STATS.NEGATIVE }} />;
        return null;
    };

    const renderGrowth = (growth: number | null) => {
        if (growth === null) {
            return <span style={{ color: '#999', fontSize: 13 }}>전주 데이터 없음</span>;
        }
        if (growth === 0) {
            return <span style={{ color: '#333', fontSize: 14 }}>변동 없음</span>;
        }
        const color = growth > 0 ? COLORS.STATS.POSITIVE : COLORS.STATS.NEGATIVE;
        return (
            <span style={{ color, fontSize: 14 }}>
                {renderTrendIcon(growth)} {Math.abs(growth)}%
            </span>
        );
    };

    return (
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div style={{ padding: 24, background: COLORS.BACKGROUND.WHITE, minHeight: 360 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>주간 매출 리포트</Title>
                    <DatePicker
                        picker="week"
                        value={date}
                        onChange={(d) => setDate(d || dayjs())}
                        allowClear={false}
                        style={{ width: 220, textAlign: 'center' }}
                        format={(value) => `${value.startOf('isoWeek').format('YYYY.MM.DD')} ~ ${value.endOf('isoWeek').format('MM.DD')}`}
                    />
                </div>

                {/* KPI Cards */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Card variant="borderless" style={{ background: '#fafafa' }}>
                            <Statistic
                                title="이번 주 매출"
                                value={data?.summary?.totalSales || 0}
                                suffix="원"
                                valueStyle={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}
                            />
                            <div style={{ marginTop: 8 }}>
                                전주 대비 {renderGrowth(data?.summary?.totalSalesGrowth ?? null)}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card variant="borderless" style={{ background: '#fafafa' }}>
                            <Statistic
                                title="객단가"
                                value={data?.summary?.avgTicket || 0}
                                suffix="원"
                            />
                            <div style={{ marginTop: 8 }}>
                                전주 대비 {renderGrowth(data?.summary?.avgTicketGrowth ?? null)}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card variant="borderless" style={{ background: '#fafafa' }}>
                            <Statistic
                                title="총 시술 건수"
                                value={data?.summary?.count || 0}
                                suffix="건"
                            />
                            <div style={{ marginTop: 8 }}>
                                전주 대비 {renderGrowth(data?.summary?.countGrowth ?? null)}
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Main Charts Row */}
                <Row gutter={24} style={{ marginBottom: 24 }}>
                    <Col span={24}>
                        <Card title="요일별 매출 추이 (Revenue)" variant="borderless">
                            <ResizableChart height={350}>
                                {(width) => (
                                    <BarChart width={width} height={350} data={data?.trend || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="day" />
                                        <YAxis tickFormatter={(val) => `${val / 10000}만`} />
                                        <Tooltip formatter={(val: number) => `${val.toLocaleString()}원`} cursor={{ fill: '#f8f8f8' }} />
                                        <Bar dataKey="sales" name="매출" fill={COLORS.PRIMARY} barSize={40} radius={[4, 4, 0, 0]}>
                                            <LabelList dataKey="sales" position="top" formatter={(val: number) => val > 0 ? val.toLocaleString() : ''} style={{ fill: '#666', fontSize: '12px' }} />
                                        </Bar>
                                    </BarChart>
                                )}
                            </ResizableChart>
                        </Card>
                    </Col>
                </Row>

                {/* Analysis Section */}
                <Row gutter={24}>
                    {/* Designer Stats Table */}
                    <Col xs={24} lg={10}>
                        <Card title="디자이너별 실적" variant="borderless" style={{ height: '100%' }}>
                            <Table
                                columns={designerColumns}
                                dataSource={data?.designerStats || []}
                                rowKey="name"
                                pagination={false}
                                size="small"
                            />
                        </Card>
                    </Col>

                    {/* Category Chart */}
                    <Col xs={24} md={12} lg={7}>
                        <Card title="시술 카테고리 분석" variant="borderless" style={{ height: '100%' }}>
                            <ResizableChart height={300}>
                                {(width) => (
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <PieChart width={width} height={300}>
                                            <Pie
                                                data={(data?.categoryStats || []) as any}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                            >
                                                {/* @ts-ignore */}
                                                {data?.categoryStats.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS.CHARTS[index % COLORS.CHARTS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </div>
                                )}
                            </ResizableChart>
                        </Card>
                    </Col>

                    {/* Customer Type Chart */}
                    <Col xs={24} md={12} lg={7}>
                        <Card title="신규 / 재방문 비중" variant="borderless" style={{ height: '100%' }}>
                            <ResizableChart height={300}>
                                {(width) => (
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <PieChart width={width} height={300}>
                                            <Pie
                                                data={data?.customerStats || []}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                <Cell fill={COLORS.STATS.POSITIVE} /> {/* New */}
                                                <Cell fill={COLORS.PRIMARY} /> {/* Returning */}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </div>
                                )}
                            </ResizableChart>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Content>
    );
};

export default WeeklySalesPage;
