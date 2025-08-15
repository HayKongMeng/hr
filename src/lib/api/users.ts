import api from './index';

export const fetchUsers = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`auth/get-all-users`);
    return response.data.result;
};

export const fetchAllRoles = async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`auth/roles-list`);
    return response.data.result;
};

export type Role = {
    id: number;
    role_name: string;
};

export const fetchRoles = async (): Promise<Role[]> => {
    const response = await api.get(`auth/roles`);
    return response.data.result.data;
};

export type PermissionMap = Record<string, string[]>;

export const fetchPermission = async (): Promise<PermissionMap> => {
    const response = await api.get(`auth/permissions/meta`);
    return response.data.result.data;
};


export const createUser = async (payload: {
    name: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    role_id: number;
}) => {
    try {
        const userResponse = await api.post('auth/register', {
            name: payload.name,
            email: payload.email,
            password: payload.password,
            first_name: payload.first_name,
            last_name: payload.last_name,
            phone: payload.phone,
            role_id: payload.role_id,
        });

        return userResponse.data;
    } catch (error) {
        console.error('Error creating users:', error);
        throw error;
    }
};

export const updateUser = async (id: number, payload: {
    name: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    role_id: number;
}) => {
    const userResponse = await api.put(`/auth/edit-register/${id}`, {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
        role_id: payload.role_id,
    });

    return userResponse.data;
};

export const createRole = async (payload: {
    role_name: string;
    status: boolean;
    permissions: { module: string; actions: string[] }[];
}) => {
    try {
        const roleResponse = await api.post('auth/roles-assign-permissions', {
            role_name: payload.role_name,
            status: payload.status,
            permissions: payload.permissions,
        });

        return roleResponse.data;
    } catch (error) {
        console.error('Error creating users:', error);
        throw error;
    }
};

export const updateRole = async (payload: {
    id: number;
    role_name: string;
    status: boolean;
    permissions: { module: string; actions: string[] }[];
}) => {
    const roleResponse = await api.put(`/auth/roles-assign-permissions/${payload.id}`, {
        role_name: payload.role_name,
        status: payload.status,
        permissions: payload.permissions,
    });

    return roleResponse.data;
};

export const deleteRole = async (id: number) => {
    const response = await api.delete(`auth/roles/${id}`);
    return response;
}

