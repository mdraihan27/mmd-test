import { getJwtOrGoToLoginPage } from './lib/token.js';
import { showSuccessMessage, showErrorMessage, hideAllMessages } from './lib/messages.js';
import { SECRETS } from '../secrets.js';


// Button loading state utility functions
function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (isLoading) {
        button.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    } else {
        button.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// Real-time input validation
function addInputValidation() {
    const verificationCodeInput = document.getElementById('verificationCode');

    if (verificationCodeInput) {
        verificationCodeInput.addEventListener('input', function() {
            hideAllMessages();
            const code = this.value.trim();
            if (code && (code.length < 6 || code.length > 8)) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize input validation
    getJwtOrGoToLoginPage();
    addInputValidation();

    // Add input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });
    });

    const emailSentText = document.getElementById('emailSentText');
    if (emailSentText) {
        emailSentText.textContent = `A verification code has been sent to ${localStorage.getItem('email')}`
    }

    const emailVerifyForm = document.getElementById('emailVerifyForm');
    if (emailVerifyForm) {
        emailVerifyForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            hideAllMessages();

            const verificationCode = document.getElementById('verificationCode').value.trim();

            if (!verificationCode) {
                showErrorMessage('Please enter the verification code');
                document.getElementById('verificationCode').focus();
                return;
            }

            if (verificationCode.length < 6 || verificationCode.length > 8) {
                showErrorMessage('Verification code must be 6-8 characters long');
                document.getElementById('verificationCode').focus();
                return;
            }

            const submitBtn = emailVerifyForm.querySelector('.btn');
            setButtonLoading(submitBtn, true);

            try {
                const result = await verifyEmailCall({ verificationCode });
                if (result) {
                    showSuccessMessage('User verified! Welcome');
                    setTimeout(() => {
                        window.location.href = '../pages/home.html';
                    }, 2000);
                }
            } catch (error) {
                showErrorMessage(error.message);
            } finally {
                setButtonLoading(submitBtn, false);
            }
        });
    }  

      const resendLink = document.getElementById('resendLink');    
    if (resendLink) {
        resendLink.addEventListener('click', async function (e) {
            e.preventDefault();
            hideAllMessages();

            // Disable link temporarily
            this.style.pointerEvents = 'none';
            this.style.opacity = '0.6';
            this.textContent = 'Sending...';
            
            try {
                await sendEmailVerificationCodeCall();
                showSuccessMessage('Verification code sent successfully!');
                this.textContent = 'Resend Code';
            } catch (error) {
                showErrorMessage(error.message);
            } finally {
                // Re-enable link
                this.style.pointerEvents = 'auto';
                this.style.opacity = '1';
                this.textContent = 'Resend Code';
            }
        });
    }
    

});



export async function sendEmailVerificationCodeCall() {

    const jwt = await getJwtOrGoToLoginPage();

    const response = await fetch(`${SECRETS.API_URL}/api/v1/auth/email-verification/code`, {
        method: 'POST',
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

async function verifyEmailCall(params) {

    const jwt = await getJwtOrGoToLoginPage();

    const response = await fetch(`${SECRETS.API_URL}/api/v1/auth/email-verification/verify`, {
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