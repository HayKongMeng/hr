
import api from './index';

export const fetchEmploymentTypes = async () => {
    const response = await api.get(`employee/employment-type`);
    return response.data.result;
};

export const createEmploymentType = async (payload: { type_code: number; status_name: string }) => {
    const response = await api.post('employee/employment-type', payload);
    return response.data;
};

export const updateEmploymentType = async (id: number, payload: { type_code: number; status_name: string }) => {
    const response = await api.put(`employee/employment-type/${id}`, payload);
    return response.data;
};

export const deleteEmploymentType = async (id: number) => {
    const response = await api.delete(`employee/employment-type/${id}`);
    return response.data;
};