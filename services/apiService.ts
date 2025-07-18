// services/apiService.ts (مثال لملف خدمة API)

import { getAccessToken } from './authService';

const API_BASE_URL = 'http://localhost:8000/api/'; // تأكد من تحديث هذا المسار

export const fetchProtectedData = async (endpoint: string) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
        throw new Error('No access token found. User not authenticated.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                // يمكن هنا إضافة منطق لتحديث التوكن باستخدام refresh_token
                // أو توجيه المستخدم لصفحة تسجيل الدخول
                throw new Error('Unauthorized: Token expired or invalid.');
            }
            const errorData = await response.json();
            throw new Error(errorData.detail || `API call failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
};

// مثال على كيفية استخدامها في مكون React
// import { fetchProtectedData } from '../services/apiService';
// const handleFetchExams = async () => {
//     try {
//         const exams = await fetchProtectedData('exams/');
//         console.log('Exams:', exams);
//     } catch (error) {
//         console.error('Failed to fetch exams:', error);
//     }
// };