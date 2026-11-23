
import { supabase } from './supabase.js';

// Check administrator access
const { data, error } = await supabase.auth.getSession();

if (error || !data.session) {
    window.location.replace('login.html');
} else {
    const userRole = data.session.user.app_metadata?.role;

    if (userRole !== 'admin') {
        window.location.replace('login.html');
   } else {
    loadApplications();
    loadVehicles();
    loadBookings();
}

// Load registered vehicles
async function loadVehicles() {
    const table = document.getElementById('vehiclesTable');

    table.textContent = 'Loading vehicles...';

    const { data: vehicles, error } = await supabase
        .from('driver_applications')
        .select('full_name, vehicle_type, vehicle_model, plate_number, application_status')
        .order('created_at', { ascending: false });

    if (error) {
        table.textContent = 'Could not load vehicles.';
        console.error(error);
        return;


// Load customer bookings
async function loadBookings() {
    const table = document.getElementById('bookingsTable');

    table.textContent = 'Loading bookings...';

    const { data: bookings, error } = await supabase
        .from('customer_bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        table.textContent = 'Could not load customer bookings.';
        console.error(error);
        return;
    }

    table.replaceChildren();

    if (!bookings || bookings.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 6;
        cell.textContent = 'No customer bookings yet.';

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    bookings.forEach(booking => {
        const row = document.createElement('tr');

        const values = [
            booking.id,
            booking.customer_name,
            booking.vehicle_type,
            booking.pickup_location,
            booking.destination,
            booking.booking_status
        ];

        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value || '—';
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

    }

    table.replaceChildren();

    if (!vehicles || vehicles.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 5;
        cell.textContent = 'No vehicles registered yet.';

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    vehicles.forEach(vehicle => {
        const row = document.createElement('tr');

        const values = [
            vehicle.vehicle_type,
            vehicle.vehicle_model,
            vehicle.plate_number,
            vehicle.full_name,
            vehicle.application_status
        ];

        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value || '—';
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

}

// Load driver applications
async function loadApplications() {
    const table = document.getElementById('applicationsTable');

    table.textContent = 'Loading applications...';

    const { data: applications, error } = await supabase
        .from('driver_applications')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        table.textContent = 'Could not load applications.';
        console.error(error);
        return;
    }

    table.replaceChildren();

    if (!applications || applications.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 5;
        cell.textContent = 'No applications yet.';

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    applications.forEach(application => {
        const row = document.createElement('tr');

        const values = [
            application.full_name,
            application.vehicle_type,
            `${application.city || ''}, ${application.state || ''}`,
            application.application_status
        ];

        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value || '—';
            row.appendChild(cell);
        });

        // Create action buttons
        const actionCell = document.createElement('td');

        if (application.application_status === 'pending') {
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';

            approveButton.addEventListener('click', () => {
                updateApplication(application.id, 'approved');
            });

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';

            rejectButton.addEventListener('click', () => {
                updateApplication(application.id, 'rejected');
            });

            actionCell.append(approveButton, rejectButton);
        } else {
            actionCell.textContent = 'Reviewed';
        }

        row.appendChild(actionCell);
        table.appendChild(row);
    });
}

// Approve or reject an application
async function updateApplication(id, status) {
    const { error } = await supabase
        .from('driver_applications')
        .update({ application_status: status })
        .eq('id', id);

    if (error) {
        alert('Could not update application. Please try again.');
        console.error(error);
        return;
    }

    alert(`Application ${status} successfully!`);

    loadApplications();
}
