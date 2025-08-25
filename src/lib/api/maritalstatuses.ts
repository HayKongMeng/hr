
import api from './index';

export const fetchMaritalStatuses = async () => {
    const response = await api.get(`api/employee/marital-statuses`);
    return response.data.result;
};

export const createMaritalStatus = async (payload: { status_name: string }) => {
    const response = await api.post('api/employee/marital-statuses', payload);
    return response.data;
};

export const updateMaritalStatus = async (id: number, payload: { status_name: string }) => {
    const response = await api.put(`api/employee/marital-statuses/${id}`, payload);
    return response.data;
};

export const deleteMaritalStatus = async (id: number) => {
    const response = await api.delete(`api/employee/marital-statuses/${id}`);
    return response.data;
};