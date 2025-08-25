import api from './index';

export const getPersonalInformationByEmployeeId = (employeeId: number) => api.get(`api/employee/personal-information-as-emp`, { params: { employee_id: employeeId } });
export const getPersonalInformationById = (id: number) => api.get(`api/employee/personal-information/${id}`);

export const createPersonalInformation = async (payload: {
    employee_id: number,
    passport_no: string;
    passport_expiry_date: string;
    nationality_id: number;
    marital_status_id: number;
    religion?: string | null;
    employment_spouse?: string | null;
    number_of_children: number | null;
}) => {
    try {
        const personalInformationResponse = await api.post('/api/employee/personal-information', {
            employee_id: payload.employee_id,
            passport_no: payload.passport_no,
            passport_expiry_date: payload.passport_expiry_date,
            nationality_id: payload.nationality_id,
            marital_status_id: payload.marital_status_id,
            religion: payload.religion,
            employment_spouse: payload.employment_spouse,
            number_of_children: payload.number_of_children,
        });

        return personalInformationResponse.data;
    } catch (error) {
        console.error('Error creating Personal Information:', error);
        throw error;
    }
};

export const updatePersonalInformation = async (payload: {
    id: number;
    employee_id: number;
    passport_no: string;
    passport_expiry_date: string;
    nationality_id: number;
    marital_status_id: number;
    religion?: string | null;
    employment_spouse?: string | null;
    number_of_children: number | null;
}) => {
    try {
        const {
            id,
            employee_id,
            passport_no,
            passport_expiry_date,
            nationality_id,
            marital_status_id,
            religion,
            employment_spouse,
            number_of_children,
        } = payload;

        const response = await api.put(`/api/employee/personal-information/${id}`, {
            employee_id,
            passport_no,
            passport_expiry_date,
            nationality_id,
            marital_status_id,
            religion,
            employment_spouse,
            number_of_children,
        });

        return response.data;
    } catch (error) {
        console.error("Error updating Personal Information:", error);
        throw error;
    }
};
