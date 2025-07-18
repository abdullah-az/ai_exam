// services/authService.ts (مثال لملف خدمة المصادقة)

const API_URL = 'http://localhost:8000/api/'; // تأكد من تحديث هذا المسار

export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        return data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const getAccessToken = () => {
    return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
};

export const isAuthenticated = () => {
    return !!getAccessToken();
};

// مثال على كيفية استخدامها في مكون React
// import { login } from '../services/authService';
// const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//         await login(username, password);
//         // توجيه المستخدم بعد تسجيل الدخول بنجاح
//     } catch (error) {
//         // عرض رسالة خطأ للمستخدم
//     }
// };