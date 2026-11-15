
import { supabase } from './supabase.js';

// Check the current login session
const { data, error } = await supabase.auth.getSession();

if (error || !data.session) {
    window.location.replace('login.html');
} else {
    // Check the user's administrator role
    const user = data.session.user;
    const userRole = user.app_metadata?.role;

    if (userRole !== 'admin') {
        window.location.replace('login.html');
    }
}
