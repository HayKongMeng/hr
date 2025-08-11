import api from './index';

export type Status = {
    id: number;
    status_name: string;
};

export const fetchStatuses = async (): Promise<Status[]> => {
    const response = await api.get(`employee/status`);
    return response.data.result.data;
};

export type MaritalStatus = {
    id: number;
    status_name: string;
};

export const fetchMaritalStatuses = async (): Promise<MaritalStatus[]> => {
    const response = await api.get(`employee/marital-statuses`);
    return response.data.result.data;
};

export type Nationality = {
    id: number;
    country_name: string;
};

export const fetchNationality = async (): Promise<Nationality[]> => {
    const response = await api.get(`employee/nationalities`);
    return response.data.result.data;
};

export type WorkStation = {
    id: number;
    name: string;
};

export const fetchWorkStation = async (): Promise<WorkStation[]> => {
    const response = await api.get(`employee/work-stations`);
    return response.data.result.data;
};

export type EmploymentType = {
    id: number;
    status_name: string;
};

export const fetchEmploymentTypes = async (): Promise<EmploymentType[]> => {
    const response = await api.get(`employee/employment-type`);
    return response.data.result.data;
};

export type LeaveStatus = {
    id: number;
    status_name: string;
};

export const fetchLeaveStatuses = async (): Promise<LeaveStatus[]> => {
    const response = await api.get(`leave/statuses`);
    return response.data.result.data;
};
