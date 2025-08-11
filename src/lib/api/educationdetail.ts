import api from './index';

export const getEducationDetailByEmployeeId = (employeeId: number) => api.get(`employee/edu-details-as-emp`, { params: { employee_id: employeeId } });
export const getEducationDetailById = (id: number) => api.get(`employee/edu-details/${id}`);

export const createEducationDetail = async (payload: {
    employee_id: number,
    institution_name: string;
    course: string;
    start_date: string;
    end_date: string;
}) => {
    try {
        const bankInformationResponse = await api.post('/employee/edu-details', {
            employee_id: payload.employee_id,
            institution_name: payload.institution_name,
            course: payload.course,
            start_date: payload.start_date,
            end_date: payload.end_date,
        });

        return bankInformationResponse.data;
    } catch (error) {
        console.error('Error creating Education Detail:', error);
        throw error;
    }
};

export const updateEducationDetail = async (payload: {
    id: number;
    employee_id: number,
    institution_name: string;
    course?: string;
    start_date?: string;
    end_date?: string;
}) => {
    try {
        const {
            id,
            employee_id,
            institution_name,
            course,
            start_date,
            end_date,
        } = payload;

        const response = await api.put(`/employee/edu-details/${id}`, {
            employee_id,
            institution_name,
            course,
            start_date,
            end_date,
        });

        return response.data;
    } catch (error) {
        console.error("Error updating Education Detail:", error);
        throw error;
    }
};
