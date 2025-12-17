import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, TimePicker, Checkbox, Switch, message, Space } from 'antd';
import { DesignerDTO, getDesigners, updateDesigner, createDesigner } from '../../../api/designer';
import dayjs from 'dayjs';

const daysOptions = [
    { label: '월', value: 'Mon' },
    { label: '화', value: 'Tue' },
    { label: '수', value: 'Wed' },
    { label: '목', value: 'Thu' },
    { label: '금', value: 'Fri' },
    { label: '토', value: 'Sat' },
    { label: '일', value: 'Sun' },
];

const DesignerSettings: React.FC = () => {
    const [designers, setDesigners] = useState<DesignerDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesigner, setEditingDesigner] = useState<DesignerDTO | null>(null);
    const [form] = Form.useForm();

    const fetchDesigners = async () => {
        setLoading(true);
        try {
            const data = await getDesigners(1);
            setDesigners(data);
        } catch (error) {
            message.error('디자이너 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesigners();
    }, []);

    const handleEdit = (designer: DesignerDTO) => {
        setEditingDesigner(designer);
        form.setFieldsValue({
            ...designer,
            name: designer.USERS.name,
            work_start: designer.work_start ? dayjs(designer.work_start, 'HH:mm') : null,
            work_end: designer.work_end ? dayjs(designer.work_end, 'HH:mm') : null,
            lunch_start: designer.lunch_start ? dayjs(designer.lunch_start, 'HH:mm') : null,
            lunch_end: designer.lunch_end ? dayjs(designer.lunch_end, 'HH:mm') : null,
            day_off: designer.day_off ? designer.day_off.split(',') : [],
            is_active: designer.is_active ?? true,
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingDesigner(null); // Create mode
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingDesigner) {
                // Update Logic
                const payload: Partial<DesignerDTO> = {
                    intro_text: values.intro_text,
                    work_start: values.work_start ? values.work_start.format('HH:mm') : undefined,
                    work_end: values.work_end ? values.work_end.format('HH:mm') : undefined,
                    lunch_start: values.lunch_start ? values.lunch_start.format('HH:mm') : undefined,
                    lunch_end: values.lunch_end ? values.lunch_end.format('HH:mm') : undefined,
                    day_off: values.day_off ? values.day_off.join(',') : '',
                    is_active: values.is_active,
                };
                await updateDesigner(parseInt(editingDesigner.designer_id, 10), payload);
                message.success('수정되었습니다.');
            } else {
                // Create Logic
                const payload = {
                    name: values.name,
                    phone: values.phone,
                    intro_text: values.intro_text,
                };
                await createDesigner(1, payload); // Default shop 1
                message.success('추가되었습니다.');
            }

            setIsModalOpen(false);
            fetchDesigners();
        } catch (error) {
            console.error(error);
            message.error('저장에 실패했습니다.');
        }
    };

    const columns = [
        {
            title: '이름',
            dataIndex: ['USERS', 'name'],
            key: 'name',
        },
        {
            title: '연락처',
            dataIndex: ['USERS', 'phone'],
            key: 'phone',
        },
        {
            title: '소개',
            dataIndex: 'intro_text',
            key: 'intro_text',
            ellipsis: true,
        },
        {
            title: '근무 시간',
            key: 'work_time',
            render: (_: any, record: DesignerDTO) => (
                <span>{record.work_start || '-'} ~ {record.work_end || '-'}</span>
            ),
        },
        {
            title: '관리',
            key: 'action',
            render: (_: any, record: DesignerDTO) => (
                <Button onClick={() => handleEdit(record)}>수정</Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button type="primary" onClick={handleCreate}>디자이너 추가</Button>
            </div>
            <Table
                dataSource={designers}
                columns={columns}
                rowKey="designer_id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingDesigner ? "디자이너 정보 수정" : "디자이너 추가"}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="이름" name="name" rules={[{ required: true, message: '이름을 입력해주세요.' }]}>
                        <Input disabled={!!editingDesigner} placeholder="이름" />
                    </Form.Item>
                    <Form.Item label="전화번호" name="phone" rules={[{ required: true, message: '전화번호를 입력해주세요.' }]}>
                        <Input disabled={!!editingDesigner} placeholder="010-1234-5678" />
                    </Form.Item>

                    <Form.Item label="소개글" name="intro_text">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    {editingDesigner && (
                        <>
                            <Form.Item label="근무 시간" style={{ marginBottom: 0 }}>
                                <Space>
                                    <Form.Item name="work_start">
                                        <TimePicker format="HH:mm" placeholder="출근" />
                                    </Form.Item>
                                    <span>~</span>
                                    <Form.Item name="work_end">
                                        <TimePicker format="HH:mm" placeholder="퇴근" />
                                    </Form.Item>
                                </Space>
                            </Form.Item>
                            <Form.Item label="점심 시간" style={{ marginBottom: 0 }}>
                                <Space>
                                    <Form.Item name="lunch_start">
                                        <TimePicker format="HH:mm" placeholder="시작" />
                                    </Form.Item>
                                    <span>~</span>
                                    <Form.Item name="lunch_end">
                                        <TimePicker format="HH:mm" placeholder="종료" />
                                    </Form.Item>
                                </Space>
                            </Form.Item>
                            <Form.Item label="휴무일" name="day_off">
                                <Checkbox.Group options={daysOptions} />
                            </Form.Item>
                            <Form.Item label="활성 상태" name="is_active" valuePropName="checked">
                                <Switch checkedChildren="활성" unCheckedChildren="비활성" />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default DesignerSettings;
