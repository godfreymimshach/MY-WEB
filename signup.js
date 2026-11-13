
import { supabase } from './supabase.js';

// Get the form elements
const form = document.getElementById('signupForm');
const message = document.getElementById('formMessage');

const password = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

// Show and hide password
togglePassword.addEventListener('click', function () {

    if (password.type === 'password') {
        password.type = 'text';
        togglePassword.textContent = '◎';
        togglePassword.setAttribute('aria-label', 'Hide password');
    } else {
        password.type = 'password';
        togglePassword.textContent = '◉';
        togglePassword.setAttribute('aria-label', 'Show password');
    }

});

// Handle registration
form.addEventListener('submit', async function (event) {

    event.preventDefault();

    message.textContent = 'Creating your account...';

    const button = form.querySelector('.create-account');
    button.disabled = true;

    const firstName = form.elements['firstName'].value.trim();
    const lastName = form.elements['lastName'].value.trim();
    const countryCode = form.elements['countryCode'].value;
    const phone = form.elements['phone'].value.trim();
    const email = form.elements['email'].value.trim();
    const passwordValue = password.value;
    const referral = form.elements['referral'].value;

    const fullPhone = countryCode + phone;

    const { data, error } = await supabase.auth.signUp({

        email: email,
        password: passwordValue,

        options: {
    emailRedirectTo: 'https://godfreymimshach.github.io/MY-WEB/welcome.html',

    data: {
        first_name: firstName,
        last_name: lastName,
        full_name: firstName + ' ' + lastName,
        phone: fullPhone,
        referral: referral,
        terms_accepted: true
    }
}
    });

    button.disabled = false;

   if (error) {
    message.textContent = error.message;
} else {
    message.textContent =
        'Registration successful! Please check your email and click the verification link to continue.';

    form.reset();
}
});
