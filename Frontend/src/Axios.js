import axios from 'axios';
import { API_BASE_URL, OAUTH_CLIENT_ID } from './config';

const baseUrl = API_BASE_URL;

export const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 5000,
    headers: {
        'content-type': 'application/json',
        accept: 'application/json'
    }
});

export const axiosFetchInstance = axios.create({
    baseURL: baseUrl,
    timeout: 20000,
    headers: {
        'content-type': 'application/json',
        accept: 'application/json'
    }
});

// always attach latest access token before every request
axiosFetchInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('foxCodes_accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }

        return config;
    },
    error => Promise.reject(error)
);

export const handleUnauthorized = async error => {
    const response = error?.response;

    if (!response) {
        console.error('Network or CORS error:', error?.message);
        throw error;
    }

    const originalRequest = error.config;

    if (response.status !== 401) {
        throw error;
    }

    const refreshToken = localStorage.getItem('foxCodes_refreshToken');

    // no refresh token -> go login
    if (!refreshToken) {
        localStorage.removeItem('foxCodes_accessToken');
        localStorage.removeItem('foxCodes_refreshToken');
        window.location.href = '/login';
        throw error;
    }

    // prevent infinite retry loop
    if (originalRequest._retry) {
        localStorage.removeItem('foxCodes_accessToken');
        localStorage.removeItem('foxCodes_refreshToken');
        window.location.href = '/login';
        throw error;
    }

    originalRequest._retry = true;

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', OAUTH_CLIENT_ID);
        params.append('refresh_token', refreshToken);

        const res = await axiosInstance.post('/account/auth/token/', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        localStorage.setItem('foxCodes_accessToken', res.data.access_token);

        if (res.data.refresh_token) {
            localStorage.setItem('foxCodes_refreshToken', res.data.refresh_token);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;

        return axiosFetchInstance(originalRequest);
    } catch (refreshError) {
        localStorage.removeItem('foxCodes_accessToken');
        localStorage.removeItem('foxCodes_refreshToken');
        window.location.href = '/login';
        throw refreshError;
    }
};