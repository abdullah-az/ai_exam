import { API_BASE_URL } from './apiService';

export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // يمكنك إضافة توجيه المستخدم إلى صفحة تسجيل الدخول هنا
    // window.location.href = '/login';
};

export const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        logout(); // لا يوجد refresh token، قم بتسجيل الخروج
        throw new Error('No refresh token found. Please log in again.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            logout(); // فشل التحديث، قم بتسجيل الخروج
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to refresh token');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
    } catch (error) {
        console.error('Error refreshing token:', error);
        logout(); // في حالة وجود خطأ، قم بتسجيل الخروج
        throw error;
    }
};

// يمكنك دمج منطق التحديث في fetchProtectedData:
// في fetchProtectedData، إذا كان status === 401:
//     حاول refreshAccessToken()
//     إذا نجح، أعد محاولة الطلب الأصلي مع التوكن الجديد
//     إذا فشل، قم بتسجيل الخروج