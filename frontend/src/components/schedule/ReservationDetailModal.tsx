import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Descriptions, message, Popconfirm, Flex, Tag, DatePicker, TimePicker, Select, Input, Switch, InputNumber, Tabs } from 'antd';
import dayjs from 'dayjs';
import { ReservationDTO, CreateReservationDTO } from '../../types/reservation';
import { getReservation, updateReservation, deleteReservation, completeReservation } from '../../api/reservations';
import { getDesigners } from '../../api/designer';
import { getMenus } from '../../api/menu';
import { getShop } from '../../api/shops';
import { createVisitLog, getVisitLogByReservation } from '../../api/visitLogs';
import ImageUpload from '../common/ImageUpload';
import { RESERVATION_STATUS_COLORS, STRINGS } from '../../constants/strings';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import { formatPhoneNumber, formatDateTime } from '../../utils/format';

interface ReservationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationId: string | null;
    onUpdate: () => void;
    shopId: number | null;
}

const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
    isOpen,
    onClose,
    reservationId,
    onUpdate,
    shopId
}) => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [reservation, setReservation] = useState<ReservationDTO | null>(null);
    const [form] = Form.useForm();

    // Visit Log Form States
    const [logMemo, setLogMemo] = useState('');
    const [logPhotos, setLogPhotos] = useState<string[]>([]);

    // Payment Modal State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // Data states for Edit Mode
    const [designers, setDesigners] = useState<any[]>([]);
    const [menus, setMenus] = useState<any[]>([]);
    const [shop, setShop] = useState<any>(null);
    const [dropdownLoading, setDropdownLoading] = useState(false);

    // Fetch details
    useEffect(() => {
        if (isOpen && reservationId && shopId) {
            setMode('view');
            getReservation(shopId, reservationId)
                .then(data => setReservation(data))
                .catch(err => {
                    console.error(err);
                    message.error('예약 정보를 불러오는데 실패했습니다.');
                    onClose();
                });

            // Reset Log states
            setLogMemo('');
            setLogPhotos([]);
        }
    }, [isOpen, reservationId, shopId]);

    // Fetch Visit Log
    useEffect(() => {
        if (isOpen && reservationId && shopId && reservation?.status === 'COMPLETED') {
            getVisitLogByReservation(shopId, parseInt(reservationId, 10))
                .then(data => {
                    if (data) {
                        setLogMemo(data.admin_memo || '');
                        setLogPhotos(data.photo_urls || []);
                    }
                })
                .catch(console.error);
        }
    }, [isOpen, reservationId, shopId, reservation?.status]);

    // Fetch helper data for Edit
    useEffect(() => {
        if (mode === 'edit' && shopId) {
            const fetchData = async () => {
                setDropdownLoading(true);
                try {
                    const [dData, mData, sData] = await Promise.all([
                        getDesigners(shopId),
                        getMenus(shopId),
                        getShop(shopId)
                    ]);
                    setDesigners(dData);
                    setMenus(mData);
                    setShop(sData);
                } catch (e) {
                    console.error(e);
                } finally {
                    setDropdownLoading(false);
                }
            };
            fetchData();
        }
    }, [mode, shopId]);

    // Initialize Form on Edit Mode
    useEffect(() => {
        if (mode === 'edit' && reservation) {
            form.setFieldsValue({
                date: dayjs(reservation.start_time),
                time: dayjs(reservation.start_time),
                designerId: Number(reservation.designer_id), // Force Number
                treatmentId: Number(reservation.RESERVATION_ITEMS?.[0]?.menu_id), // Force Number
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

    const handlePaymentConfirm = async (paymentData: { totalPrice: number; payments: { paymentType: string; amount: number }[]; paymentMemo: string }) => {
        if (!reservationId || !shopId) return;
        setIsCompleting(true);
        try {
            await completeReservation(shopId, reservationId, paymentData);
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
        if (!reservationId || !shopId) return;
        try {
            await deleteReservation(shopId, reservationId);
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

            const submitUpdate = async (force: boolean) => {
                try {
                    const finalData = { ...updateData, force };
                    const response = await updateReservation(shopId, reservationId, finalData);

                    if (response && response.status === 'CONFLICT') {
                        Modal.confirm({
                            title: '예약 확인',
                            content: response.message,
                            okText: '저장 (무시하고 진행)',
                            cancelText: '취소',
                            onOk: () => submitUpdate(true),
                        });
                        return;
                    }

                    message.success(STRINGS.COMMON.SAVE + '되었습니다.');
                    onUpdate();
                    onClose();
                } catch (e: any) {
                    console.error('Update Failed:', e);
                    const errorMsg = e.response?.data?.message;
                    if (Array.isArray(errorMsg)) {
                        message.error(errorMsg.join(', '));
                    } else if (errorMsg) {
                        message.error(errorMsg);
                    } else {
                        message.error('수정에 실패했습니다.');
                    }
                }
            };

            await submitUpdate(false);

        } catch (e: any) {
            console.error(e);
            message.warning('필수 항목을 확인해주세요.');
        }
    };

    const handleSaveVisitLog = async () => {
        if (!reservationId || !reservation || !shopId) return;
        try {
            const logData = {
                reservation_id: Number(reservationId),
                customer_id: Number(reservation.customer_id),
                designer_id: Number(reservation.designer_id),
                admin_memo: logMemo,
                photo_urls: logPhotos
            };
            await createVisitLog(shopId, logData);
            message.success('시술 기록이 저장되었습니다.');
            // setIsLogModalOpen(false); // This variable is not defined in the provided context, so it's omitted.
            onUpdate(); // Re-fetch to update the UI, assuming this is the intended behavior for fetchVisitLog()
        } catch (e) {
            console.error(e);
            message.error('시술 기록 저장 실패');
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

    const items = [
        {
            key: '1',
            label: '예약 정보',
            children: (
                <Flex vertical gap="middle">
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="고객명">
                            {reservation.USERS.name} ({formatPhoneNumber(String(reservation.USERS.phone || ''))})
                        </Descriptions.Item>
                        <Descriptions.Item label="담당 디자이너">
                            {reservation.DESIGNERS.USERS.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="일시">
                            {formatDateTime(reservation.start_time)}
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
            )
        },
        {
            key: '2',
            label: '시술 기록 (Visit Log)',
            children: (
                <Flex vertical gap="middle">
                    <div>
                        <div style={{ marginBottom: 8 }}>관리자 메모 (시술 노트)</div>
                        <Input.TextArea
                            rows={4}
                            value={logMemo}
                            onChange={(e) => setLogMemo(e.target.value)}
                            placeholder="시술 상세 내용, 약제 정보 등을 기록하세요."
                        />
                    </div>
                    <div>
                        <div style={{ marginBottom: 8 }}>포토 로그</div>
                        <ImageUpload
                            category="visit-logs"
                            value={logPhotos}
                            maxCount={5}
                            onChange={(urls) => setLogPhotos(Array.isArray(urls) ? urls : [urls])}
                        />
                    </div>
                    <Button type="primary" onClick={handleSaveVisitLog} disabled={mode === 'edit'}>
                        기록 저장
                    </Button>
                </Flex>
            )
        }
    ];

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={mode === 'view' ? "예약 상세" : "예약 수정"}
            footer={null}
            destroyOnHidden
        >
            {mode === 'view' ? (
                <Tabs defaultActiveKey="1" items={items} />
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
                        <Select
                            loading={dropdownLoading}
                            options={designers.map(d => ({ label: d.USERS.name, value: Number(d.designer_id) }))}
                        />
                    </Form.Item>
                    <Flex gap="small">
                        <Form.Item label="시술 메뉴" name="treatmentId" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select
                                loading={dropdownLoading}
                                options={menus
                                    .filter(m => m.type !== 'CATEGORY')
                                    .map(m => ({ label: `${m.name}`, value: Number(m.menu_id) }))}
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
                        <Select options={Object.keys(RESERVATION_STATUS_COLORS).map(status => ({
                            label: STRINGS.SCHEDULE[`STATUSED_${status}` as keyof typeof STRINGS.SCHEDULE] || status,
                            value: status
                        }))} />
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
                shopId={shopId || 0}
                customerId={reservation.customer_id}
            />
        </Modal>
    );
};

export default ReservationDetailModal;
