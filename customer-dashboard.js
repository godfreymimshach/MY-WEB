
import { supabase } from './supabase.js';

// Find the customer booking form
const bookingForm = document.getElementById('customerBookingForm');


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

        const vehicleType =
            document.getElementById('vehicleType').value;

        const pickupLocation =
            document.getElementById('pickupLocation').value.trim();

        const destination =
            document.getElementById('destination').value.trim();

        // Save booking to Supabase
        const { error } = await supabase
            .from('customer_bookings')
            .insert({
                user_id: user.id,
                customer_name: customerName,
                vehicle_type: vehicleType,
                pickup_location: pickupLocation,
                destination: destination,
                booking_status: 'pending'
            });

        if (error) {
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
