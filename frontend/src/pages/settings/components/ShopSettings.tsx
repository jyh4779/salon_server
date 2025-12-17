import React, { useEffect, useState } from 'react';
import { Form, Button, message, Checkbox, TimePicker, Input, Card, Spin } from 'antd';
import dayjs from 'dayjs';
import { getShop, updateShop, ShopDTO } from '../../../api/shops';

const daysOptions = [
    { label: '월', value: 'Mon' },
    { label: '화', value: 'Tue' },
    { label: '수', value: 'Wed' },
    { label: '목', value: 'Thu' },
    { label: '금', value: 'Fri' },
    { label: '토', value: 'Sat' },
    { label: '일', value: 'Sun' },
];

const ShopSettings: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [shop, setShop] = useState<ShopDTO | null>(null);

    const fetchShop = async () => {
        setLoading(true);
        try {
            const data = await getShop(1); // Default shop ID 1
            setShop(data);

            // Format data for Form
            form.setFieldsValue({
                ...data,
                open_time: data.open_time ? dayjs(data.open_time, 'HH:mm') : null,
                close_time: data.close_time ? dayjs(data.close_time, 'HH:mm') : null,
                closed_days: data.closed_days ? data.closed_days.split(',') : [],
            });
        } catch (error) {
            message.error('매장 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShop();
    }, []);

    const handleFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload: Partial<ShopDTO> = {
                name: values.name,
                tel: values.tel,
                address: values.address,
                open_time: values.open_time ? values.open_time.format('HH:mm') : undefined,
                close_time: values.close_time ? values.close_time.format('HH:mm') : undefined,
                closed_days: values.closed_days ? values.closed_days.join(',') : '',
            };
            console.log('[Frontend] Saving shop settings:', payload);
            await updateShop(1, payload);
            message.success('매장 정보가 저장되었습니다.');
            fetchShop(); // Refresh
        } catch (error) {
            message.error('저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !shop) return <Spin />;

    return (
        <Card title="매장 운영 설정" bordered={false}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                style={{ maxWidth: 600 }}
            >
                <Form.Item label="매장명" name="name" rules={[{ required: true }]}>
                    <Input placeholder="매장 이름을 입력하세요" />
                </Form.Item>

                <Form.Item label="전화번호" name="tel">
                    <Input placeholder="02-1234-5678" />
                </Form.Item>

                <Form.Item label="주소" name="address">
                    <Input placeholder="매장 주소" />
                </Form.Item>

                <Form.Item label="영업 시간" style={{ marginBottom: 0 }}>
                    <Form.Item
                        name="open_time"
                        style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                    >
                        <TimePicker format="HH:mm" placeholder="오픈 시간" style={{ width: '100%' }} />
                    </Form.Item>
                    <span style={{ display: 'inline-block', width: '16px', textAlign: 'center' }}>~</span>
                    <Form.Item
                        name="close_time"
                        style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                    >
                        <TimePicker format="HH:mm" placeholder="마감 시간" style={{ width: '100%' }} />
                    </Form.Item>
                </Form.Item>

                <Form.Item label="정기 휴무일" name="closed_days">
                    <Checkbox.Group options={daysOptions} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        저장
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ShopSettings;
