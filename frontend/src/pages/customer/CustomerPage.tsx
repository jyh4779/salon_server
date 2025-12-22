import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Layout, theme, Typography, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { formatPhoneNumber } from '../../utils/format';
import { getCustomers, CustomerStats } from '../../api/customers';
import NewCustomerModal from '../../components/common/NewCustomerModal';

const { Content } = Layout;
const { Title } = Typography;

const CustomerPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [customers, setCustomers] = useState<CustomerStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

    const fetchCustomers = async (search?: string) => {
        setLoading(true);
        try {
            const data = await getCustomers(search);
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearch = (value: string) => {
        setSearchText(value);
        fetchCustomers(value);
    };

    const columns: ColumnsType<CustomerStats> = [
        {
            title: '고객명',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <a onClick={() => navigate(`/client/${record.id}`)} style={{ fontWeight: 'bold' }}>
                    {text}
                </a>
            ),
        },
        {
            title: '연락처',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone: string) => formatPhoneNumber(phone),
        },
        {
            title: '성별',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender) => (
                <Tag color={gender === 'MALE' ? 'blue' : 'magenta'}>
                    {gender === 'MALE' ? '남' : '여'}
                </Tag>
            ),
        },
        {
            title: '등급',
            dataIndex: 'grade',
            key: 'grade',
            render: (grade) => {
                let color = 'default';
                let label = grade;

                if (grade === 'VIP') { color = 'gold'; label = 'VIP'; }
                else if (grade === 'CAUTION') { color = 'red'; label = '주의'; }
                else if (grade === 'NEW') { color = 'green'; label = '신규'; }
                else if (grade === 'NORMAL') { color = 'blue'; label = '일반'; } // Changed default color to blue for visibility

                return <Tag color={color}>{label}</Tag>;
            },
        },
        {
            title: '방문횟수',
            dataIndex: 'visit_count',
            key: 'visit_count',
            sorter: (a, b) => a.visit_count - b.visit_count,
            render: (count) => `${count}회`,
        },
        {
            title: '최근 방문일',
            dataIndex: 'last_visit',
            key: 'last_visit',
            sorter: (a, b) => {
                const dateA = a.last_visit ? new Date(a.last_visit).getTime() : 0;
                const dateB = b.last_visit ? new Date(b.last_visit).getTime() : 0;
                return dateA - dateB;
            },
            render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
        },
        {
            title: '총 결제금액',
            dataIndex: 'total_pay',
            key: 'total_pay',
            sorter: (a, b) => a.total_pay - b.total_pay,
            render: (price) => `${price.toLocaleString()}원`,
        },
        {
            title: '메모',
            dataIndex: 'memo',
            key: 'memo',
            render: (text) => (
                <div style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 200
                }} title={text}>
                    {text}
                </div>
            ),
        },
    ];

    return (
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div
                style={{
                    padding: 24,
                    minHeight: 360,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>고객 관리</Title>
                    <Space>
                        <Space.Compact style={{ width: 250 }}>
                            <Input
                                placeholder="이름 또는 전화번호 검색"
                                allowClear
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    if (e.target.value === '') handleSearch('');
                                }}
                                onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                            />
                            <Button type="primary" onClick={() => handleSearch(searchText)}>검색</Button>
                        </Space.Compact>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsNewCustomerModalOpen(true)}
                        >
                            신규 고객 등록
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={customers}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />

                <NewCustomerModal
                    isOpen={isNewCustomerModalOpen}
                    onClose={() => setIsNewCustomerModalOpen(false)}
                    onSuccess={(newCustomer) => {
                        console.log('New customer created:', newCustomer);
                        fetchCustomers(searchText); // Refresh list
                    }}
                />
            </div>
        </Content>
    );
};

export default CustomerPage;
