export const checkJwtValidity = (jwt) => {
    if (!jwt) return false;

    const parts = jwt.split('.');
    if (parts.length !== 3) return false;

    try {
        // Decode JWT payload safely (handling Unicode)
        const payload = JSON.parse(decodeJwtPayload(parts[1]));

        if (payload.exp) {
            const now = Date.now();
            const expiry = payload.exp * 1000;
            const buffer = 2 * 60 * 1000; // 2 minutes in ms

            // Consider token expired if it will expire in next 2 minutes
            if (now >= expiry - buffer) {
                return false;
            }
        }

        return true;
    } catch (e) {
        cleanLocalStorageAuthData();
        console.error('Invalid JWT structure:', e);
        return false;
    }
};

const decodeJwtPayload = (base64Url) => {
    // Pad string for decoding
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    const jsonPayload = decodeURIComponent(atob(padded).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return jsonPayload;
};

const refreshJwt = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('Refresh token is required');

    try {
        const response = await fetch(`http://localhost:8089/api/v1/auth/refresh?refreshToken=${refreshToken}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const data = await response.json();
        localStorage.setItem('jwt', data.jwt);
        return data.jwt;
    } catch (error) {
        cleanLocalStorageAuthData();
        console.error('Error refreshing JWT:', error);
        throw error;
    }
};

export const cleanLocalStorageAuthData = () => {
    localStorage.removeItem('jwt'); 
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
}

export const getJwtOrGoToLoginPage = async () => {
    let jwt = localStorage.getItem('jwt');
    if (!jwt || !checkJwtValidity(jwt)) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken || !checkJwtValidity(refreshToken)) {
            // Use relative path that works from pages directory
            window.location.href = 'login.html';
            cleanLocalStorageAuthData();
            return null;
        }

        try {
            const refreshedJwt = await refreshJwt();
            if (!refreshedJwt) {
                window.location.href = 'login.html';
                cleanLocalStorageAuthData();
                return null;
            }
            jwt = refreshedJwt;
        } catch (error) {
            window.location.href = 'login.html';
            return null;
        }
    }

    return jwt;
};
