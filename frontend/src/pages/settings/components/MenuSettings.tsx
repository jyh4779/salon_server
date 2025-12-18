import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm } from 'antd';
import { MenuDTO, getMenus, createMenu, updateMenu, deleteMenu } from '../../../api/menu';

const categoryOptions = [
    { label: '컷', value: 'Cut' },
    { label: '펌', value: 'Perm' },
    { label: '컬러', value: 'Color' },
    { label: '클리닉', value: 'Clinic' },
    { label: '기타', value: 'Etc' },
];

const MenuSettings: React.FC = () => {
    const [menus, setMenus] = useState<MenuDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuDTO | null>(null); // null means creating
    const [form] = Form.useForm();

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const data = await getMenus(1);
            setMenus(data);
        } catch (error) {
            message.error('메뉴 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleCreate = () => {
        setEditingMenu(null);
        form.resetFields();
        form.setFieldValue('category', 'Cut'); // default
        setIsModalOpen(true);
    };

    const handleEdit = (menu: MenuDTO) => {
        setEditingMenu(menu);
        form.setFieldsValue(menu);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMenu(parseInt(id, 10));
            message.success('삭제되었습니다.');
            fetchMenus();
        } catch (error) {
            message.error('삭제에 실패했습니다.');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingMenu) {
                await updateMenu(parseInt(editingMenu.menu_id, 10), values);
                message.success('수정되었습니다.');
            } else {
                await createMenu(1, values);
                message.success('생성되었습니다.');
            }

            setIsModalOpen(false);
            fetchMenus();
        } catch (error) {
            message.error('저장에 실패했습니다.');
        }
    };

    const columns = [
        {
            title: '카테고리',
            dataIndex: 'category',
            key: 'category',
            width: 100,
        },
        {
            title: '메뉴명',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '가격',
            dataIndex: 'price',
            key: 'price',
            render: (value: number) => `${value.toLocaleString()}원`,
        },
        {
            title: '소요시간(분)',
            dataIndex: 'duration',
            key: 'duration',
        },
        {
            title: '관리',
            key: 'action',
            render: (_: any, record: MenuDTO) => (
                <span>
                    <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>수정</Button>
                    <Popconfirm title="삭제하시겠습니까?" onConfirm={() => handleDelete(record.menu_id)}>
                        <Button danger>삭제</Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button type="primary" onClick={handleCreate}>메뉴 추가</Button>
            </div>
            <Table
                dataSource={menus}
                columns={columns}
                rowKey="menu_id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingMenu ? "메뉴 수정" : "메뉴 추가"}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="카테고리" name="category" rules={[{ required: true }]}>
                        <Select options={categoryOptions} />
                    </Form.Item>
                    <Form.Item label="메뉴명" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="가격" name="price" rules={[{ required: true }]}>
                        <InputNumber
                            formatter={(value) => `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\₩\s?|(,*)/g, '')}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="소요시간 (분)" name="duration" rules={[{ required: true }]}>
                        <InputNumber step={10} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="설명" name="description">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MenuSettings;
