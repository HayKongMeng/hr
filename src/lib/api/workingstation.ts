
import api from './index';

export const fetchWorkStation = async () => {
    const response = await api.get(`employee/work-stations`);
    return response.data.result;
};

export const createWorkStation = async (payload: { name: string }) => {
    const response = await api.post('employee/work-stations', payload);
    return response.data;
};

export const updateWorkStation = async (id: number, payload: { name: string }) => {
    const response = await api.put(`employee/work-stations/${id}`, payload);
    return response.data;
};

export const deleteWorkStation = async (id: number) => {
    const response = await api.delete(`employee/work-stations/${id}`);
    return response.data;
};