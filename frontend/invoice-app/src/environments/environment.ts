export const environment = {
    production: false,
    apiBaseUrl: 'http://localhost:5000/api',
    apiEndpoints: {
        auth: {
            login: '/auth/login',
        },
        logs: {
            error: '/logs/error'
        },
    },
};