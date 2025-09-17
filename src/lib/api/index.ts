import axios from 'axios';
import Cookies from "js-cookie";
import { Modal } from 'antd'; // 1. Import Ant Design's Modal

let isSessionExpiredModalVisible = false;

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
});

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
        if (
            error.response &&
            error.response.status === 401 &&
            error.response.data?.message === "Token has expired"
        ) {
            if (!isSessionExpiredModalVisible) {
                isSessionExpiredModalVisible = true;

                Modal.error({
                    title: 'Session Expired',
                    content: 'Your session has expired. Please log in again to continue.',
                    okText: 'Logout',
                    maskClosable: false,
                    keyboard: false,
                    onOk: () => {
                        Cookies.remove('access_token');


                        window.location.href = '/sign-in';

                        isSessionExpiredModalVisible = false;
                    },
                });
            }
            return new Promise(() => {});
        }

        return Promise.reject(error);
    }
);

export default api;