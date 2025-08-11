import api from './index';

export const fetchCompanyHistories = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`employee/company-histories?page=${page}&limit=${limit}`);
    return response.data.result;
};

export const createCompanyHistory = async (payload: {
    company_id: number,
    employee_id: number,
    start_date: string;
    end_date: string;
    notes?: string | null;
}) => {
    try {

        const updated_by = Number(localStorage.getItem('user_id'));
        const update_by_name = localStorage.getItem('user_name');

        const companyHistoryResponse = await api.post('/employee/company-histories', {
            company_id: payload.company_id,
            employee_id: payload.employee_id,
            start_date: payload.start_date,
            end_date: payload.end_date,
            notes: payload.notes,
            updated_by,
            update_by_name
        });

        return companyHistoryResponse.data;
    } catch (error) {
        console.error('Error creating company history:', error);
        throw error;
    }
};

export const updateCompanyHistory = async (payload: {
    id: number;
    company_id: number,
    employee_id: number,
    start_date: string;
    end_date: string;
    notes?: string | null;
}) => {
    try {
        const updated_by = Number(localStorage.getItem('user_id'));
        const update_by_name = localStorage.getItem('user_name');

        const companyHistoryResponse = await api.put(`/employee/company-histories/${payload.id}`, {
            company_id: payload.company_id,
            employee_id: payload.employee_id,
            start_date: payload.start_date,
            end_date: payload.end_date,
            notes: payload.notes,
            updated_by,
            update_by_name
        });

        return companyHistoryResponse.data;
    } catch (error) {
        console.error('Error updating company history:', error);
        throw error;
    }
};