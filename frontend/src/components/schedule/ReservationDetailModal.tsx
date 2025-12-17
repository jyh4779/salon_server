import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Descriptions, message, Popconfirm, Flex, Tag, DatePicker, TimePicker, Select, Input, Switch, InputNumber } from 'antd';
import dayjs from 'dayjs';
import { ReservationDTO, CreateReservationDTO } from '../../types/reservation';
import { getReservation, updateReservation, deleteReservation, completeReservation } from '../../api/reservations';
import { getDesigners } from '../../api/designer';
import { getMenus } from '../../api/menu';
import { getShop } from '../../api/shops';
import { RESERVATION_STATUS_COLORS, STRINGS } from '../../constants/strings';
import PaymentConfirmationModal from './PaymentConfirmationModal';

interface ReservationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationId: string | null;
    onUpdate: () => void;
}

const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
    isOpen,
    onClose,
    reservationId,
    onUpdate
}) => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [reservation, setReservation] = useState<ReservationDTO | null>(null);
    const [form] = Form.useForm();

    // Payment Modal State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // Data states for Edit Mode
    const [designers, setDesigners] = useState<any[]>([]);
    const [menus, setMenus] = useState<any[]>([]);
    const [shop, setShop] = useState<any>(null);

    // Fetch details
    useEffect(() => {
        if (isOpen && reservationId) {
            setMode('view');
            getReservation(reservationId)
                .then(data => setReservation(data))
                .catch(err => {
                    console.error(err);
                    message.error('예약 정보를 불러오는데 실패했습니다.');
                    onClose();
                });
        }
    }, [isOpen, reservationId]);

    // Fetch helper data for Edit
    useEffect(() => {
        if (mode === 'edit') {
            const fetchData = async () => {
                try {
                    const [dData, mData, sData] = await Promise.all([
                        getDesigners(),
                        getMenus(),
                        getShop(1) // Default Shop ID
                    ]);
                    setDesigners(dData);
                    setMenus(mData);
                    setShop(sData);
                } catch (e) {
                    console.error(e);
                }
            };
            fetchData();
        }
    }, [mode]);

    // Initialize Form on Edit Mode
    useEffect(() => {
        if (mode === 'edit' && reservation) {
            form.setFieldsValue({
                date: dayjs(reservation.start_time),
                time: dayjs(reservation.start_time),
                designerId: reservation.designer_id,
                treatmentId: reservation.RESERVATION_ITEMS?.[0]?.menu_id,
                price: reservation.RESERVATION_ITEMS?.[0]?.price,
                status: reservation.status,
                alarm: reservation.alarm_enabled,
                memo: reservation.request_memo,
            });
        }
    }, [mode, reservation, form]);

    const handleCompleteClick = () => {
        setIsPaymentOpen(true);
    };

    const handlePaymentConfirm = async (paymentData: { totalPrice: number; paymentType: string; paymentMemo: string }) => {
        if (!reservationId) return;
        setIsCompleting(true);
        try {
            await completeReservation(reservationId, paymentData);
            message.success('시술 및 결제가 완료되었습니다.');
            onUpdate();
            setIsPaymentOpen(false);
            onClose();
        } catch (e) {
            console.error(e);
            message.error('결제 처리에 실패했습니다.');
        } finally {
            setIsCompleting(false);
        }
    };

    const handleDelete = async () => {
        if (!reservationId) return;
        try {
            await deleteReservation(reservationId);
            message.success(STRINGS.COMMON.DELETE + '되었습니다.');
            onUpdate(); // Refetch calendar
            onClose();
        } catch (e) {
            console.error(e);
            message.error('삭제에 실패했습니다.');
        }
    };

    const handleUpdate = async () => {
        if (!reservationId) return;
        try {
            const values = await form.validateFields();

            const dateStr = values.date.format('YYYY-MM-DD');
            const timeStr = values.time.format('HH:mm:00');
            const start_time = `${dateStr}T${timeStr}`;
            // Simple end_time logic: +1 hour (Same as create)
            const end_time = dayjs(start_time).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss');

            const updateData: Partial<CreateReservationDTO> = {
                designer_id: values.designerId,
                start_time: start_time,
                end_time: end_time,
                status: values.status,
                request_memo: values.memo,
                alarm_enabled: values.alarm,
                treatment_id: values.treatmentId,
                price: values.price,
                // Customer cannot be changed easily in this version (logic complexity)
            };

            await updateReservation(reservationId, updateData);
            message.success(STRINGS.COMMON.SAVE + '되었습니다.');
            onUpdate();
            onClose();
        } catch (e) {
            console.error(e);
            message.error('수정에 실패했습니다.');
        }
    };

    const disabledTime = (_current: dayjs.Dayjs) => {
        if (!shop) return {};
        const openHour = shop.open_time ? parseInt(shop.open_time.split(':')[0]) : 10;
        const closeHour = shop.close_time ? parseInt(shop.close_time.split(':')[0]) : 20;

        return {
            disabledHours: () => {
                const hours = [];
                for (let i = 0; i < 24; i++) {
                    if (i < openHour || i >= closeHour) hours.push(i);
                }
                return hours;
            },
        };
    };

    if (!reservation) return null;

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={mode === 'view' ? "예약 상세" : "예약 수정"}
            footer={null}
            destroyOnClose
        >
            {mode === 'view' ? (
                <Flex vertical gap="middle">
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="고객명">
                            {reservation.USERS.name} ({reservation.USERS.phone})
                        </Descriptions.Item>
                        <Descriptions.Item label="담당 디자이너">
                            {reservation.DESIGNERS.USERS.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="일시">
                            {dayjs(reservation.start_time).format('YYYY-MM-DD HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="시술 메뉴">
                            {reservation.RESERVATION_ITEMS?.map(item => item.menu_name).join(', ') || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="시술 금액">
                            {reservation.RESERVATION_ITEMS?.reduce((acc, item) => acc + item.price, 0).toLocaleString()}원
                        </Descriptions.Item>
                        <Descriptions.Item label="상태">
                            <Tag color={RESERVATION_STATUS_COLORS[reservation.status as keyof typeof RESERVATION_STATUS_COLORS]}>
                                {reservation.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="메모">
                            {reservation.request_memo || '-'}
                        </Descriptions.Item>
                    </Descriptions>

                    <Flex gap="small" justify="space-between">
                        <Button
                            type="primary"
                            style={{ backgroundColor: '#52c41a' }}
                            onClick={handleCompleteClick}
                            disabled={reservation.status === 'COMPLETED'}
                        >
                            ✅ 시술 완료
                        </Button>
                        <Flex gap="small">
                            <Popconfirm
                                title="정말 삭제하시겠습니까?"
                                onConfirm={handleDelete}
                                okText="예"
                                cancelText="아니오"
                            >
                                <Button danger>{STRINGS.COMMON.DELETE}</Button>
                            </Popconfirm>
                            <Button type="primary" onClick={() => setMode('edit')}>수정</Button>
                            <Button onClick={onClose}>{STRINGS.COMMON.CANCEL}</Button>
                        </Flex>
                    </Flex>
                </Flex>
            ) : (
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item label="예약 날짜" name="date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="예약 시간" name="time" rules={[{ required: true }]}>
                        <TimePicker
                            format="HH:mm"
                            minuteStep={30}
                            disabledTime={disabledTime}
                            hideDisabledOptions
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="담당 디자이너" name="designerId" rules={[{ required: true }]}>
                        <Select options={designers.map(d => ({ label: d.USERS.name, value: d.designer_id }))} />
                    </Form.Item>
                    <Flex gap="small">
                        <Form.Item label="시술 메뉴" name="treatmentId" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select
                                options={menus.map(m => ({ label: `${m.name}`, value: m.menu_id }))}
                                onChange={(value) => {
                                    // 메뉴 변경 시 기본 가격 세팅
                                    const selectedMenu = menus.find(m => m.menu_id === value);
                                    if (selectedMenu) {
                                        form.setFieldValue('price', selectedMenu.price);
                                    }
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="금액" name="price" rules={[{ required: true }]} style={{ width: '120px' }}>
                            <InputNumber
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(displayValue) => displayValue?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Flex>
                    <Form.Item label="예약 상태" name="status" rules={[{ required: true }]}>
                        <Select options={Object.keys(RESERVATION_STATUS_COLORS).map(status => ({ label: status, value: status }))} />
                    </Form.Item>
                    <Flex gap="small" align='center' style={{ marginBottom: 24 }}>
                        <span>알림 발송</span>
                        <Form.Item name="alarm" valuePropName="checked" noStyle>
                            <Switch />
                        </Form.Item>
                    </Flex>
                    <Form.Item label="메모" name="memo">
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Flex gap="small" justify="flex-end">
                        <Button onClick={() => setMode('view')}>{STRINGS.COMMON.CANCEL}</Button>
                        <Button type="primary" htmlType="submit">{STRINGS.COMMON.SAVE}</Button>
                    </Flex>
                </Form>
            )}
            <PaymentConfirmationModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onConfirm={handlePaymentConfirm}
                initialPrice={reservation.RESERVATION_ITEMS?.reduce((acc, item) => acc + item.price, 0) || 0}
                loading={isCompleting}
            />
        </Modal>
    );
};

export default ReservationDetailModal;
