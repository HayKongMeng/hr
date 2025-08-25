import api from './index';

export const getBankInformationByEmployeeId = (employeeId: number) => api.get(`api/employee/bank-information-as-emp`, { params: { employee_id: employeeId } });
export const getBackInformationById = (id: number) => api.get(`api/employee/bank-information/${id}`);

export const createBankInformation = async (payload: {
    employee_id: number,
    bank_details: string;
    bank_account_no?: string | null;
    ifsc_code?: string | null;
    branch_address?: string | null;
}) => {
    try {
        const bankInformationResponse = await api.post('/api/employee/bank-information', {
            employee_id: payload.employee_id,
            bank_details: payload.bank_details,
            bank_account_no: payload.bank_account_no,
            ifsc_code: payload.ifsc_code,
            branch_address: payload.branch_address,
        });

        return bankInformationResponse.data;
    } catch (error) {
        console.error('Error creating Bank Information:', error);
        throw error;
    }
};

export const updateBankInformation = async (payload: {
    id: number;
    employee_id: number,
    bank_details: string;
    bank_account_no?: string | null;
    ifsc_code?: string | null;
    branch_address?: string | null;
}) => {
    try {
        const {
            id,
            employee_id,
            bank_details,
            bank_account_no,
            ifsc_code,
            branch_address,
        } = payload;

        const response = await api.put(`/api/employee/bank-information/${id}`, {
            employee_id,
            bank_details,
            bank_account_no,
            ifsc_code,
            branch_address,
        });

        return response.data;
    } catch (error) {
        console.error("Error updating Bank Information:", error);
        throw error;
    }
};
