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

                // 3. Show the Ant Design error modal
                Modal.error({
                    title: 'Session Expired',
                    content: 'Your session has expired. Please log in again to continue.',
                    okText: 'Logout', // Customize the button text
                    maskClosable: false, // Prevent closing by clicking the background
                    keyboard: false, // Prevent closing with the Esc key
                    onOk: () => {
                        // 4. Define what happens when the user clicks "Logout"
                        Cookies.remove('access_token');

                        // Optional: Clear other user data from localStorage if you store any
                        // localStorage.removeItem('user_info');

                        // Redirect to the sign-in page and reload the application
                        window.location.href = '/sign-in';

                        // Reset the flag after the modal is handled
                        isSessionExpiredModalVisible = false;
                    },
                });
            }
        }

        // For all other errors, just pass them along
        return Promise.reject(error);
    }
);

export default api;