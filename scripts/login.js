import { showSuccessMessage, showErrorMessage, hideAllMessages } from './lib/messages.js';
import { getJwtOrGoToLoginPage, cleanLocalStorageAuthData } from './lib/token.js';
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
    const passwordInput = document.getElementById('password');

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

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            hideAllMessages();
            const password = this.value;
            if (password && !validatePassword(password)) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize input validation
    // const jwt = getJwtOrGoToLoginPage();
    // if (jwt) {
    //     showSuccessMessage('User already logged in. Redirecting to home page');

    //      window.location.href = '../pages/home.html';
        
    // }
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

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideAllMessages();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Basic validation
        if (!email || !password) {
            showErrorMessage('Please fill in all fields');
            return;
        }

        // Email validation
        if (!validateEmail(email)) {
            showErrorMessage('Please enter a valid email address. You must use your student email (e.g., id.dept@student.just.edu.bd)');
            document.getElementById('email').focus();
            return;
        }

        if (!validatePassword(password)) {
            showErrorMessage('Password must be at least 8 characters long');
            document.getElementById('password').focus();
            return;
        }

        const submitBtn = loginForm.querySelector('.btn');
        setButtonLoading(submitBtn, true);

        try {
            const result = await loginApiCall({ email, password });
            if (result) {
                showSuccessMessage(`Login successful! Welcome, ${result.userInfo?.name || 'User'}`);
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
});

async function loginApiCall(params) {
    const response = await fetch(`${SECRETS.API_URL}/api/v1/auth/login`, {
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

    const data = await response.json();
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('name', data.userInfo.name);
    localStorage.setItem('email', data.userInfo.email);    return data;
}
