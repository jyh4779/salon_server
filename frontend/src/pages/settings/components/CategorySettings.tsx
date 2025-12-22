import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import { MenuDTO, getMenus, createMenu, updateMenu, deleteMenu } from '../../../api/menu';

const CategorySettings: React.FC = () => {
    const { shopId } = useParams();
    const [categories, setCategories] = useState<MenuDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MenuDTO | null>(null);

    const [form] = Form.useForm();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            if (!shopId) return;
            const data = await getMenus(Number(shopId));
            // Filter only categories and sort by sort_order
            const cats = data
                .filter(m => m.type === 'CATEGORY')
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            setCategories(cats);
        } catch (error) {
            message.error('카테고리 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shopId) fetchCategories();
    }, [shopId]);

    useEffect(() => {
        if (isModalOpen) {
            form.resetFields();
            if (editingCategory) {
                form.setFieldsValue(editingCategory);
            } else {
                form.setFieldValue('sort_order', categories.length + 1);
            }
        }
    }, [isModalOpen, editingCategory, form, categories.length]);

    const handleCreate = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (cat: MenuDTO) => {
        setEditingCategory(cat);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!shopId) return;
        try {
            await deleteMenu(Number(shopId), parseInt(id, 10));
            message.success('카테고리가 삭제되었습니다.');
            fetchCategories();
        } catch (error) {
            // If the category is used by menus (FK constraint), standard deletion might fail depending on DB config.
            // But we have ON DELETE RESTRICT usually, unless user wants CASCADE.
            // Schema has `onDelete: Cascade` for Reservations but not necessarily for Menus referring to Categories (logically).
            // Actually, Menus use a string column `category`, not a relation.
            // So deletion is safe technically, but business logic might want to warn.
            // For now, simple delete.
            message.error('삭제에 실패했습니다.');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = { ...values, type: 'CATEGORY' };

            if (editingCategory) {
                await updateMenu(Number(shopId), parseInt(editingCategory.menu_id, 10), payload);
                message.success('수정되었습니다.');
            } else {
                await createMenu(Number(shopId), payload);
                message.success('생성되었습니다.');
            }

            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            message.error('저장에 실패했습니다.');
        }
    };

    const columns = [
        {
            title: '순서',
            dataIndex: 'sort_order',
            key: 'sort_order',
            width: 80,
            render: (val: number) => val || 0,
        },
        {
            title: '카테고리명',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '관리',
            key: 'action',
            width: 150,
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
                <Button type="primary" onClick={handleCreate}>카테고리 추가</Button>
            </div>
            <Table
                dataSource={categories}
                columns={columns}
                rowKey="menu_id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingCategory ? "카테고리 수정" : "카테고리 추가"}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="카테고리명" name="name" rules={[{ required: true, message: '카테고리명을 입력해주세요' }]}>
                        <Input placeholder="예: 컷, 펌, 컬러" />
                    </Form.Item>
                    <Form.Item label="순서" name="sort_order" help="낮은 숫자가 먼저 표시됩니다.">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategorySettings;
