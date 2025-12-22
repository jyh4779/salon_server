import { api } from './client';

export interface UploadResponse {
    url: string;
    originalName: string;
}

export const uploadImage = async (file: File, category: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>(
        `/uploads/${category}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data.url;
};
