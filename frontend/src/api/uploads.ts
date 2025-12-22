import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

export interface UploadResponse {
    url: string;
    originalName: string;
}

export const uploadImage = async (file: File, category: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<UploadResponse>(
        `${API_BASE_URL}/uploads/${category}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data.url;
};
