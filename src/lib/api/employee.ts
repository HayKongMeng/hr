
import api from './index';

export const fetchEmployees = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`employee/employees?page=${page}&limit=${limit}`);
    return response.data.result;
};

export type Employee = {
    id: number;
    name: string;
    user_id: number; 
};

export const fetchAllEmployees = async (): Promise<Employee[]> => {
    const response = await api.get(`employee/all-employees`);
    return response.data.result.data;
};

const employeeCache: { [id: number]: string } = {};

export const getEmployeeName = async (id: number): Promise<string> => {
    if (employeeCache[id]) return employeeCache[id];

    try {
        const res = await getEmployeeById(id);
        const name = res.data?.result?.data?.name || `ID: ${id}`;
        employeeCache[id] = name; 
        return name;
    } catch {
        return "Unknown";
    }
};

export const getEmployeeById = (id: number) => api.get(`employee/employees/${id}`);

export const createEmployee = async (payload: {
    username: string;
    email: string;
    password: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    phone: string;
    address?: string | null;
    date_of_birth: string;
    hire_date: string;
    gender: string;
    position_id: number;
    department_id: number;
    work_station_id: number;
    employment_type_id: number;
    image?: File | null;
    reporting_line1?: number | null;
    reporting_line2?: number | null;
    procurement_line?: number | null;
}): Promise<any> => {  
    try {
        const posted_by = Number(localStorage.getItem('user_id'));
        const posted_by_name = localStorage.getItem('user_name');

        const authResponse = await api.post('/auth/register-employee', {
            name: payload.username,
            email: payload.email,
            password: payload.password,
        });

        const { id: user_id, name, email } = authResponse.data.result.data;
    
        // Prepare FormData for employee-service
        const formData = new FormData();
        formData.append('user_id', user_id.toString());
        formData.append('name', name);
        formData.append('email', email);
        formData.append('employee_code', payload.employee_code);
        formData.append('first_name', payload.first_name);
        formData.append('last_name', payload.last_name);
        formData.append('phone', payload.phone);
        // formData.append('address', payload.address);
        formData.append('date_of_birth', payload.date_of_birth);
        formData.append('hire_date', payload.hire_date);
        formData.append('gender', payload.gender);
        formData.append('position_id', payload.position_id.toString());
        formData.append('department_id', payload.department_id.toString());
        formData.append('work_station_id', payload.work_station_id.toString());
        formData.append('employment_type_id', payload.employment_type_id.toString());

        if (payload.address) {
            formData.append('address', payload.address);
        }
        if (payload.reporting_line1) {
            formData.append('reporting_line1', payload.reporting_line1.toString());
        }
        if (payload.reporting_line2) {
            formData.append('reporting_line2', payload.reporting_line2.toString());
        }
        if (payload.procurement_line) {
            formData.append('procurement_line', payload.procurement_line.toString());
        }
        if (payload.image) {
            formData.append('image', payload.image);
        }

        formData.append('posted_by', posted_by.toString());
        formData.append('posted_by_name', posted_by_name || '');

        const employeeResponse = await api.post('/employee/employees', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return employeeResponse.data; // ✅ Ensure this is returned
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
    }
};

export const updateEmployee = async (
    employeeId: number,
    userId: number,
    authPayload: {
        username: string;
        email: string;
        password: string;
    },
    employeePayload: {
        employee_code: string;
        first_name: string;
        last_name: string;
        phone: string;
        address?: string | null;
        date_of_birth: string;
        hire_date: string;
        gender: string;
        position_id: number;
        department_id: number;
        work_station_id: number;
        employment_type_id: number;
        image?: File | null;
        reporting_line1?: number | null;
        reporting_line2?: number | null;
        procurement_line?: number | null;
    }
): Promise<any> => {
    try {
        const posted_by = Number(localStorage.getItem('user_id'));
        const posted_by_name = localStorage.getItem('user_name');

        // Step 1: Update in auth-service
        await api.put(`/auth/update-register-employee/${userId}`, {
            name: authPayload.username,
            email: authPayload.email,
            password: authPayload.password,
        });

        // Step 2: FormData for employee update
        const formData = new FormData();
        formData.append('user_id', userId.toString());
        formData.append('name', authPayload.username);
        formData.append('email', authPayload.email);
        formData.append('employee_code', employeePayload.employee_code);
        formData.append('first_name', employeePayload.first_name);
        formData.append('last_name', employeePayload.last_name);
        formData.append('phone', employeePayload.phone);
        formData.append('date_of_birth', employeePayload.date_of_birth);
        formData.append('hire_date', employeePayload.hire_date);
        formData.append('gender', employeePayload.gender);
        formData.append('position_id', employeePayload.position_id.toString());
        formData.append('department_id', employeePayload.department_id.toString());
        formData.append('work_station_id', employeePayload.work_station_id.toString());
        formData.append('employment_type_id', employeePayload.employment_type_id.toString());

        if (employeePayload.address) {
            formData.append('address', employeePayload.address);
        }

        if (employeePayload.reporting_line1) {
            formData.append('reporting_line1', employeePayload.reporting_line1.toString());
        }
        if (employeePayload.reporting_line2) {
            formData.append('reporting_line2', employeePayload.reporting_line2.toString());
        }
        if (employeePayload.procurement_line) {
            formData.append('procurement_line', employeePayload.procurement_line.toString());
        }

        if (employeePayload.image) {
            formData.append('image', employeePayload.image);
        }

        formData.append('posted_by', posted_by.toString());
        formData.append('posted_by_name', posted_by_name || '');

        formData.append('_method', 'POST');
        // Step 3: Send to employee-service
        const response = await api.post(`/employee/employees/${employeeId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error updating employee:', error);
        throw error;
    }
};


export const deleteEmployee = async (id: number) => {
    const response = await api.delete(`employee/employees/${id}`);
    return response;
}

export const getEmergencyContactsByEmployeeId = (employeeId: number) => api.get(`employee/eid-emergency-contacts`, { params: { employee_id: employeeId } });


export type EmergencyContactPayload = {
    name: string;
    relationship?: string; 
    phone1: string;
    phone2?: string;
    email?: string;
    employee_id: number;
    contact_type: "primary" | "secondary";
};

export const createEmergencyContacts = async (
    payload: EmergencyContactPayload[]
) => {
    try {
        const response = await api.post("/employee/emergency-contacts/bulk", payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating emergency contacts:", error);
        throw error;
    }
};


