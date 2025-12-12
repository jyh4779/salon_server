import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Select, Switch, Space, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { CreateReservationDTO, ReservationStatus } from '../../types/reservation';
import { STRINGS } from '../../constants/strings';
import { searchUsers, UserDTO } from '../../api/user';
import { getDesigners, DesignerDTO } from '../../api/designer';
import { getMenus, MenuDTO } from '../../api/menu';
import { createReservation } from '../../api/reservations';
import { debounce } from 'lodash';

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
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

    // 데이터 상태
    const [designers, setDesigners] = useState<DesignerDTO[]>([]);
    const [menus, setMenus] = useState<MenuDTO[]>([]);

    // 초기 데이터 로드
    React.useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [loadedDesigners, loadedMenus] = await Promise.all([
                        getDesigners(),
                        getMenus()
                    ]);
                    setDesigners(loadedDesigners);
                    setMenus(loadedMenus);
                } catch (error) {
                    console.error('Failed to load initial data:', error);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    // 고객 검색 상태
    const [userOptions, setUserOptions] = useState<UserDTO[]>([]);
    const [fetchingUsers, setFetchingUsers] = useState(false);

    // Debounced Search Handler
    const handleSearchUser = debounce(async (value: string) => {
        if (!value) {
            setUserOptions([]);
            return;
        }

        setFetchingUsers(true);
        try {
            const results = await searchUsers(value);
            setUserOptions(results);
        } catch (error) {
            console.error('User search failed:', error);
        } finally {
            setFetchingUsers(false);
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
            // 종료 시간은 임시로 1시간 뒤로 설정 (추후 시술 메뉴에 따라 계산)
            const end_time = dayjs(start_time).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss');

            const reservationData: CreateReservationDTO = {
                shop_id: 1, // Default Shop ID
                customer_id: selectedUser ? Number(selectedUser.user_id) : Number(values.customerName),
                // customer_name/phone removed as backend handles lookup by ID
                designer_id: Number(values.designerId),
                start_time: start_time,
                end_time: end_time,
                status: values.status,
                request_memo: values.memo,
                alarm_enabled: values.alarm,
                treatment_id: values.treatmentId,
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
                {/* 고객 정보 */}
                <Form.Item
                    label={stringSet.CUSTOMER_LABEL}
                    name="customerName"
                    rules={[{ required: true, message: '고객명을 입력해주세요.' }]}
                >
                    <Select
                        showSearch
                        placeholder={stringSet.CUSTOMER_PLACEHOLDER}
                        filterOption={false}
                        onSearch={handleSearchUser}
                        notFoundContent={fetchingUsers ? <Spin size="small" /> : null}
                        options={userOptions.map(user => ({
                            label: `${user.name} (${user.phone})`,
                            value: user.user_id, // 선택 시 ID 저장 (실제로는 name 필드에 매핑 이슈 확인 필요)
                            // HACK: 백엔드가 name을 받으므로, 여기서는 UI 편의상 ID를 value로 쓰고 submit 시 처리하거나,
                            // 기획상 "신규/기존" 구분이 필요함. 현재는 검색된 유저 선택 시 이름/전화번호 자동완성 형태로 구현.
                            user: user // 데이터 참조용
                        }))}
                        onSelect={(_, option: any) => {
                            // 선택된 유저 정보 저장
                            setSelectedUser(option.user);
                            // 폼 필드 업데이트 (표시는 Select의 라벨이 담당)
                            form.setFieldsValue({
                                customerPhone: option.user.phone
                            });
                        }}
                    />
                    {/* 숨겨진 필드로 전화번호 관리 또는 추후 UI 분리 */}
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
                        <TimePicker format="HH:mm" minuteStep={10} />
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
    );
};

export default NewReservationModal;
