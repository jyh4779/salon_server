import React, { useState, useEffect } from 'react';
import { Upload, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { uploadImage } from '../../api/uploads';
import { STRINGS } from '../../constants/strings';

interface ImageUploadProps {
    value?: string | string[];
    onChange?: (url: string | string[]) => void;
    category: string;
    maxCount?: number;
}

const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, category, maxCount = 1 }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (!value) {
            setFileList([]);
            return;
        }

        if (Array.isArray(value)) {
            setFileList(value.map((url, index) => ({
                uid: `-${index}`,
                name: `image-${index}.png`,
                status: 'done',
                url: url,
            })));
        } else {
            setFileList([{
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: value,
            }]);
        }
    }, [value]);

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList);

        // Handle removal (if fileList became empty or item removed)
        // We need to calculate value based on current successful files
        const urls = newFileList
            .filter(file => file.status === 'done' && file.url)
            .map(file => file.url as string);

        if (onChange) {
            if (maxCount === 1) {
                onChange(urls[0] || '');
            } else {
                onChange(urls);
            }
        }
    };

    const customRequest: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError } = options;
        try {
            const url = await uploadImage(file as File, category);

            // Allow Upload component to update file status to done
            if (onSuccess) onSuccess(url);

            // Construct new value
            const currentUrls = fileList
                .filter(f => f.status === 'done' && f.url)
                .map(f => f.url as string);

            const newUrls = [...currentUrls, url];

            if (onChange) {
                if (maxCount === 1) {
                    onChange(url);
                } else {
                    onChange(newUrls);
                }
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message;
            if (Array.isArray(errorMsg)) {
                message.error(errorMsg.join(', '));
            } else if (errorMsg) {
                message.error(errorMsg);
            } else {
                message.error(STRINGS.UPLOAD.ERROR_GENERIC);
            }
            if (onError) onError(err as Error);
        }
    };

    const beforeUpload = (file: File) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            message.error(STRINGS.UPLOAD.ERROR_EXT);
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error(STRINGS.UPLOAD.ERROR_SIZE);
        }
        return isJpgOrPng && isLt5M;
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <>
            <Upload
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                customRequest={customRequest}
                beforeUpload={beforeUpload}
                maxCount={maxCount}
                multiple={maxCount > 1}
            >
                {fileList.length >= maxCount ? null : uploadButton}
            </Upload>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default ImageUpload;
