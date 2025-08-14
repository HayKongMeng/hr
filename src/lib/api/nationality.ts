
import api from './index';

export const fetchNationalities = async () => {
    const response = await api.get(`employee/nationalities`);
    return response.data.result;
};

export const createNationality = async (payload: { country_name: string }) => {
    const response = await api.post('employee/nationalities', payload);
    return response.data;
};

export const updateNationality = async (id: number, payload: { country_name: string }) => {
    const response = await api.put(`employee/nationalities/${id}`, payload);
    return response.data;
};

export const deleteNationality = async (id: number) => {
    const response = await api.delete(`employee/nationalities/${id}`);
    return response.data;
};