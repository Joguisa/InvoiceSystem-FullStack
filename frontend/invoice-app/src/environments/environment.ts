export const environment = {
    production: false,
    apiBaseUrl: 'https://localhost:7145/api',
    apiEndpoints: {
        auth: {
            login: '/auth/login',
        },
        logs: {
            error: '/logs/error'
        },
    },
};