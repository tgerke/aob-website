document.addEventListener('DOMContentLoaded', function() {
    // Mobile nav toggle (present on all pages)
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    // Interest form (only present on join.html)
    const form = document.getElementById('interestForm');
    if (!form) {
        return;
    }

    const fields = ['playerName', 'parentName', 'ageGroup', 'gradYear', 'school', 'positionsPlayed', 'email', 'phone', 'notes'];

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Remove any existing messages
        const existingMessages = form.parentNode.querySelectorAll('.form-success, .form-error');
        existingMessages.forEach(msg => msg.remove());

        // Disable the form while submitting
        const submitButton = form.querySelector('button');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Gather field values
        const payload = {};
        fields.forEach(id => {
            const el = document.getElementById(id);
            payload[id] = el ? el.value : '';
        });

        try {
            const response = await fetch('/.netlify/functions/submit-form', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error('Server response was not JSON');
            }

            if (!response.ok) {
                throw new Error(data.message || data.details || 'Something went wrong');
            }

            // Show success message
            const successMessage = document.createElement('p');
            successMessage.className = 'form-success';
            successMessage.textContent = 'Thank you for your interest! We\'ll be in touch soon.';
            form.parentNode.insertBefore(successMessage, form.nextSibling);

            // Reset form
            form.reset();

        } catch (error) {
            console.error('Form submission error:', error);

            // Show error message
            const errorMessage = document.createElement('p');
            errorMessage.className = 'form-error';
            errorMessage.textContent = error.message || 'Something went wrong. Please try again later.';
            form.parentNode.insertBefore(errorMessage, form.nextSibling);
        } finally {
            // Re-enable the form
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});
