import api from './index';

export const fetchCompanies = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`employee/company?page=${page}&limit=${limit}`);
    return response.data.result;
};

export type Company = {
    id: number;
    name: string;
};

export const fetchAllCompanies = async (): Promise<Company[]> => {
    const response = await api.get(`employee/all-companies`);
    return response.data.result.data;
};

export const getCompanyById = (id: number) => api.get(`employee/company/${id}`);

export const createCompany = async (payload: {
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

        const companyResponse = await api.post('/employee/company', {
            company_code: payload.company_code,
            name: payload.name,
            type: payload.type,
            email: payload.email,
            phone: payload.phone,
            country: payload.country,
            province: payload.province,
            city: payload.city,
            zip_code: payload.zip_code,
            address: payload.address,
            account_url: payload.account_url,
            website: payload.website,
            status: payload.status,
            longitude: payload.longitude,
            latitude: payload.latitude,
            posted_by,
            posted_by_name,
        });

        return companyResponse.data;
    } catch (error) {
        console.error('Error creating company:', error);
        throw error;
    }
};

export const updateCompany = async (payload: {
    id: number;
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

        const companyResponse = await api.put(`/employee/company/${payload.id}`, {
            company_code: payload.company_code,
            name: payload.name,
            type: payload.type,
            email: payload.email,
            phone: payload.phone,
            country: payload.country,
            province: payload.province,
            city: payload.city,
            zip_code: payload.zip_code,
            address: payload.address,
            account_url: payload.account_url,
            website: payload.website,
            status: payload.status,
            longitude: payload.longitude,
            latitude: payload.latitude,
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
    const response = await api.delete(`employee/company/${id}`);
    return response;
}