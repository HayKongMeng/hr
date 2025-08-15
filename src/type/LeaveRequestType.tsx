export type LeaveRequest = {
  id: string;
  dateRange: string;
  status: string;
  checkIn: string;
  checkOut: string;
};

export type AttendanceEntry = {
  id: number;
  employee_id: number;
  date: string; // ISO format
  attendance_data: [
    late: boolean,
    status: string,
    clock_in: string, // e.g. "14:08"
    overtime: number,
    late_minutes: number,
    early_leaving: boolean,
    break_duration: string, // e.g. "00:00"
    early_leaving_minutes: number
  ];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  employee: {
    id: number;
    name: string;
  };
  status: 'Present' | 'Absent' | 'Late';
  checkIn: string;
  checkOut: string;
};