
import { supabase } from './supabase.js';

// 1. Check administrator access
const { data, error } = await supabase.auth.getSession();

if (error || !data.session) {
    window.location.replace('login.html');
} else {
    const user = data.session.user;
    const userRole = user.app_metadata?.role;

    if (userRole !== 'admin') {
        window.location.replace('login.html');
    } else {
        // 2. Load driver applications
        loadApplications();
    }
}

async function loadApplications() {
    const table = document.getElementById('applicationsTable');

    const { data: applications, error } = await supabase
        .from('driver_applications')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        table.innerHTML = `
            <tr>
                <td colspan="5">Could not load applications.</td>
            </tr>
        `;
        console.error(error);
        return;
    }

    if (!applications || applications.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No applications yet.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = '';

    applications.forEach(application => {
        const row = document.createElement('tr');

        const values = [
            application.full_name,
            application.vehicle_type,
            `${application.city || ''}, ${application.state || ''}`,
            application.application_status,
            'Review pending'
        ];

        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value || '—';
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}
