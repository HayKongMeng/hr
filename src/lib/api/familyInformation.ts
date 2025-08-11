import api from './index';

export const getFamilyInformationByEmployeeId = (employeeId: number) => api.get(`employee/family-information-as-emp`, { params: { employee_id: employeeId } });
export const getFamilyInformationById = (id: number) => api.get(`employee/family-information/${id}`);

export const createFamilyInformation = async (payload: {
    employee_id: number,
    name: string;
    relationship?: string | null;
    passport_expiry_date: string;
    phone?: string | null;
}) => {
    try {
        const familyInformationResponse = await api.post('/employee/family-information', {
            employee_id: payload.employee_id,
            name: payload.name,
            relationship: payload.relationship,
            passport_expiry_date: payload.passport_expiry_date,
            phone: payload.phone,
        });

        return familyInformationResponse.data;
    } catch (error) {
        console.error('Error creating Family Information:', error);
        throw error;
    }
};

export const updateFamilyInformation = async (payload: {
    id: number;
    employee_id: number,
    name: string;
    relationship?: string | null;
    passport_expiry_date: string;
    phone?: string | null;
}) => {
    try {
        const {
            id,
            employee_id,
            name,
            relationship,
            passport_expiry_date,
            phone,
        } = payload;

        const response = await api.put(`/employee/family-information/${id}`, {
            employee_id,
            name,
            relationship,
            passport_expiry_date,
            phone,
        });

        return response.data;
    } catch (error) {
        console.error("Error updating Family Information:", error);
        throw error;
    }
};
