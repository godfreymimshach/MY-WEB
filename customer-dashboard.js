
import { supabase } from './supabase.js';

// Find the customer booking form
const bookingForm = document.getElementById('customerBookingForm');

// CUSTOMER VEHICLE SEARCH
const vehicleTypeSelect = document.getElementById('vehicleType');
const servicePurposeSelect = document.getElementById('servicePurpose');
const availableVehicles = document.getElementById('availableVehicles');
const selectedVehicleId = document.getElementById('selectedVehicleId');

let approvedVehicles = [];

async function loadApprovedVehicles() {
    availableVehicles.textContent = 'Loading approved vehicles...';

    selectedVehicleId.value = '';

    try {
        const { data, error } = await supabase.rpc(
            'get_approved_vehicles'
        );

        if (error) throw error;

        approvedVehicles = data || [];

        displayMatchingVehicles();

    } catch (error) {
        console.error('Vehicle loading error:', error);

        availableVehicles.textContent =
            'Unable to load vehicles. Please try again.';
    }
}

function displayMatchingVehicles() {
    availableVehicles.replaceChildren();
    selectedVehicleId.value = '';

    const vehicleType = vehicleTypeSelect.value;
    const servicePurpose = servicePurposeSelect.value;

    if (!vehicleType || !servicePurpose) {
        availableVehicles.textContent =
            'Select a service purpose and vehicle type to see available vehicles.';
        return;
    }

    const matchingVehicles = approvedVehicles.filter(vehicle => {
        const supportsService =
            vehicle.service_type === servicePurpose ||
            vehicle.service_type === 'both';

        return vehicle.vehicle_type === vehicleType && supportsService;
    });

    if (matchingVehicles.length === 0) {
        availableVehicles.textContent =
            'No approved vehicles match your selection yet.';
        return;
    }

    matchingVehicles.forEach(vehicle => {
        const card = document.createElement('div');
        card.className = 'customer-vehicle-card';

        const image = document.createElement('img');

        image.alt = vehicle.vehicle_model;
        image.src = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(vehicle.vehicle_photo_path)
            .data.publicUrl;

        const name = document.createElement('h3');
        name.textContent = vehicle.vehicle_model;

        const details = document.createElement('p');
        details.textContent =
            `${vehicle.vehicle_type} | ${vehicle.vehicle_year}`;

        const selectButton = document.createElement('button');
        selectButton.type = 'button';
        selectButton.textContent = 'SELECT THIS VEHICLE';

        selectButton.addEventListener('click', () => {
            selectedVehicleId.value = vehicle.id;

            availableVehicles
                .querySelectorAll('.customer-vehicle-card')
                .forEach(item => item.classList.remove('selected'));

            card.classList.add('selected');

            selectButton.textContent = 'VEHICLE SELECTED';
        });

        card.append(image, name, details, selectButton);

        availableVehicles.appendChild(card);
    });
}

vehicleTypeSelect.addEventListener(
    'change',
    displayMatchingVehicles
);

servicePurposeSelect.addEventListener(
    'change',
    displayMatchingVehicles
);

loadApprovedVehicles();

const pickupInput = document.getElementById('pickupLocation');
const pickupSuggestions = document.getElementById('pickupSuggestions');
const pickupLatitude = document.getElementById('pickupLatitude');
const pickupLongitude = document.getElementById('pickupLongitude');

let pickupSearchTimer;

pickupInput.addEventListener('input', () => {
    clearTimeout(pickupSearchTimer);

    // Clear previously selected coordinates
    pickupLatitude.value = '';
    pickupLongitude.value = '';
    pickupSuggestions.replaceChildren();

    const searchText = pickupInput.value.trim();

    if (searchText.length < 3) return;

    pickupSuggestions.textContent = 'Searching locations...';

    pickupSearchTimer = setTimeout(async () => {
        try {
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchText)}&limit=5&lang=en`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Address search failed.');
            }

            const data = await response.json();

            pickupSuggestions.replaceChildren();

            if (!data.features.length) {
                pickupSuggestions.textContent = 'No matching locations found.';
                return;
            }

            data.features.forEach(feature => {
                const place = feature.properties;
                const coordinates = feature.geometry.coordinates;

                const address = [
                    place.name,
                    place.street,
                    place.city || place.town || place.village,
                    place.state,
                    place.country
                ].filter(Boolean);

                const addressText = [...new Set(address)].join(', ');

                const suggestion = document.createElement('button');
                suggestion.type = 'button';
                suggestion.textContent = addressText;

                suggestion.addEventListener('click', () => {
                    pickupInput.value = addressText;
                    pickupLatitude.value = coordinates[1];
                    pickupLongitude.value = coordinates[0];

                    pickupSuggestions.replaceChildren();

                    document.getElementById('pickupMessage').textContent =
                        'Pickup location selected successfully.';
                });

                pickupSuggestions.appendChild(suggestion);
            });

        } catch (error) {
            console.error('Pickup search error:', error);
            pickupSuggestions.textContent =
                'Unable to search locations. Please try again.';
        }
    }, 500);
});


// Listen for form submission
bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = document.getElementById('bookingSubmitBtn');

    submitButton.disabled = true;
    submitButton.textContent = 'SUBMITTING...';

    try {
        // Get the logged-in customer
        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError || !userData.user) {
            alert('Please log in before making a booking.');
            window.location.href = 'login.html';
            return;
        }

        const user = userData.user;

        // Collect booking details
        const customerName =
            document.getElementById('customerName').value.trim();

        const vehicleType = document.getElementById('vehicleType').value;
        const servicePurpose = document.getElementById('servicePurpose').value;
        const pickupLocation = document.getElementById('pickupLocation').value.trim();
        const destination = document.getElementById('destination').value.trim();
        const selectedVehicle = selectedVehicleId.value;

if (!selectedVehicle) {
    alert('Please select a vehicle before submitting your booking.');
    return;
}

        // Save booking to Supabase
        const { error } = await supabase
            .from('customer_bookings')
            .insert({
                user_id: user.id,
                customer_name: customerName,
                vehicle_type: vehicleType,
                service_purpose: servicePurpose,
                pickup_location: pickupLocation,
                destination: destination,
                booking_status: 'pending'
            });

        if (error)  {
            throw error;
        }

        alert('Booking submitted successfully! Await admin approval.');

        bookingForm.reset();

    } catch (error) {
        console.error('Booking error:', error);
        alert('Booking failed. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'SUBMIT BOOKING';
    }
});
