
import { supabase } from './supabase.js';

// Find the customer booking form
const bookingForm = document.getElementById('customerBookingForm');

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
