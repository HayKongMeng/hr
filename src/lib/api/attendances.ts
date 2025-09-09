// import api from './index';
//
// export const fetchAttendances = async (page: number = 1, limit: number = 10) => {
//     const response = await api.get(`api/employee/find-attendances?page=${page}&limit=${limit}`);
//     return response.data.result;
// };
//
// export const findEmployees = async () => {
//     const response = await api.get(`api/employee/find-attendances`);
//     return response.data.result;
// };
//
// export const findEmployeesById = async (id: number) => {
//     const response = await api.get(`api/employee/attendances/employee/${id}`);
//     return response.data.result;
// };
//
// export const checkInAndOut = async (payload: {
//     employee_id: number,
//     type: string,
//     latitude: number,
//     longitude: number,
//     scan_code: string,
//     ip: string,
//     reason?: string
// }) => {
//     try {
//         const departmentResponse = await api.post('/api/employee/mark-attendance', payload);
//         return departmentResponse.data;
//     } catch (error) {
//         console.error('Error creating employee:', error);
//         throw error;
//     }
// };
//
// const calculateLateMinutes = (officeStart: string, actualTime: string): number => {
//     const [officeHour, officeMin] = officeStart.split(":").map(Number);
//     const [actualHour, actualMin] = actualTime.split(":").map(Number);
//     const officeTotal = officeHour * 60 + officeMin;
//     const actualTotal = actualHour * 60 + actualMin;
//     return Math.max(0, actualTotal - officeTotal);
// };
// const calculateEarlyLeavingMinutes = (officeEnd: string, actualTime: string): number => {
//     const [officeHour, officeMin] = officeEnd.split(":").map(Number);
//     const [actualHour, actualMin] = actualTime.split(":").map(Number);
//     const officeTotal = officeHour * 60 + officeMin;
//     const actualTotal = actualHour * 60 + actualMin;
//     return Math.max(0, officeTotal - actualTotal);
// };
// const calculateOvertimeMinutes = (officeEnd: string, actualTime: string): number => {
//     const [officeHour, officeMin] = officeEnd.split(":").map(Number);
//     const [actualHour, actualMin] = actualTime.split(":").map(Number);
//     const officeTotal = officeHour * 60 + officeMin;
//     const actualTotal = actualHour * 60 + actualMin;
//     return Math.max(0, actualTotal - officeTotal);
// };
//
//
// export const checkIncheckOut = async (
//     employee_id: number,
//     date: string,
//     type: 'in' | 'out',
//     time: string,
//     attendanceId?: number
// ) => {
//     const officeStartTime = "09:00";
//     const officeEndTime = "18:00";
//     const lateMinutes = type === 'in' ? calculateLateMinutes(officeStartTime, time) : 0;
//     const earlyLeavingMinutes = type === 'out' ? calculateEarlyLeavingMinutes(officeEndTime, time) : 0;
//     const overtimeMinutes = type === 'out' ? calculateOvertimeMinutes(officeEndTime, time) : 0;
//
//     const body = {
//         employee_id,
//         date,
//         attendance_data: [
//             {
//                 status: "Present",
//                 clock_in: type === "in" ? time : undefined,
//                 clock_out: type === "out" ? time : undefined,
//                 late: lateMinutes > 0,
//                 late_minutes: lateMinutes,
//                 early_leaving: earlyLeavingMinutes > 0,
//                 early_leaving_minutes: earlyLeavingMinutes,
//                 overtime: overtimeMinutes,
//                 break_duration: "00:00"
//             }
//         ]
//     };
//
//     const url = type === "in"
//         ? 'employee/attendances'
//         : `employee/attendances/${attendanceId}`; // PATCH requires ID
//
//     const method = type === "in" ? "POST" : "PUT";
//
//     const response = await api({
//         method,
//         url,
//         data: body
//     });
//
//     return response.data;
// };

// --- lib/api/attendances.ts ---

import api  from './index'; // Assuming your configured axios instance is here

// --- 1. DEFINE THE DATA SHAPES (TYPES/INTERFACES) ---

// The shape of the nested employee object within an attendance record
interface AttendanceEmployee {
    id: number;
    name: string;
    // Add other employee properties if they exist, e.g., employee_code: string;
}

// The shape of a single attendance data point within the nested array
interface AttendanceDataPoint {
    id: number;
    status: 'present' | 'late' | 'absent'; // Using literal types is safer than string
    clock_in?: string;
    clock_out?: string;
    late?: boolean;
    // Add any other properties from your attendance_data objects
}

// The shape of a full attendance record for one employee on one day
export interface AttendanceRecord {
    id: number;
    employee_id: number;
    date: string; // e.g., "2023-11-20"
    employee: AttendanceEmployee; // Use the specific type for the nested object
    attendance_data: AttendanceDataPoint[];
}

// The shape of the paginated API response object
export interface AttendanceApiResponse {
    data: AttendanceRecord[];
    total_items: number;
    // Add other pagination properties if your API returns them (e.g., current_page, per_page)
}

// The shape of the payload for the check-in/out API
export interface CheckInAndOutPayload {
    employee_id: number;
    type: 'checkin' | 'checkout';
    latitude: number;
    longitude: number;
    scan_code: string;
    ip: string;
    reason?: string;
}

// --- 2. UPDATE YOUR API FUNCTIONS WITH THE NEW TYPES ---

// This function is for paginated data
export const fetchAttendances = async (page: number = 1, limit: number = 10): Promise<AttendanceApiResponse> => {
    const response = await api.get(`/api/employee/find-attendances?page=${page}&limit=${limit}`);
    return response.data.result || { data: [], total_items: 0 }; // Return a default structure on failure
};

// This function fetches all data (used by your report page)
export const findEmployees = async (): Promise<AttendanceApiResponse> => {
    const response = await api.get(`/api/employee/find-attendances`);
    return response.data.result || { data: [], total_items: 0 }; // Return a default structure on failure
};

// This function fetches records for a single employee
export const findEmployeesById = async (id: number): Promise<{ data: AttendanceRecord[] }> => {
    const response = await api.get(`/api/employee/attendances/employee/${id}`);
    return response.data.result || { data: [] }; // The response is likely just the data array
};

// This function handles the QR code scanning check-in/out
export const checkInAndOut = async (payload: CheckInAndOutPayload): Promise<{ success: boolean; message?: string; }> => {
    try {
        const response = await api.post('/api/employee/mark-attendance', payload);
        return response.data;
    } catch (error) {
        console.error('Error in checkInAndOut:', error);
        throw error;
    }
};


// --- HELPER FUNCTIONS (UNCHANGED) ---
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


// This appears to be for manual/admin attendance marking, keeping it as is with added return type
export const checkIncheckOut = async (
    employee_id: number,
    date: string,
    type: 'in' | 'out',
    time: string,
    attendanceId?: number
): Promise<any> => { // Added a return type for safety
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
        ? '/api/employee/attendances' // Corrected URL format
        : `/api/employee/attendances/${attendanceId}`;

    const method = type === "in" ? "POST" : "PUT";

    // Assuming `api` is your pre-configured axios instance
    const response = await api({ method, url, data: body });

    return response.data;
};