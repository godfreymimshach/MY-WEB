
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
        loadApprovedFleet();
        loadBookings();
    }
}

// VIEW DRIVER VEHICLE PHOTO AND LICENCE
async function addApplicationDocuments(actionCell, application) {

    // VEHICLE PHOTO (PUBLIC BUCKET)
    if (application.vehicle_photo_path) {

        const { data } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(application.vehicle_photo_path);

        const vehicleImage = document.createElement('img');

        vehicleImage.src = data.publicUrl;
        vehicleImage.alt = 'Driver vehicle photo';
        vehicleImage.style.width = '110px';
        vehicleImage.style.height = '75px';
        vehicleImage.style.objectFit = 'cover';
        vehicleImage.style.display = 'block';
        vehicleImage.style.marginBottom = '8px';

        actionCell.appendChild(vehicleImage);

    } else {
        const noPhoto = document.createElement('p');
        noPhoto.textContent = 'No vehicle photo uploaded.';
        actionCell.appendChild(noPhoto);
    }


    // DRIVER LICENCE (PRIVATE BUCKET)
    if (application.driver_license_path) {

        const { data, error } = await supabase.storage
            .from('driver-documents')
            .createSignedUrl(application.driver_license_path, 60);

        if (error) {
            console.error('Licence access error:', error);

            const message = document.createElement('p');
            message.textContent = 'Could not load licence.';
            actionCell.appendChild(message);

        } else {
            const licenceLink = document.createElement('a');

            licenceLink.href = data.signedUrl;
            licenceLink.textContent = 'VIEW DRIVER LICENCE';
            licenceLink.target = '_blank';
            licenceLink.rel = 'noopener noreferrer';

            actionCell.appendChild(licenceLink);
        }

    } else {
        const noLicence = document.createElement('p');
        noLicence.textContent = 'No licence uploaded.';
        actionCell.appendChild(noLicence);
    }
}

// LOAD DRIVER APPLICATIONS
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
    application.service_type,
    `${application.city || ''}, ${application.state || ''}`,
    application.application_status
];
        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value || '—';
            row.appendChild(cell);
        });

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


// LOAD REGISTERED VEHICLES

async function loadVehicles() {
    const table = document.getElementById('vehiclesTable');

    table.textContent = 'Loading vehicles...';

    const { data: vehicles, error } = await supabase
        .from('driver_applications')
        .select('full_name, vehicle_type, service_type, vehicle_model, plate_number, application_status, vehicle_photo_path')
        .order('created_at', { ascending: false });

    if (error) {
        table.textContent = 'Could not load vehicles.';
        console.error(error);
        return;
    }

    table.replaceChildren();

    if (!vehicles || vehicles.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 7;
        cell.textContent = 'No vehicles registered yet.';

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    vehicles.forEach(vehicle => {
        const row = document.createElement('tr');

        const values = [
            vehicle.vehicle_type,
            vehicle.service_type,
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

        // VEHICLE PHOTO
        const photoCell = document.createElement('td');

        if (vehicle.vehicle_photo_path) {
            const { data } = supabase.storage
                .from('vehicle-photos')
                .getPublicUrl(vehicle.vehicle_photo_path);

            const image = document.createElement('img');
            image.src = data.publicUrl;
            image.alt = 'Vehicle photo';
            image.style.width = '90px';
            image.style.height = '65px';
            image.style.objectFit = 'cover';

            photoCell.appendChild(image);
        } else {
            photoCell.textContent = 'No photo';
        }

        row.appendChild(photoCell);
        table.appendChild(row);
    });
}


// LOAD APPROVED FLEET
async function loadApprovedFleet() {
    const table = document.getElementById('approvedFleetTable');

    table.textContent = 'Loading approved vehicles...';

    const { data: vehicles, error } = await supabase
        .from('driver_applications')
        .select('full_name, vehicle_type, service_type, vehicle_model, state, city, application_status, vehicle_photo_path')        .eq('application_status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        table.textContent = 'Could not load approved vehicles.';
        console.error(error);
        return;
    }

    table.replaceChildren();

    if (!vehicles || vehicles.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 5;
        cell.textContent = 'No approved vehicles yet.';

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    vehicles.forEach(vehicle => {
        const row = document.createElement('tr');

        const values = [
    vehicle.full_name,
    vehicle.vehicle_type,
    vehicle.service_type,
    vehicle.vehicle_model,
    `${vehicle.city || ''}, ${vehicle.state || ''}`,
    'Approved'
];

        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value || '—';
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}


// LOAD CUSTOMER BOOKINGS

// LOAD CUSTOMER BOOKINGS
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

        cell.colSpan = 7;
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
             booking.service_purpose,
             booking.pickup_location,
             booking.destination,
            booking.booking_status
        ];

        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value || '—';
            row.appendChild(cell);
        });

        const actionCell = document.createElement('td');

        
        if (booking.booking_status === 'pending') {
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';

            approveButton.addEventListener('click', () => {
                updateBooking(booking.id, 'approved');
            });

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';

            rejectButton.addEventListener('click', () => {
                updateBooking(booking.id, 'rejected');
            });

            actionCell.append(approveButton, rejectButton);

        } else if (booking.booking_status === 'approved') {
            const completeButton = document.createElement('button');
            completeButton.textContent = 'Complete';

            completeButton.addEventListener('click', () => {
                updateBooking(booking.id, 'completed');
            });

            actionCell.appendChild(completeButton);

        } else {
            actionCell.textContent = 'Reviewed';
        }

        row.appendChild(actionCell);
        table.appendChild(row);
    });
}


// UPDATE CUSTOMER BOOKING STATUS
async function updateBooking(id, status) {
    const { error } = await supabase
        .from('customer_bookings')
        .update({ booking_status: status })
        .eq('id', id);

    if (error) {
        alert('Could not update booking. Please try again.');
        console.error(error);
        return;
    }

    alert(`Booking ${status} successfully!`);

    loadBookings();
}


// APPROVE OR REJECT APPLICATION
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
    loadVehicles();
    loadApprovedFleet();
}
