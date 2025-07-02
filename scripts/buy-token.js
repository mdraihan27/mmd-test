import { getJwtOrGoToLoginPage } from './lib/token.js';
import { showSuccessMessage, showErrorMessage, hideAllMessages } from './lib/messages.js';
// main.js
import { SECRETS } from '../secrets.js';



// Function to reset all form inputs
function resetTokenForm() {
    // Reset all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset all radio buttons
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.checked = false;
    });
}

document.addEventListener('DOMContentLoaded', async () => {

    getJwtOrGoToLoginPage();

    const lunchType = document.getElementById('lunch-type');
    const dinnerType = document.getElementById('dinner-type');
    const lunchPrice = document.getElementById('lunch-price');
    const dinnerPrice = document.getElementById('dinner-price');

    const mealInfoCallResponse = await mealInfoApiCall({});

    if (mealInfoCallResponse && mealInfoCallResponse.success) {
        const mealInfo = mealInfoCallResponse.mealInfo;

        lunchType.textContent = mealInfo.lunchMealType;
        dinnerType.textContent = mealInfo.dinnerMealType;
        lunchPrice.textContent = `৳ ${mealInfo.lunchMealPrice}`;
        dinnerPrice.textContent = `৳ ${mealInfo.dinnerMealPrice}`;
    } else {
        showErrorMessage('Failed to load meal information.');
    }


    const buyTokenButton = document.getElementById('buy-token-button');
    buyTokenButton.addEventListener('click', async (e) => {
        e.preventDefault();
        hideAllMessages();

        const lunchCheckbox = document.getElementById('lunch-checkbox');
        const dinnerCheckbox = document.getElementById('dinner-checkbox');
        
        // Check if at least one meal is selected
        if (!lunchCheckbox.checked && !dinnerCheckbox.checked) {
            showErrorMessage('Please select at least one meal.');
            return;
        }
        
        let successfulPurchases = 0;
        let totalPurchases = 0;

        if (lunchCheckbox.checked) {
            totalPurchases++;
            const mealTime = 'lunch';
            const diningTokenType = document.querySelector('input[name="lunch-token-type"]:checked')?.value;
            if (!diningTokenType) {
                showErrorMessage('Please select a lunch dining token type.');
                return;
            }
            try {
                const apiResponse = await buyTokenApiCall({mealTime, diningTokenType});
                if (apiResponse && apiResponse.success) {
                    successfulPurchases++;
                } else {
                    showErrorMessage('Failed to purchase lunch token.');
                }
            } catch (error) {
                console.error('Error purchasing lunch token:', error);
                showErrorMessage(error.message || 'An error occurred while purchasing the lunch token.');
            }
        }

        if (dinnerCheckbox.checked) {
            totalPurchases++;
            const mealTime = 'dinner';
            const diningTokenType = document.querySelector('input[name="dinner-token-type"]:checked')?.value;
            if (!diningTokenType) {
                showErrorMessage('Please select a dinner dining token type.');
                return;
            }
            try {
                const apiResponse = await buyTokenApiCall({mealTime, diningTokenType});
                if (apiResponse && apiResponse.success) {
                    successfulPurchases++;
                } else {
                    showErrorMessage('Failed to purchase dinner token.');
                }
            } catch (error) {
                console.error('Error purchasing dinner token:', error);
                showErrorMessage(error.message || 'An error occurred while purchasing the dinner token.');
            }
        }
        
        // Show success message and reset form if any purchases were successful
        if (successfulPurchases > 0) {
            showSuccessMessage(`Token(s) purchased successfully! (${successfulPurchases}/${totalPurchases})`);
            resetTokenForm();
        }
    });

});

async function mealInfoApiCall(params) {
    // const jwt = await getJwtOrGoToLoginPage();
    const response = await fetch(`${SECRETS.API_URL}/api/v1/public/meal-info/get`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
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

async function buyTokenApiCall(params) {
    const jwt = await getJwtOrGoToLoginPage();
    const response = await fetch(`${SECRETS.API_URL}/api/v1/user/dining-token/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(params)

    });
    if (!response.ok) {
        const errorData = await response.json();
        const errorText = errorData.message || response.statusText;
        throw new Error(errorText);
    }
    const data = await response.json();
    return data;
}

