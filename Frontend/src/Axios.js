import axios from 'axios';
import { message } from 'antd';
import { API_BASE_URL, OAUTH_CLIENT_ID } from './config';

const baseUrl = API_BASE_URL

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
        Authorization: localStorage.getItem('foxCodes_accessToken')
            ? `Bearer ${localStorage.getItem('foxCodes_accessToken')}`
            : null,
        'content-type': 'application/json',
        accept: 'application/json'
    }
});

export const handleUnauthorized = error => {
    const { response } = error

    // Network / CORS errors have no response — log and bail
    if (!response) {
        console.error('Network or CORS error:', error.message)
        return
    }

    const originalRequest = response.config

    if (
        response.status === 401 &&
        response.data.detail === "Authentication credentials were not provided." &&
        response.statusText === "Unauthorized"
    ) {
        window.location.href = '/login'
    }

    if (
        response.status === 401 &&
        response.data.detail === "Invalid token header. No credentials provided." &&
        response.statusText === "Unauthorized"
    ) {
        const refresh_token = localStorage.getItem('foxCodes_refreshToken')

        if (refresh_token) {
            const params = new URLSearchParams();
            params.append("grant_type", "refresh_token");
            params.append("client_id", OAUTH_CLIENT_ID);
            params.append("refresh_token", refresh_token);

            axiosInstance
                .post('/account/auth/token/', params, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                })
                .then(res => {
                    localStorage.setItem('foxCodes_accessToken', res.data.access_token);
                    localStorage.setItem('foxCodes_refreshToken', res.data.refresh_token);

                    originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
                    return axiosFetchInstance(originalRequest)
                })
                .catch(error => console.log(error))
        } else {
            window.location.href = '/login'
        }

    }

    if (
        response.status === 401 &&
        originalRequest.data?.refresh_token
    ) window.location.href = '/login'
}