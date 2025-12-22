import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Avatar } from 'antd';
import { MenuDTO, getMenus, createMenu, updateMenu, deleteMenu } from '../../../api/menu';
import ImageUpload from '../../../components/common/ImageUpload';



const MenuSettings: React.FC = () => {
    const [categories, setCategories] = useState<MenuDTO[]>([]);
    const [menuItems, setMenuItems] = useState<MenuDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuDTO | null>(null);
    const [form] = Form.useForm();

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const data = await getMenus(1);
            // Separate Categories and Items
            const cats = data.filter(m => m.type === 'CATEGORY').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            // Only show Items (type is not CATEGORY)
            const items = data.filter(m => m.type !== 'CATEGORY');

            setCategories(cats);
            setMenuItems(items);
        } catch (error) {
            message.error('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            form.resetFields();
            if (editingMenu) {
                form.setFieldsValue(editingMenu);
            } else {
                if (categories.length > 0) {
                    form.setFieldValue('category', categories[0].name);
                }
            }
        }
    }, [isModalOpen, editingMenu, form, categories]);

    const handleCreate = () => {
        setEditingMenu(null);
        setIsModalOpen(true);
    };

    const handleEdit = (menu: MenuDTO) => {
        setEditingMenu(menu);
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
            const payload = { ...values, type: 'MENU' }; // Ensure type is MENU

            if (editingMenu) {
                await updateMenu(parseInt(editingMenu.menu_id, 10), payload);
                message.success('수정되었습니다.');
            } else {
                await createMenu(1, payload);
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
            width: 120,
        },
        {
            title: '메뉴명',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: MenuDTO) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {record.thumbnail_url && <Avatar src={record.thumbnail_url} shape="square" size="large" />}
                    <span>{text}</span>
                </div>
            )
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
                dataSource={menuItems}
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
                        {categories.length > 0 ? (
                            <Select>
                                {categories.map(cat => (
                                    <Select.Option key={cat.menu_id} value={cat.name}>
                                        {cat.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        ) : (
                            <div style={{ color: 'red' }}>
                                등록된 카테고리가 없습니다. '메뉴 카테고리' 탭에서 먼저 추가해주세요.
                            </div>
                        )}
                    </Form.Item>
                    <Form.Item label="메뉴명" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="대표 이미지 (썸네일)" name="thumbnail_url">
                        <ImageUpload category="menus" maxCount={1} />
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
