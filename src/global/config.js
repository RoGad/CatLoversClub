
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    // Всегда используем относительный путь /api
    // В разработке проксируется через vite.config.js
    // В продакшене проксируется через vercel.json
    return '/api';
};

const getImageBaseUrl = () => {
    if (import.meta.env.VITE_IMAGE_BASE_URL) {
        return import.meta.env.VITE_IMAGE_BASE_URL;
    }
    
    const isProduction = import.meta.env.PROD || 
        (typeof window !== 'undefined' && 
         window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1');
    
    if (isProduction) {
        return 'http://100.69.119.140/';
    }
    
    return 'http://localhost/';
};

const getVKRedirectUrl = () => {
    if (import.meta.env.VITE_VK_REDIRECT_URL) {
        return import.meta.env.VITE_VK_REDIRECT_URL;
    }
    
    if (import.meta.env.PROD) {
        return 'https://cat-lovers-club-19hu.vercel.app';
    }
    
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    
    return 'http://localhost:5173';
};

export const API_BASE_URL = getApiBaseUrl();
export const IMAGE_BASE_URL = getImageBaseUrl();
export const VK_APP_ID = import.meta.env.VITE_VK_APP_ID || '54316470';
export const VK_REDIRECT_URL = getVKRedirectUrl();