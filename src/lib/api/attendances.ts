import api from './index';

export const fetchAttendances = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`employee/attendances?page=${page}&limit=${limit}`);
    return response.data.result;
};

export const findEmployees = async () => {
    const response = await api.get(`employee/find-attendances`);
    return response.data.result;
};

export const findEmployeesById = async (id: number) => {    
    const response = await api.get(`employee/attendances/employee/${id}`);
    return response.data.result;
};

export const checkInAndOut = async (payload: {
    employee_id: number,
    type: string,
    latitude: number,
    longitude: number,
    scan_code: string,
    ip: string,
    reason?: string
}) => {
    try {
        const departmentResponse = await api.post('/employee/mark-attendance', payload);
        return departmentResponse.data;
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
    }
};

const calculateLateMinutes = (officeStart: string, actualTime: string): number => {
    const [officeHour, officeMin] = officeStart.split(":").map(Number);
    const [actualHour, actualMin] = actualTime.split(":").map(Number);
    const officeTotal = officeHour * 60 + officeMin;
    const actualTotal = actualHour * 60 + actualMin;
    return Math.max(0, actualTotal - officeTotal);
};
const calculateEarlyLeavingMinutes = (officeEnd: string, actualTime: string): number => {
    const [officeHour, officeMin] = officeEnd.split(":").map(Number);
    const [actualHour, actualMin] = actualTime.split(":").map(Number);
    const officeTotal = officeHour * 60 + officeMin;
    const actualTotal = actualHour * 60 + actualMin;
    return Math.max(0, officeTotal - actualTotal);
};
const calculateOvertimeMinutes = (officeEnd: string, actualTime: string): number => {
    const [officeHour, officeMin] = officeEnd.split(":").map(Number);
    const [actualHour, actualMin] = actualTime.split(":").map(Number);
    const officeTotal = officeHour * 60 + officeMin;
    const actualTotal = actualHour * 60 + actualMin;
    return Math.max(0, actualTotal - officeTotal);
};


export const checkIncheckOut = async (
    employee_id: number,
    date: string,
    type: 'in' | 'out',
    time: string,
    attendanceId?: number
) => {
    const officeStartTime = "09:00";
    const officeEndTime = "18:00";
    const lateMinutes = type === 'in' ? calculateLateMinutes(officeStartTime, time) : 0;
    const earlyLeavingMinutes = type === 'out' ? calculateEarlyLeavingMinutes(officeEndTime, time) : 0;
    const overtimeMinutes = type === 'out' ? calculateOvertimeMinutes(officeEndTime, time) : 0;

    const body = {
        employee_id,
        date,
        attendance_data: [
            {
                status: "Present",
                clock_in: type === "in" ? time : undefined,
                clock_out: type === "out" ? time : undefined,
                late: lateMinutes > 0,
                late_minutes: lateMinutes,
                early_leaving: earlyLeavingMinutes > 0,
                early_leaving_minutes: earlyLeavingMinutes,
                overtime: overtimeMinutes,
                break_duration: "00:00"
            }
        ]
    };

    const url = type === "in"
        ? 'employee/attendances'
        : `employee/attendances/${attendanceId}`; // PATCH requires ID

    const method = type === "in" ? "POST" : "PUT";

    const response = await api({
        method,
        url,
        data: body
    });

    return response.data;
};
