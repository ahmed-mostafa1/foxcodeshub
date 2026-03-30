import axios from 'axios';
import { message } from 'antd';

const baseUrl = 'https://foxsourcecode.com/api'

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
    const originalRequest = response.config

    if (typeof error === 'undefined') {
        message.error(
            `A server/network error 
            looks like cors may be the problem
            sorry about this, we will get it fixed shortly`,
            3
        );
        setTimeout(async()=> {
            await axiosFetchInstance(originalRequest)
        },3000)
    }
    if (
        response.status === 401 && 
        response.data.detail === "Authentication credentials were not provided." &&
        response.statusText === "Unauthorized"
        ){
            window.location.href = '/login'
    }
    if (
        response.status === 401 &&
        response.data.detail === "Invalid token header. No credentials provided." &&
        response.statusText === "Unauthorized"
    ){
        const refresh_token = localStorage.getItem('foxCodes_refreshToken')
        if (refresh_token){
            const body = JSON.stringify({
                grant_type: "refresh_token",
                client_id: "WHRieTI9jGGoct7DpgXXeciVI11tcgX2asJrHZ0Z",
                client_secret: "wityohIXRQn2ph1TlUO5MhNovgtH8LpEhkooXBQPMYvyT6S6X78vsKeEORvDbJAHemBs4AVBeLrODTvgR49A0Cdfb9W38NC2T5q6sItdbu1kRsGq2vg3UFpZcdwvsNth",
                refresh_token
            })
            axiosInstance
            .post('/account/auth/token/', body)
            .then(res => {
                localStorage.setItem('foxCodes_accessToken', res.data.access_token);
                localStorage.setItem('foxCodes_refreshToken', res.data.refresh_token);
                console.log(res.data.access_token)
                console.log(originalRequest)
                originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
                console.log(originalRequest)
                return axiosFetchInstance(originalRequest)
            })
            .catch(error => console.log(error))
        } else {
            window.location.href = '/login'
        }

    }
    if (
        response.status === 401 &&
        originalRequest.data.refresh_token
    ) window.location.href = '/login'
}

// axiosFetchInstance.interceptors.response.use(
//     (response) => {
//         return response
//     },

//     async function (error) {
//         const originalRequest = error.config;

//         if (typeof error.response == 'undefined') {
//             alert(
//                 `A server/network error 
//                 looks like cors may be the problem
//                 sorry about this, we will get it fixed shortly`
//             );
//             return Promise.reject(error);
//         };

//         if (
//             error.response.status === 401 &&
//             originalRequest.url === baseUrl + '/account/auth/refresh'
//         ) {
//             window.location.href = '/';
//             return Promise.reject(error);
//         }

//         if (
//             error.response.data.code === 'token_not_valid' &&
//             error.response.status === 401 &&
//             error.response.statusText === 'unauthorized'
//         ) {
//             const refresh_token = localStorage.getItem('foxCodes_refreshToken');
//             if (refresh_token) {
//                 return axiosFetchInstance
//                     .post('/account/auth/refresh', { refresh: refresh_token })
//                     .then((res) => {
//                         localStorage.setItem('foxCodes_accessToken', res.data.access_token);
//                         localStorage.setItem('foxCodes_refreshToken', res.data.refresh_token);

//                         axiosFetchInstance.defaults.headers['Authorization'] = `Bearer ${res.data.access_token}`;
//                         originalRequest.defaults.headers['Authorization'] = `Bearer ${res.data.access_token}`;

//                         return axiosFetchInstance(originalRequest);

//                     }).catch((err) => {
//                         // console.log(err)
//                     })
//             } else {
//                 // console.log('refresh token not available')
//                 window.location.href = '/'
//             }
//         }


//     }
// )

