
import { supabase } from './supabase.js';

const form = document.getElementById('driverRegistrationForm');
const submitButton = document.getElementById('submitRegistration');

// Check the driver's login session
async function checkDriverLogin() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        alert('Please log in before registering as a driver.');
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('email').value = data.user.email;
}

checkDriverLogin();

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = 'SUBMITTING...';

    try {
        // 1. Check the logged-in driver
        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError || !userData.user) {
            alert('Please log in before registering.');
            window.location.href = 'login.html';
            return;
        }

        const user = userData.user;

        // 2. Collect registration details
        const fullName =
            document.getElementById('fullName').value.trim();

        const email = user.email;

        const phone =
            document.getElementById('phone').value.trim();

        const vehicleType =
            document.getElementById('vehicleType').value;

        const vehicleModel =
            document.getElementById('vehicleModel').value.trim();

        const vehicleYear = Number(
            document.getElementById('vehicleYear').value
        );

        const plateNumber =
            document.getElementById('plateNumber').value.trim();

        const state =
            document.getElementById('state').value;

        const city =
            document.getElementById('city').value.trim();

        // 3. Get uploaded documents
        const vehiclePhoto =
            document.getElementById('vehiclePhoto').files[0];

        const driverLicense =
            document.getElementById('driverLicense').files[0];

        if (!vehiclePhoto || !driverLicense) {
            throw new Error('Please upload both required documents.');
        }

        // 4. Create private file paths
        const folder = user.id;
        const vehiclePath =
            `${folder}/vehicle-${Date.now()}-${vehiclePhoto.name}`;

        const licensePath =
            `${folder}/license-${Date.now()}-${driverLicense.name}`;

        // 5. Upload vehicle photograph
        const { error: vehicleUploadError } = await supabase.storage
            .from('driver-documents')
            .upload(vehiclePath, vehiclePhoto);

        if (vehicleUploadError) throw vehicleUploadError;

        // 6. Upload driver's licence
        const { error: licenseUploadError } = await supabase.storage
            .from('driver-documents')
            .upload(licensePath, driverLicense);

        if (licenseUploadError) throw licenseUploadError;

        // 7. Save application in the database
        const { error: insertError } = await supabase
            .from('driver_applications')
            .insert({
                user_id: user.id,
                full_name: fullName,
                email: email,
                phone: phone,
                vehicle_type: vehicleType,
                vehicle_model: vehicleModel,
                vehicle_year: vehicleYear,
                plate_number: plateNumber,
                state: state,
                city: city,
                vehicle_photo_path: vehiclePath,
                driver_license_path: licensePath,
                application_status: 'pending'
            });

        if (insertError) throw insertError;

        alert('Application submitted successfully! Await admin approval.');

        form.reset();

    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'SUBMIT APPLICATION';
    }
});
