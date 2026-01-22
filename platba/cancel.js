// Cancel/Failed Page Logic

// Get error message from URL if provided
function getErrorFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('error') || 'Platba byla zrušena nebo se nepodařilo dokončit.';
}

// Display error message
function displayError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = getErrorFromURL();
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    displayError();
});
