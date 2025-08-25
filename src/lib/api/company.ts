import api from './index';
import dayjs from "dayjs";

export const fetchCompanies = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`api/employee/company?page=${page}&limit=${limit}`);
    return response.data.result;
};

export type Company = {
    id: number;
    name: string;
};

export const fetchAllCompanies = async (): Promise<Company[]> => {
    const response = await api.get(`api/employee/all-companies`);
    return response.data.result.data;
};

export const getCompanyById = (id: number) => api.get(`api/employee/company/${id}`);

export const createCompany = async (payload: {
    company_code: string;
    name: string;
    email: string;
    account_url: string;
    status: boolean;

    type?: string;
    phone?: string;
    country?: string;
    province?: string;
    city?: string;
    zip_code?: string;
    address?: string;
    website?: string;
    longitude?: string;
    latitude?: string;
}) => {
    try {
        const posted_by = Number(localStorage.getItem('user_id'));
        const posted_by_name = localStorage.getItem('user_name');

        const finalPayload = {
            ...payload,
            type: payload.type || 'Company',
            phone: payload.phone || 'N/A',
            country: payload.country || 'N/A',
            province: payload.province || 'N/A',
            city: payload.city || 'N/A',
            zip_code: payload.zip_code || '00000',
            address: payload.address || 'N/A',
            website: payload.website || payload.account_url, 
            longitude: payload.longitude || '0',
            latitude: payload.latitude || '0',
            posted_by,
            posted_by_name,
        };

        const companyResponse = await api.post('/api/employee/company', finalPayload);

        return companyResponse.data;
    } catch (error) {
        console.error('Error creating company:', error);
        throw error;
    }
};

export const updateCompany = async (id: number, payload: {
    company_code: string;
    name: string;
    type: string;
    email: string;
    phone: string;
    country: string;
    province: string;
    city: string;
    zip_code: string;
    address: string;
    account_url: string;
    website: string
    status: boolean;
    longitude: string;
    latitude: string;
}) => {
    try {
        const posted_by = Number(localStorage.getItem('user_id'));
        const posted_by_name = localStorage.getItem('user_name');

        const companyResponse = await api.put(`/api/employee/company/${id}`, {
            ...payload,
            posted_by,
            posted_by_name,
        });

    
        return companyResponse.data;
    } catch (error) {
        console.error('Error updating company:', error);
        throw error;
    }
};

export const deleteCompany = async (id: number) => {
    const response = await api.delete(`api/employee/company/${id}`);
    return response;
}

export interface DashboardSummary {
    total_employees: number;
    checkins_today: number;
    checkouts_today: number;
    leave_requests_today: number;
    employee_gender: {
        male: number;
        female: number;
        percentages: {
            male: number;
            female: number;
        };
    };
    present_today: number;
    absent_today: number;
}

export const fetchDashboardSummary = async (date?: string): Promise<DashboardSummary> => {
    const queryDate = date || dayjs().format('YYYY-MM-DD');
    try {
        const response = await api.get(`/api/employee/summary?date=${queryDate}`);
        console.log("tttttttttttttttttttttt")
        return response.data.result;
    } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
        throw error;
    }
};