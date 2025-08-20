import api from './index';

export const fetchLeaves = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`leave/leaves?page=${page}&limit=${limit}`);
    return response.data.result;
};

export const fetchEmployeesLeave = async (id: number) => {
    const response = await api.get(`leave/employee/${id}`);
    return response.data.result;
};

export const fetchLeaveTypes = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`leave/leave-types?page=${page}&limit=${limit}`);
    return response.data.result;
};
export type Approval = {
    id: number;
    approved_by: number;
    action: string;
    comments: string | null;
    approved_at: string;
};
export const getLeaveById = (id: number) => api.get(`leave/leaves/${id}`);

export type LeaveType = {
    id: number;
    type_name: string;
    leave_type: {
        id: number;
        type_name: string;
        description: string;
        max_days: number;
    }
        
};

export const fetchAllLeaveTypes = async (): Promise<LeaveType[]> => {
    const response = await api.get(`leave/leave-types`);
    return response.data.result.data;
};

export const getLeaveTypeById = async (id: number) => {
    const response = await api.get(`/leave/leave-types/${id}`);
    return response.data.result; 
};

export const createLeave = async (payload: {
    employee_id: number,
    company_id: number,
    leave_type_id: number,
    status_id: number,
    start_date: string;
    end_date: string;
    reason?: string | null;
}) => {
    try {
        const leaveResponse = await api.post('/leave/leaves', {
            employee_id: payload.employee_id,
            company_id: payload.company_id,
            leave_type_id: payload.leave_type_id,
            status_id: payload.status_id,
            start_date: payload.start_date,
            end_date: payload.end_date,
            reason: payload.reason,
        });

        return leaveResponse.data;
    } catch (error) {
        console.error('Error creating leave:', error);
        throw error;
    }
};

export const updateLeave = async (payload: {
    id: number;
    employee_id: number,
    company_id: number,
    leave_type_id: number,
    status_id: number,
    start_date: string;
    end_date: string;
    reason?: string | null;
}) => {
    try {
        const leaveResponse = await api.put(`/leave/leaves/${payload.id}`, {
            employee_id: payload.employee_id,
            company_id: payload.company_id,
            leave_type_id: payload.leave_type_id,
            status_id: payload.status_id,
            start_date: payload.start_date,
            end_date: payload.end_date,
            reason: payload.reason,
        });

        return leaveResponse.data;
    } catch (error) {
        console.error('Error creating leave:', error);
        throw error;
    }
};

export const deleteLeave = async (id: number) => {
    const response = await api.delete(`/leave/leaves/${id}`);
    return response.data;
};

export const createApprove = async (payload: {
    leave_id: number;
    approved_at?: string;
    status_id: number;
    company_id: number;
}) => {
    try {
        const approved_by = Number(localStorage.getItem('user_id'));
        const response = await api.post(`/leave/leaves/${payload.leave_id}/approve`, {
            leave_id: payload.leave_id,
            approved_by,
            approved_at: payload.approved_at,
            status_id: payload.status_id,
            company_id: payload.company_id,
        });

        return response.data;
    } catch (error: any) {
        console.error('Error creating approval:', error?.response?.data || error.message);
        throw error;
    }
};

export const ApproveLeave = async (payload: {
    leave_id: number;
    action: string,
    comments: string;
}) => {
    try {
        const response = await api.post(`/leave/approveds`, {
            leave_id: payload.leave_id,
            action: payload.action,
            comments: payload.comments,
        });

        return response.data;
    } catch (error: any) {
        console.error('Error creating approval:', error?.response?.data || error.message);
        throw error;
    }
};

export const createLeaveType = async (payload: {
    prefix: string;
    type_name: string;
    max_days: number;
    description?: string;
}) => {
    try {
        const leaveResponse = await api.post('/leave/leave-types', {
            prefix: payload.prefix,
            type_name: payload.type_name,
            max_days: payload.max_days,
            description: payload.description || '',
        });

        return leaveResponse.data;
    } catch (error) {
        console.error('Error creating leave type:', error);
        throw error;
    }
};

export const updateLeaveType = async (id:number, payload: {
    prefix: string;
    type_name: string;
    max_days: number;
    description?: string;
}) => {
    try {
        const leaveResponse = await api.put(`/leave/leave-types/${id}`, {
            prefix: payload.prefix,
            type_name: payload.type_name,
            max_days: payload.max_days,
            description: payload.description || '',
        });

        return leaveResponse.data;
    } catch (error) {
        console.error('Error creating leave type:', error);
        throw error;
    }
};


export const deleteLeaveType = async (id: number) => {
    const response = await api.delete(`leave/leave-types/${id}`);
    return response;
}


export const fetchEntitlements = async () => {
    const response = await api.get(`leave/entitlements`);
    return response.data;
}

export const fetchEmployeesEntitlements = async (employeeId: number) => {
    const response = await api.get(`leave/employee/${employeeId}/entitlements/`);
    return response.data;
}

export const createEntitlement = async (payload: {
    employee_id: number;
    entitlement_type_id: number;
    total_days: number;
    used_days: number;
}) => {
    const response = await api.post(`leave/entitlements`, payload);
    return response.data.result;
};

export const deleteEntitlement = async (empId: number) => {
    const response = await api.delete(`leave/entitlements/${empId}`);
    return response.data.result;
}