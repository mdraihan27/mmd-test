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

// Input validation utilities
function validateEmail(email) {
    const emailRegex = /^[A-Za-z0-9+_.-]+@student\.just\.edu\.bd$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

// Real-time input validation
function addInputValidation() {
    const emailInput = document.getElementById('email');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');

    if (emailInput) {
        emailInput.addEventListener('input', function() {
            hideAllMessages();
            const email = this.value.trim();
            if (email && !validateEmail(email)) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
    }

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            hideAllMessages();
            const password = this.value;
            if (password && !validatePassword(password)) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
            
            // Check password match if confirm field has value
            if (confirmPasswordInput.value) {
                checkPasswordMatch();
            }
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }

    function checkPasswordMatch() {
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordInput.classList.add('error');
        } else {
            confirmPasswordInput.classList.remove('error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {    const emailInput = document.getElementById('email');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const verificationGroup = document.getElementById('verificationGroup');
    const verificationCodeInput = document.getElementById('verificationCode');
    const emailSection = document.getElementById('emailSection');
    const passwordSection = document.getElementById('passwordSection');
    const passwordForm = document.getElementById('passwordForm');

    let isCodeSent = false;

    // Initialize input validation
    addInputValidation();

    // Send verification code
    if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', async function() {
            hideAllMessages();
            const email = emailInput.value.trim();
            
            if (!email) {
                showErrorMessage('Please enter your email address');
                emailInput.focus();
                return;
            }

            // Email validation
            if (!validateEmail(email)) {
                showErrorMessage('Please enter a valid email address. You must use your student email (e.g., id.dept@student.just.edu.bd)');
                emailInput.focus();
                return;
            }

            setButtonLoading(sendCodeBtn, true);

            try {
                await sendPasswordResetCode(email);
                showSuccessMessage('Verification code sent to your email!');
                isCodeSent = true;
                verificationGroup.style.display = 'block';
                passwordSection.style.display = 'block';
                passwordSection.classList.remove('disabled');
                sendCodeBtn.querySelector('.btn-text').textContent = 'Resend Code';
                verificationCodeInput.focus();
            } catch (error) {
                showErrorMessage(error.message);
            } finally {
                setButtonLoading(sendCodeBtn, false);
            }
        });
    }    // Handle password form submission
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            hideAllMessages();

            if (!isCodeSent) {
                showErrorMessage('Please send verification code first');
                return;
            }

            const email = emailInput.value.trim();
            const verificationCode = verificationCodeInput.value.trim();
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            // Validation
            if (!verificationCode) {
                showErrorMessage('Please enter the verification code');
                verificationCodeInput.focus();
                return;
            }

            if (!newPassword || !confirmNewPassword) {
                showErrorMessage('Please fill in all password fields');
                document.getElementById('newPassword').focus();
                return;
            }

            if (newPassword !== confirmNewPassword) {
                showErrorMessage('Passwords do not match');
                document.getElementById('confirmNewPassword').focus();
                return;
            }

            if (!validatePassword(newPassword)) {
                showErrorMessage('Password must be at least 8 characters long');
                document.getElementById('newPassword').focus();
                return;
            }

            const submitBtn = passwordForm.querySelector('.btn');
            setButtonLoading(submitBtn, true);

            try {
                const result = await verifyAndResetPassword({
                    email,
                    verificationCode,
                    newPassword
                });

                if (result) {
                    showSuccessMessage('Password reset successful! Redirecting to home...');
                    
                    // Store tokens and user info
                    localStorage.setItem('jwt', result.jwt);
                    localStorage.setItem('refreshToken', result.refreshToken);
                    if (result.userInfo) {
                        localStorage.setItem('name', result.userInfo.name);
                        localStorage.setItem('email', result.userInfo.email);
                    }

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
});

// API Functions
async function sendPasswordResetCode(email) {
    const response = await fetch(`${SECRETS.API_URL}/api/v1/auth/password-reset/code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorText = errorData.message || response.statusText;
        throw new Error(errorText);
    }

    return await response.json();
}

async function verifyAndResetPassword(params) {
    const response = await fetch(`${SECRETS.API_URL}/api/v1/auth/password-reset/verify-and-reset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorText = errorData.message || response.statusText;
        throw new Error(errorText);
    }

    return await response.json();
}
