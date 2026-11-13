
import { supabase } from './supabase.js';

// Get the login form
const form = document.getElementById('loginForm');

const message = document.getElementById('loginMessage');

const password = document.getElementById('loginPassword');

const togglePassword = document.getElementById('showLoginPassword');

// Show or hide password
togglePassword.addEventListener('click', function () {

    if (password.type === 'password') {
        password.type = 'text';
        togglePassword.textContent = '◎';
    } else {
        password.type = 'password';
        togglePassword.textContent = '◉';
    }

});

// Handle login
form.addEventListener('submit', async function (event) {

    event.preventDefault();

    message.textContent = 'Logging in...';

    const button = form.querySelector('.create-account');

    button.disabled = true;

    const email = form.elements['email'].value.trim();

    const passwordValue = password.value;

    const preferredService = form.elements['preferredService'].value;

    try {

        const { data, error } = await supabase.auth.signInWithPassword({

            email: email,

            password: passwordValue

        });

        if (error) {
            message.textContent = error.message;
        
} else {
    message.textContent = 'Login successful!';

    const dashboardPages = {
        'logistics': 'logistics-dashboard.html',
        'vehicle-sales': 'vehicle-dashboard.html',
        'hire-purchase': 'hire-purchase.html',
        'my-account': 'account-dashboard.html'
    };

    const selectedPage = dashboardPages[preferredService];

    if (selectedPage) {
        window.location.href = selectedPage;
    } else {
        message.textContent = 'Please select a service.';
    }
}


    } catch (error) {

        message.textContent = 'Connection error. Please try again.';

    } finally {

        button.disabled = false;

    }

});
