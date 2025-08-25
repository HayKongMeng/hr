import api from './index';

export const getExperienceByEmployeeId = (employeeId: number) => api.get(`api/employee/experience-as-emp`, { params: { employee_id: employeeId } });
export const getExperienceById = (id: number) => api.get(`api/employee/experience/${id}`);

export const createExperience = async (payload: {
    employee_id: number,
    previous_company_name: string;
    designation: string;
    start_date: string;
    end_date: string | null;
    is_current?: boolean;
}) => {
    try {
        const response = await api.post('/api/employee/experience', {
            employee_id: payload.employee_id,
            previous_company_name: payload.previous_company_name,
            designation: payload.designation,
            start_date: payload.start_date,
            end_date: payload.end_date,
            is_current: payload.is_current ?? false, 
        });

        return response.data;
    } catch (error) {
        console.error('Error creating Experience:', error);
        throw error;
    }
};

export const updateExperience = async (payload: {
    id: number;
    employee_id: number,
    previous_company_name: string;
    designation: string;
    start_date: string;
    end_date: string;
    is_current?: boolean;
}) => {
    try {
        const {
            id,
            employee_id,
            previous_company_name,
            designation,
            start_date,
            end_date,
            is_current
        } = payload;

        const response = await api.put(`/api/employee/experience/${id}`, {
            employee_id,
            previous_company_name,
            designation,
            start_date,
            end_date,
            is_current
        });

        return response.data;
    } catch (error) {
        console.error("Error updating Experience:", error);
        throw error;
    }
};
