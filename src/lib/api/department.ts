import api from './index';

export const fetchDepartments = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`employee/departments?page=${page}&limit=${limit}`);
    return response.data.result;
};

export type Department = {
    id: number;
    name: string;
};

export const fetchAllDepartments = async (): Promise<Department[]> => {
    const response = await api.get(`employee/all-departments`);
    return response.data.result.data;
};

export const createDepartment = async (payload: {
    company_id: number,
    code: string;
    name: string;
    description?: string | null;
    status: boolean;
}) => {
    try {
        const departmentResponse = await api.post('/employee/departments', {
            company_id: payload.company_id,
            code: payload.code,
            name: payload.name,
            description: payload.description,
            status: payload.status,
        });

        return departmentResponse.data;
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
    }
};

export const updateDepartment = async (payload: {
    id: number;
    company_id: number,
    code: string;
    name: string;
    description?: string | null;
    status: boolean;
}) => {
    const departmentResponse = await api.put(`/employee/departments/${payload.id}`, {
        company_id: payload.company_id,
        code: payload.code,
        name: payload.name,
        description: payload.description,
        status: payload.status,
    });

    return departmentResponse.data;
};

export const deleteDepartment = async (id: number) => {
    const response = await api.delete(`employee/departments/${id}`);
    return response;
}
