
import { supabase } from './supabase.js';

// Get the form elements
const form = document.getElementById('forgotPasswordForm');
const message = document.getElementById('resetMessage');

form.addEventListener('submit', async function (event) {

    event.preventDefault();

    message.textContent = 'Sending password reset email...';

    const button = form.querySelector('.create-account');
    button.disabled = true;

    const email = form.elements['email'].value.trim();

    try {

        const { error } = await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: 'https://godfreymimshach.github.io/MY-WEB/reset-password.html'
            }
        );

        if (error) {
            message.textContent = error.message;
        } else {
            message.textContent =
                'If an account exists for this email, a password reset link will be sent. Please check your inbox.';
        }

    } catch (error) {

        message.textContent =
            'Connection error. Please try again.';

    } finally {

        button.disabled = false;

    }

});
