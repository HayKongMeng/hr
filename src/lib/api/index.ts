import axios from 'axios';
import Cookies from "js-cookie";
// const api = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//     withCredentials: true, // 💡 sends cookies
// });

// export default api;

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
});

// Add a request interceptor to add the Authorization header
api.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
     return Promise.reject(error);
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/sign-in'; // Redirect to login page
        }
        return Promise.reject(error);
    }
);

export default api;