import api from './index';

type HolidayPayload = {
    name: string;
    start_date: string;
    end_date: string;
    description?: string | null;
    type: HolidayType;
    is_recurring: boolean;
};

export const fetchHolidays = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`api/leave/holidays?page=${page}&limit=${limit}`);
    return response.data.result;
};

 export type HolidayType = 'Public' | 'Optional' | 'Company' | 'Regional';

export const createHoliday = async (payload: {
    name: string;
    start_date: string;
    end_date: string;
    description?: string | null;
    type: HolidayType;
    is_recurring: boolean;
}) => {
    try {
        const holidayResponse = await api.post('/api/leave/holidays', {
            name: payload.name,
            start_date: payload.start_date,
            end_date: payload.end_date,
            description: payload.description,
            type: payload.type,
            is_recurring: payload.is_recurring,
        });

        return holidayResponse.data;
    } catch (error) {
        console.error('Error creating holidays:', error);
        throw error;
    }
};

export const updateHoliday = async (id: number, payload: HolidayPayload) => {
    // PUT to the specific resource URL
    const { data } = await api.put(`/api/leave/holidays/${id}`, payload);
    return data;
};

export const deleteHoliday = async (id: number) => {
    const response = await api.delete(`api/leave/holidays/${id}`);
    return response;
}