// Authentication check for protected pages
// Include this script at the top of any protected page

(function() {
    // Check if user is authenticated
    const sessionToken = localStorage.getItem('aob_session');
    const sessionTime = localStorage.getItem('aob_session_time');
    
    // Session expires after 24 hours (in milliseconds)
    const SESSION_DURATION = 24 * 60 * 60 * 1000;
    
    if (!sessionToken || !sessionTime) {
        // No session found, redirect to login
        window.location.href = '/members/login.html';
        return;
    }
    
    // Check if session has expired
    const currentTime = Date.now();
    const elapsedTime = currentTime - parseInt(sessionTime);
    
    if (elapsedTime > SESSION_DURATION) {
        // Session expired, clear storage and redirect to login
        localStorage.removeItem('aob_session');
        localStorage.removeItem('aob_session_time');
        window.location.href = '/members/login.html';
        return;
    }
    
    // Session is valid, user can access the page
    console.log('Authentication successful');
})();

// Logout function that can be called from any protected page
function logout() {
    localStorage.removeItem('aob_session');
    localStorage.removeItem('aob_session_time');
    window.location.href = '/members/login.html';
}
