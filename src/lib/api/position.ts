import api from './index';

export const fetchPositions = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`employee/positions?page=${page}&limit=${limit}`);
    return response.data.result;
};

export type Position = {
    id: number;
    title: string;
};

export const fetchAllPositions = async (): Promise<Position[]> => {
    const response = await api.get(`employee/all-positions`);
    return response.data.result.data;
};

export const createPosition = async (payload: {
    code: string;
    title: string;
    description?: string | null;
    status: boolean;
}) => {
    try {
        const positionResponse = await api.post('/employee/positions', {
            code: payload.code,
            title: payload.title,
            description: payload.description,
            status: payload.status,
        });

        return positionResponse.data;
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
    }
};

export const updatePosition = async (id: number, payload: {
    code: string;
    title: string;
    description?: string | null;
    status: boolean;
}) => {
    const positionResponse = await api.put(`/employee/positions/${id}`, {
        code: payload.code,
        title: payload.title,
        description: payload.description,
        status: payload.status,
    });

    return positionResponse.data;
};

export const deletePosition = async (id: number) => {
    const response = await api.delete(`employee/positions/${id}`);
    return response;
}

