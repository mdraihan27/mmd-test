import { getJwtOrGoToLoginPage } from './lib/token.js';
import { showSuccessMessage, showErrorMessage, hideAllMessages } from './lib/messages.js';
import { SECRETS } from '../secrets.js';

document.addEventListener('DOMContentLoaded', async () => {
    getJwtOrGoToLoginPage();
    const tokenContainer = document.getElementById('token-container');

    try {
        const apiResponse = await tokenListApiCall({});
        if (apiResponse && apiResponse.success && Array.isArray(apiResponse.tokenList) && apiResponse.tokenList.length > 0) {
            tokenContainer.innerHTML = '';
            // Sort tokens by expiration date, newest first
            apiResponse.tokenList.sort((a, b) => b.tokenExpirationTime - a.tokenExpirationTime);
            apiResponse.tokenList.forEach(tokenData => {
                // Format date from tokenExpirationTime (ms) to DD-MM-YYYY
                const dateObj = new Date(tokenData.tokenExpirationTime);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();
                const formattedDate = `${day}-${month}-${year}`;
                // Capitalize mealTime and tokenType
                const mealType = tokenData.mealTime.charAt(0).toUpperCase() + tokenData.mealTime.slice(1);
                const tokenType = tokenData.tokenType.charAt(0).toUpperCase() + tokenData.tokenType.slice(1);
                // Remove status badge (do not render)
                const tokenElement = document.createElement('div');
                tokenElement.className = 'token-card';
                tokenElement.innerHTML = `
                    <div class="token-header">
                        <span class="token-date">${formattedDate}</span>
                    </div>
                    <div class="token-details">
                        <div class="token-detail">
                            <div class="token-detail-label">Meal</div>
                            <div class="token-detail-value meal-type">${mealType}</div>
                        </div>
                        <div class="token-detail">
                            <div class="token-detail-label">Type</div>
                            <div class="token-detail-value">${tokenType}</div>
                        </div>
                        <div class="token-detail">
                            <div class="token-detail-label">Token ID</div>
                            <div class="token-detail-value">${tokenData.tokenId}</div>
                        </div>
                    </div>
                `;
                tokenContainer.appendChild(tokenElement);
            });
        } else {
            tokenContainer.innerHTML = '<p>No tokens found.</p>';
        }
    } catch (error) {
        console.error('Error fetching token list:', error);
        tokenContainer.innerHTML = '<p>Error loading tokens.</p>';
    }
});

async function tokenListApiCall(params) {
    const jwt = await getJwtOrGoToLoginPage();
    const response = await fetch(`${SECRETS.API_URL}/api/v1/user/dining-token/token-list`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        }
        
    });
    if (!response.ok) {
        const errorData = await response.json();
        const errorText = errorData.message || response.statusText;
        throw new Error(errorText);
    }
    const data = await response.json();
    return data;
}