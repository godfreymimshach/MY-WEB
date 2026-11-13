
import { supabase } from './supabase.js';

// Get the form elements
const form = document.getElementById('resetPasswordForm');
const message = document.getElementById('resetMessage');

form.addEventListener('submit', async function (event) {

    event.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check whether both passwords match
    if (newPassword !== confirmPassword) {
        message.textContent = 'Passwords do not match.';
        return;
    }

    message.textContent = 'Updating your password...';

    const button = form.querySelector('.create-account');
    button.disabled = true;

    try {

        // Update the password in Supabase
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            message.textContent = error.message;
        } else {
            message.textContent =
                'Password changed successfully! You can now log in.';

            form.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2500);
        }

    } catch (error) {

        message.textContent =
            'Connection error. Please try again.';

    } finally {

        button.disabled = false;

    }

});
