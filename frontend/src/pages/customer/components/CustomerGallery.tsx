import React, { useEffect, useState } from 'react';
import { Image, Flex, Typography, Empty, Select, Button } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { getVisitLogsByCustomer } from '../../../api/visitLogs';
import { formatDate } from '../../../utils/format';

const { Text } = Typography;

interface CustomerGalleryProps {
    shopId: number;
    customerId: number;
    onReservationClick?: (reservationId: string) => void;
}

interface GalleryItem {
    id: string;
    url: string;
    date: string;
    designerName?: string;
    logId: string;
    reservationId: string;
    menuName?: string;
    categories?: string[];
}

const CustomerGallery: React.FC<CustomerGalleryProps> = ({ shopId, customerId, onReservationClick }) => {
    const [photos, setPhotos] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    // const [total, setTotal] = useState(0); // Kept for future use if needed

    useEffect(() => {
        setPhotos([]); // Reset photos on customer change
        setHasMore(true);
        setPage(1);
        fetchPhotos(1);
    }, [customerId, shopId]);

    const fetchPhotos = async (pageNum: number) => {
        try {
            setLoading(true);
            const { data } = await getVisitLogsByCustomer(shopId, customerId, pageNum, 9); // limit 9
            // const { data, total: totalCount } = await getVisitLogsByCustomer(customerId, pageNum, 9);
            // setTotal(totalCount);

            const newPhotos: GalleryItem[] = [];
            data.forEach(log => {
                if (log.photo_urls && Array.isArray(log.photo_urls)) {
                    log.photo_urls.forEach((url, index) => {
                        newPhotos.push({
                            id: `${log.log_id}-${index}`,
                            url: url,
                            date: log.visited_at,
                            designerName: (log as any).DESIGNERS?.USERS?.name || 'Unknown',
                            logId: log.log_id,
                            reservationId: log.reservation_id,
                            menuName: log.menu_names?.join(', ') || '',
                            categories: log.categories || []
                        });
                    });
                }
            });

            setPhotos(prev => {
                // If page 1, replace. If next page, append.
                // Note: If customerId changed, we reset photos in useEffect, ensuring prev is empty or irrelevant.
                // However, the fetch might overlap if fast switching.
                // For simplicity, we trust the pageNum arg.
                const combined = pageNum === 1 ? newPhotos : [...prev, ...newPhotos];

                // Extract unique categories from ALL loaded photos
                const categories = Array.from(new Set(combined.flatMap(p => p.categories || []))).sort();
                setAvailableCategories(categories);

                return combined;
            });

            // Check if we reached the total count of logs
            // Logic: If the fetched data length is less than limit (9), we are at end.
            // OR checks against total count if needed.
            if (newPhotos.length < 9) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPhotos = filterCategory === 'ALL'
        ? photos
        : photos.filter(p => p.categories?.includes(filterCategory));

    if (photos.length === 0 && !loading) {
        return <Empty description="등록된 시술 사진이 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
        <Flex vertical gap="middle">
            {availableCategories.length > 0 && (
                <Flex justify="flex-end">
                    <Select
                        defaultValue="ALL"
                        style={{ width: 120 }}
                        onChange={setFilterCategory}
                        options={[
                            { value: 'ALL', label: '전체' },
                            ...availableCategories.map(c => ({ value: c, label: c }))
                        ]}
                    />
                </Flex>
            )}

            {filteredPhotos.length === 0 && !loading ? (
                <Empty description="해당 카테고리의 사진이 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
                <Flex wrap="wrap" gap="large">
                    <Image.PreviewGroup>
                        {filteredPhotos.map(item => (
                            <div key={item.id} style={{ width: 200, position: 'relative' }}>
                                <Image
                                    width={200}
                                    height={200}
                                    src={item.url}
                                    style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                                />
                                {onReservationClick && (
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={<LinkOutlined />}
                                        size="small"
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            opacity: 0.8,
                                            zIndex: 10
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReservationClick(item.reservationId);
                                        }}
                                        title="예약 상세 보기"
                                    />
                                )}
                                <div style={{ marginTop: 8, textAlign: 'center' }}>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                        {formatDate(item.date)}
                                    </Text>
                                    <Text strong style={{ fontSize: 13, display: 'block' }}>
                                        {item.designerName}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {item.menuName}
                                    </Text>
                                </div>
                            </div>
                        ))}
                    </Image.PreviewGroup>
                </Flex>
            )}

            {hasMore && filterCategory === 'ALL' && (
                <Flex justify="center" style={{ marginTop: 16 }}>
                    <Button
                        onClick={() => {
                            const nextPage = page + 1;
                            setPage(nextPage);
                            fetchPhotos(nextPage);
                        }}
                        loading={loading}
                    >
                        더 보기
                    </Button>
                </Flex>
            )}
        </Flex>
    );
};

export default CustomerGallery;
