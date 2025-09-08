import api from './index';
import dayjs from "dayjs";

export const fetchCompanies = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`api/employee/company?page=${page}&limit=${limit}`);
    return response.data.result;
};

export type Company = {
    id: number;
    name: string;
    company_code: string;
    type: string;
    email: string;
    phone: string;
    country: string;
    province: string;
    city: string;
    zip_code: string;
    address: string;
    account_url: string;
    website: string;
    status: boolean;
    longitude: number;
    latitude: number;
    posted_by: number;
    created_at: string;
    scan_code: string;
    posted_by_name: string;
    updated_at: string;
};

export const fetchAllCompanies = async (): Promise<Company[]> => {
    const response = await api.get(`api/employee/all-companies`);
    return response.data.result.data;
};

export const getCompanyById = async (id: number): Promise<Company> => {
    const response = await api.get(`api/employee/company/${id}`);
    return response.data.result.data;
};

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


export type UpcomingBirthday = {
    id: number;
    name: string;
    date_of_birth: string;
    age: number;
};

export type WeeklySummary = {
    [day: string]: {
        date: string;
        present: number;
        absent: number;
        leaves: number;
    };
};


//dashboard overview
export interface DashboardSummary {
    total_employees: number;
    total_employees_change: number;
    checkins_today: number;
    checkins_change: number;
    checkouts_today: number;
    checkouts_change: number;
    leave_requests_today: number;
    leave_requests_change: number;
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
    weekly_summary: WeeklySummary;
    line_chart_data: {
        total_employees: number[];
        checkins: number[];
        checkouts: number[];
        leave_requests: number[];
    };
    upcoming_birthdays: UpcomingBirthday[];
}

export const fetchDashboardSummary = async (date?: string): Promise<DashboardSummary> => {
    const queryDate = date || dayjs().format('YYYY-MM-DD');
    try {
        const response = await api.get(`/api/employee/summary?date=${queryDate}`);
        return response.data.result;
    } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
        throw error;
    }
};


//work schedule
export interface WorkSchedulePayload {
    name: string;
    work_start_time: string; // "HH:mm" format
    work_end_time: string;   // "HH:mm" format
    grace_minutes: number;
    work_hours_per_day: number;
    overtime_allowed: boolean;
}

export const createWorkSchedule = async (payload: WorkSchedulePayload) => {
    try {
        const response = await api.post('/api/employee/work-schedules', payload);
        return response.data;
    } catch (error) {
        console.error('Error creating work schedule:', error);
        throw error;
    }
};

// --- For Assigning a Specific Shift to an Employee ---
export interface ShiftAssignmentPayload {
    employee_id: number;
    work_date: string; // "YYYY-MM-DD"
    work_start_time: string; // "HH:mm"
    work_end_time: string; // "HH:mm"
    work_hours: number;
}

export const assignShift = async (payload: ShiftAssignmentPayload) => {
    try {
        const response = await api.post('/api/employee/shift-assignment', payload);
        return response.data;
    } catch (error) {
        console.error('Error assigning shift:', error);
        throw error;
    }
};