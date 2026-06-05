const BASE_URL = 'http://localhost:8000/api';

export const api = {
    async get(endpoint: string) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (response.status === 401) {
            window.dispatchEvent(new CustomEvent("auth_error"));
            throw new Error("Unauthorized");
        }
        if (!response.ok) throw new Error(`GET ${endpoint} failed`);
        return response.json();
    },
    
    async post(endpoint: string, body: any) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(body)
        });
        if (response.status === 401) {
            window.dispatchEvent(new CustomEvent("auth_error"));
            throw new Error("Unauthorized");
        }
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `POST ${endpoint} failed`);
        }
        return response.json();
    },

    async put(endpoint: string, body: any) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(body)
        });
        if (response.status === 401) {
            window.dispatchEvent(new CustomEvent("auth_error"));
            throw new Error("Unauthorized");
        }
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `PUT ${endpoint} failed`);
        }
        return response.json();
    },

    async delete(endpoint: string) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (response.status === 401) {
            window.dispatchEvent(new CustomEvent("auth_error"));
            throw new Error("Unauthorized");
        }
        if (!response.ok) throw new Error(`DELETE ${endpoint} failed`);
        return response.json();
    }
};
