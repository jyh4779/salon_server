import React, { useState } from 'react';
import { Modal, Form, DatePicker, TimePicker, Button, Select, Input, Switch, Space, message, Flex, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { CreateReservationDTO, ReservationStatus } from '../../types/reservation';
import { STRINGS } from '../../constants/strings';
import { searchUsers, UserDTO } from '../../api/user';
import { getDesigners, DesignerDTO } from '../../api/designer';
import { getMenus, MenuDTO } from '../../api/menu';
import { createReservation } from '../../api/reservations';
import { getShop, ShopDTO } from '../../api/shops';
import { debounce } from 'lodash';
import NewCustomerModal from '../common/NewCustomerModal';

interface NewReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateReservationDTO) => void;
}

const { Option } = Select;
const stringSet = STRINGS.SCHEDULE.NEW_RESERVATION_MODAL;

const NewReservationModal: React.FC<NewReservationModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // 데이터 상태
    const [designers, setDesigners] = useState<DesignerDTO[]>([]);
    const [menus, setMenus] = useState<MenuDTO[]>([]);
    const [shop, setShop] = useState<ShopDTO | null>(null);

    // 초기 데이터 로드
    React.useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [loadedDesigners, loadedMenus, loadedShop] = await Promise.all([
                        getDesigners(),
                        getMenus(),
                        getShop(1) // Default Shop ID 1
                    ]);
                    setDesigners(loadedDesigners);
                    setMenus(loadedMenus);
                    setShop(loadedShop);
                    console.log('[Frontend] NewReservationModal shop loaded:', loadedShop);
                } catch (error) {
                    console.error('Failed to load initial data:', error);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    // 시간 제한 로직
    const disabledTime = (_current: dayjs.Dayjs) => {
        // 기본값: 10:00 ~ 20:00 (데이터 없을 시)
        let openHour = 10;
        let closeHour = 20;

        if (shop && shop.open_time && shop.close_time) {
            console.log('[Frontend] Computing disabledTime with:', shop.open_time, shop.close_time);
            // Parse string directly to avoid timezone shifts (e.g. "1970...T10:00...Z" should be 10, not 19 KST)
            // We assume the DB stores the "intended local time" as UTC or plain ISO string.
            try {
                const openTimeStr = shop.open_time.split('T')[1] || shop.open_time;
                const closeTimeStr = shop.close_time.split('T')[1] || shop.close_time;

                openHour = parseInt(openTimeStr.split(':')[0], 10);
                closeHour = parseInt(closeTimeStr.split(':')[0], 10);
            } catch (e) {
                console.error('[Frontend] Failed to parse shop hours:', e);
                // Fallback handled by initialization (10, 20)
            }
        } else {
            console.log('[Frontend] disabledTime using default fallback (10-20) because shop data is missing:', shop);
        }

        return {
            disabledHours: () => {
                const hours = [];
                for (let i = 0; i < 24; i++) {
                    if (i < openHour || i >= closeHour) {
                        hours.push(i);
                    }
                }
                return hours;
            },
        };
    };


    // 신규 고객 모달 상태
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // 고객 검색 관련
    const [userOptions, setUserOptions] = useState<UserDTO[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // 신규 고객 등록 성공 핸들러
    const handleNewCustomerSuccess = (newUser: UserDTO) => {
        // 옵션 목록에 추가하고 선택 상태로 변경
        setUserOptions([newUser]);
        form.setFieldsValue({
            customer_id: newUser.user_id, // value
            customer_label: `${newUser.name} (${newUser.phone})` // label (if needed for display logic, distinct from value)
        });

        // AntD Select의 경우, 옵션이 있어야 value가 매핑되어 보임.
        // 하지만 Select의 'options' prop이 검색 결과에 의존하므로, 
        // 강제로 현재 선택된 값을 위한 옵션을 만들어줘야 함.
        // Select 컴포넌트에 value={customerId} 만 주면 option이 없어서 안보일 수 있음.
        // 따라서 options state를 업데이트 해주는 것이 핵심.
    };

    // Debounced Search Handler
    const handleSearchUser = debounce(async (value: string) => {
        if (!value) {
            setUserOptions([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchUsers(value);
            setUserOptions(results);
        } catch (error) {
            console.error('User search failed:', error);
        } finally {
            setIsSearching(false);
        }
    }, 500);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // 날짜/시간 조합 로직
            const dateStr = values.date.format('YYYY-MM-DD');
            const timeStr = values.time.format('HH:mm:00');
            const start_time = `${dateStr}T${timeStr}`;


            // Calculate end_time based on selected menu duration
            let duration = 60; // Default 1 hour
            if (values.treatmentId) {
                const selectedMenu = menus.find(m => m.menu_id === values.treatmentId);
                if (selectedMenu && selectedMenu.duration) {
                    duration = selectedMenu.duration;
                }
            }
            const end_time = dayjs(start_time).add(duration, 'minute').format('YYYY-MM-DDTHH:mm:ss');

            const reservationData: CreateReservationDTO = {
                shop_id: 1, // Default Shop ID
                customer_id: Number(values.customer_id),
                // customer_name/phone removed as backend handles lookup by ID
                designer_id: Number(values.designerId),
                start_time: start_time,
                end_time: end_time,
                status: values.status,
                request_memo: values.memo,
                alarm_enabled: values.alarm,
                treatment_id: values.treatmentId ? Number(values.treatmentId) : undefined,
            };

            const submitReservation = async () => {
                try {
                    await createReservation(reservationData);
                    onSubmit(reservationData);
                    setLoading(false);
                    form.resetFields();
                    onClose();
                } catch (err) {
                    console.error('Failed to create reservation:', err);
                    message.error('예약 생성에 실패했습니다. 입력 정보를 확인해주세요.');
                    setLoading(false);
                }
            };

            // 과거 시간 체크
            if (dayjs(start_time).isBefore(dayjs())) {
                Modal.confirm({
                    title: '과거 시간 예약',
                    content: '선택하신 시간이 현재 시간보다 이전입니다. 계속 저장하시겠습니까?',
                    onOk: submitReservation,
                    onCancel: () => setLoading(false),
                    okText: STRINGS.COMMON.SAVE,
                    cancelText: STRINGS.COMMON.CANCEL,
                });
            } else {
                await submitReservation();
            }

        } catch (error) {
            console.error('Validation failed:', error);
            message.warning('필수 항목을 모두 입력해주세요.');
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <>
            <Modal
                title={stringSet.TITLE}
                open={isOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={loading}
                okText={STRINGS.COMMON.SAVE}
                cancelText={STRINGS.COMMON.CANCEL}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: 'CONFIRMED' as ReservationStatus,
                        date: dayjs(),
                        alarm: true,
                    }}
                >
                    {/* 고객명 검색 + 신규 등록 버튼 */}
                    <Form.Item label={stringSet.CUSTOMER_LABEL} required style={{ marginBottom: 0 }}>
                        <Flex gap="small">
                            <Form.Item
                                name="customer_id"
                                rules={[{ required: true, message: '고객을 선택해주세요.' }]}
                                style={{ flex: 1, marginBottom: 24 }}
                            >
                                <Select
                                    showSearch
                                    placeholder={stringSet.CUSTOMER_PLACEHOLDER}
                                    defaultActiveFirstOption={false}
                                    filterOption={false}
                                    onSearch={handleSearchUser}
                                    notFoundContent={isSearching ? <Spin size="small" /> : null}
                                    options={userOptions.map(u => ({
                                        value: u.user_id,
                                        label: `${u.name} (${u.phone})`
                                    }))}
                                />
                            </Form.Item>
                            <Button
                                icon={<PlusOutlined />}
                                onClick={() => setIsCustomerModalOpen(true)}
                            />
                        </Flex>
                    </Form.Item>
                    <Form.Item name="customerPhone" hidden><Input /></Form.Item>

                    {/* 날짜 및 시간 */}
                    <Space style={{ display: 'flex' }} align="baseline">
                        <Form.Item
                            label={stringSet.DATE_LABEL}
                            name="date"
                            rules={[{ required: true, message: '날짜를 선택해주세요.' }]}
                        >
                            <DatePicker format="YYYY-MM-DD" />
                        </Form.Item>
                        <Form.Item
                            label={stringSet.TIME_LABEL}
                            name="time"
                            rules={[{ required: true, message: '시간을 선택해주세요.' }]}
                        >
                            <TimePicker format="HH:mm" minuteStep={10} disabledTime={disabledTime} hideDisabledOptions />
                        </Form.Item>
                    </Space>

                    {/* 시술 메뉴 & 디자이너 */}
                    <Space style={{ display: 'flex' }} align="baseline">
                        <Form.Item
                            label={stringSet.TREATMENT_LABEL}
                            name="treatmentId"
                            // rules={[{ required: true, message: '시술을 선택해주세요.' }]}
                            style={{ width: 220 }}
                        >
                            <Select placeholder="시술 선택">
                                {menus.map(menu => (
                                    <Option key={menu.menu_id} value={menu.menu_id}>
                                        {menu.name} ({menu.price.toLocaleString()}원)
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={stringSet.DESIGNER_LABEL}
                            name="designerId"
                            rules={[{ required: true, message: '디자이너를 선택해주세요.' }]}
                            style={{ width: 220 }}
                        >
                            <Select placeholder="디자이너 선택">
                                {designers.map(d => (
                                    <Option key={d.designer_id} value={d.designer_id}>
                                        {d.USERS.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    {/* 상태 & 알림 */}
                    <Space size="large">
                        <Form.Item
                            label={stringSet.STATUS_LABEL}
                            name="status"
                        >
                            <Select style={{ width: 120 }}>
                                <Option value="PENDING">예약 대기</Option>
                                <Option value="CONFIRMED">예약 확정</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label={stringSet.ALARM_LABEL}
                            name="alarm"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Space>

                    {/* 메모 */}
                    <Form.Item
                        label={stringSet.MEMO_LABEL}
                        name="memo"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                </Form>
            </Modal>

            <NewCustomerModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                onSuccess={handleNewCustomerSuccess}
            />
        </>
    );
};

export default NewReservationModal;
