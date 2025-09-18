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
            phone: payload.phone || 'Not provided',
            country: payload.country || 'Not provided',
            province: payload.province || 'Not provided',
            city: payload.city || 'Not provided',
            zip_code: payload.zip_code || '00000',
            address: payload.address || 'Not provided',
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


// =======================
// Work Schedule
// =======================
export interface WorkScheduleDay {
    id: number;
    day_of_week: string;
    work_start_time: string;
    work_end_time: string;
    work_hours: number;
}
export interface WorkScheduleDayPayload {
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    work_start_time: string;
    work_end_time: string;
    work_hours: number;
}
export interface WorkSchedulePayload {
    name: string;
    work_start_time: string;
    work_end_time: string;
    grace_minutes: number;
    work_hours_per_day: number;
    overtime_allowed: boolean;
}
// This is the type for data received FROM the API, which includes an 'id'
type WorkSchedule = WorkSchedulePayload & { id: number };

// This is the type for the DETAILED view of a schedule
export type WorkScheduleDetail = WorkSchedule & {
    work_schedule_days: WorkScheduleDay[];
};

// CORRECTED: The function now correctly promises to return WorkSchedule[]
export const fetchScheduleDay = async (): Promise<WorkSchedule[]> => {
    const response = await api.get(`/api/employee/work-schedules`);
    return response.data?.result?.data || [];
};

export const getScheduleDayById = async (id: number): Promise<WorkScheduleDetail> => {
    const response = await api.get(`/api/employee/work-schedules/${id}`);
    return response.data.result.data;
};

export const deleteScheduleDay = async (id: number) => {
    const response = await api.delete(`/api/employee/work-schedules/${id}`);
    return response.data; // Changed from 'response' to 'response.data' for consistency
}

export const updateWorkSchedule = async (id: number, payload: WorkSchedulePayload) => {
    const response = await api.put(`/api/employee/work-schedules/${id}`, payload);
    return response.data;
};

export const createWorkSchedule = async (payload: WorkSchedulePayload) => {
    const response = await api.post('/api/employee/work-schedules', payload);
    return response.data;
};

export const addDayToWorkSchedule = async (scheduleId: number, payload: WorkScheduleDayPayload) => {
    const response = await api.post(`/api/employee/work-schedules/${scheduleId}/days`, payload);
    return response.data;
};


// =======================
// Shift Assignment
// =======================
export interface ShiftAssignmentPayload {
    work_schedule_id: number;
    employee_id: number;
    work_date: string;
    work_start_time: string;
    work_end_time: string;
    work_hours: number;
}
// This is the type for a ShiftAssignment object received FROM the API
type ShiftAssignment = ShiftAssignmentPayload & {
    id: number;
    employee?: { name: string };
    work_schedule?: { name: string };
};

// CORRECTED: The function now correctly promises to return ShiftAssignment[]
export const fetchShiftAssign = async (): Promise<ShiftAssignment[]> => {
    const response = await api.get(`/api/employee/shift-assignment`);
    return response.data?.result?.data || [];
};

export const updateShiftAssign = async (id: number, payload: ShiftAssignmentPayload) => {
    const response = await api.put(`/api/employee/shift-assignment/${id}`, payload);
    return response.data;
};

export const deleteShiftAssign = async (id: number) => {
    const response = await api.delete(`/api/employee/shift-assignment/${id}`);
    return response.data;
}

export const assignShift = async (payload: ShiftAssignmentPayload) => {
    const response = await api.post('/api/employee/shift-assignment', payload);
    return response.data;
};


// =======================
// Attendance Setting
// =======================
export interface AttendanceSettingPayload {
    work_start_time: string;
    work_end_time: string;
    grace_minutes: number;
    work_hours_per_day: number;
    overtime_allowed: boolean;
}
// This is the type for an AttendanceSetting object received FROM the API
type AttendanceSetting = AttendanceSettingPayload & { id: number };

export const createAttendanceSetting = async (payload: AttendanceSettingPayload) => {
    const response = await api.post('/api/employee/attendance-settings', payload);
    return response.data;
};

// ADDED a standard update function for completeness
export const updateAttendanceSetting = async (id: number, payload: AttendanceSettingPayload) => {
    const response = await api.put(`/api/employee/attendance-settings/${id}`, payload);
    return response.data;
};

export const deleteAttendanceSetting = async (id: number) => {
    const response = await api.delete(`/api/employee/attendance-settings/${id}`);
    return response.data;
}

// CORRECTED: Promises to return an AttendanceSetting object or null
export const fetchAttendanceSetting = async (): Promise<AttendanceSetting | null> => {
    const response = await api.get(`/api/employee/attendance-settings-single-company`);
    return response.data?.result?.data || null;
};