/**
 * Swagger UI Custom Authentication Plugin
 * Adds a login form to Swagger UI that automatically handles bearer token authentication
 */
(function () {
    'use strict';

    // Wrap everything in try-catch to prevent breaking Swagger UI
    try {
        // Wait for Swagger UI to be fully loaded
        function initLoginForm() {
            try {
                const swaggerUI = window.ui;
                if (!swaggerUI) {
                    // Retry after a delay if Swagger UI isn't ready yet
                    setTimeout(initLoginForm, 500);
                    return;
                }

                // Create login form HTML
                const loginFormHTML = `
          <div id="swagger-login-form" style="
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            min-width: 280px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          ">
            <div id="swagger-login-header" style="
              padding: 12px 15px;
              font-weight: bold;
              color: #333;
              font-size: 14px;
              cursor: pointer;
              user-select: none;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #e0e0e0;
            ">
              <span id="swagger-login-title">🔐 Swagger Login</span>
              <span id="swagger-login-toggle" style="font-size: 12px; color: #666;">▼</span>
            </div>
            <div id="swagger-login-content" style="padding: 15px; display: block;">
              <form id="login-form" style="display: flex; flex-direction: column; gap: 10px;">
                <div id="login-fields" style="display: flex; flex-direction: column; gap: 10px;">
                  <input 
                    type="email" 
                    id="swagger-email" 
                    placeholder="Email" 
                    required
                    style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;"
                  />
                  <input 
                    type="password" 
                    id="swagger-password" 
                    placeholder="Password" 
                    required
                    style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;"
                  />
                  <button 
                    type="submit" 
                    id="login-submit-btn"
                    style="
                      padding: 8px 16px; 
                      background: #4CAF50; 
                      color: white; 
                      border: none; 
                      border-radius: 4px; 
                      cursor: pointer; 
                      font-size: 13px;
                      font-weight: 500;
                    "
                    onmouseover="this.style.background='#45a049'"
                    onmouseout="this.style.background='#4CAF50'"
                  >
                    Login
                  </button>
                  <div style="text-align: center; margin: 10px 0; color: #666; font-size: 12px;">OR</div>
                  <button 
                    type="button" 
                    id="google-signin-btn"
                    style="
                      padding: 8px 16px; 
                      background: white; 
                      color: #3c4043; 
                      border: 1px solid #dadce0; 
                      border-radius: 4px; 
                      cursor: pointer; 
                      font-size: 13px;
                      font-weight: 500;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 8px;
                    "
                    onmouseover="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.12)'"
                    onmouseout="this.style.boxShadow='none'"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                </div>
                <button 
                  type="button" 
                  id="logout-btn" 
                  style="
                    padding: 8px 16px; 
                    background: #f44336; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    font-size: 13px;
                    display: none;
                  "
                  onmouseover="this.style.background='#da190b'"
                  onmouseout="this.style.background='#f44336'"
                >
                  Logout
                </button>
                <div id="login-status" style="font-size: 12px; margin-top: 5px; min-height: 16px;"></div>
              </form>
            </div>
          </div>
        `;

                // Inject login form into the page
                const loginContainer = document.createElement('div');
                loginContainer.innerHTML = loginFormHTML;
                document.body.appendChild(loginContainer);

                const loginForm = document.getElementById('login-form');
                const emailInput = document.getElementById('swagger-email');
                const passwordInput = document.getElementById('swagger-password');
                const statusDiv = document.getElementById('login-status');
                const logoutBtn = document.getElementById('logout-btn');
                const loginFormContainer = document.getElementById('swagger-login-form');
                const loginHeader = document.getElementById('swagger-login-header');
                const loginContent = document.getElementById('swagger-login-content');
                const loginTitle = document.getElementById('swagger-login-title');
                const loginToggle = document.getElementById('swagger-login-toggle');
                const loginFields = document.getElementById('login-fields');
                let isCollapsed = false;

                // Toggle collapse/expand
                loginHeader.addEventListener('click', () => {
                    isCollapsed = !isCollapsed;
                    if (isCollapsed) {
                        loginContent.style.display = 'none';
                        loginToggle.textContent = '▶';
                    } else {
                        loginContent.style.display = 'block';
                        loginToggle.textContent = '▼';
                    }
                });

                // Set up request interceptor to ensure Bearer token is always included
                try {
                    if (swaggerUI && swaggerUI.getSystem) {
                        const system = swaggerUI.getSystem();
                        if (system && system.fn) {
                            const originalRequestInterceptor = system.fn.get('requestInterceptor');

                            system.fn.set('requestInterceptor', async (req) => {
                                // Skip login endpoint
                                if (req.url && req.url.includes('/api/auth/login')) {
                                    return originalRequestInterceptor ? await originalRequestInterceptor(req) : req;
                                }

                                // For protected endpoints, ensure we use Bearer token
                                if (req.url && req.url.includes('/api/')) {
                                    if (!req.headers) {
                                        req.headers = {};
                                    }

                                    // Get token from localStorage
                                    const storedToken = localStorage.getItem('swagger_access_token');

                                    // Check if Authorization header is already set
                                    const authHeader = req.headers.Authorization || req.headers.authorization;

                                    // If no Bearer token in headers, add it from localStorage
                                    if (storedToken && (!authHeader || !authHeader.startsWith('Bearer '))) {
                                        // Remove any existing Bearer prefix if present
                                        const cleanToken = storedToken.replace(/^Bearer\s+/i, '');
                                        req.headers.Authorization = `Bearer ${cleanToken}`;
                                        console.log('🔑 Added Bearer token to request via interceptor');
                                    }
                                }

                                return originalRequestInterceptor ? await originalRequestInterceptor(req) : req;
                            });

                            console.log('✅ Request interceptor registered for Bearer token');
                        }
                    }
                } catch (error) {
                    console.error('Error setting up request interceptor:', error);
                }

                // Also intercept fetch requests as fallback
                try {
                    const originalFetch = window.fetch;
                    window.fetch = async function (url, options = {}) {
                        const urlString = typeof url === 'string' ? url : url.url || url.toString();

                        // For API requests, ensure Bearer token is present
                        if (urlString.includes('/api/') && !urlString.includes('/api/auth/login')) {
                            if (!options.headers) {
                                options.headers = {};
                            }

                            const storedToken = localStorage.getItem('swagger_access_token');
                            const authHeader = options.headers.Authorization || options.headers.authorization;

                            // If no Bearer token, add it from localStorage
                            if (storedToken && (!authHeader || !authHeader.startsWith('Bearer '))) {
                                const cleanToken = storedToken.replace(/^Bearer\s+/i, '');
                                options.headers.Authorization = `Bearer ${cleanToken}`;
                                console.log('🔑 Added Bearer token to fetch request');
                            }
                        }

                        return originalFetch.call(this, url, options);
                    };

                    console.log('✅ Fetch interceptor registered for Bearer token');
                } catch (error) {
                    console.error('Error setting up fetch interceptor:', error);
                }

                // Check if user is already logged in (token in localStorage)
                const storedToken = localStorage.getItem('swagger_access_token');
                if (storedToken) {
                    setBearerToken(storedToken);
                    showLoggedInState();
                }

                // Handle login form submission
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const email = emailInput.value.trim();
                    const password = passwordInput.value;

                    if (!email || !password) {
                        showStatus('Please enter both email and password', 'error');
                        return;
                    }

                    showStatus('Logging in...', 'info');

                    try {
                        // Call login API
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email, password }),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            showStatus(data.message || 'Login failed', 'error');
                            return;
                        }

                        // Extract access token
                        const accessToken = data.accessToken || data.token;
                        if (!accessToken) {
                            showStatus('No access token received', 'error');
                            return;
                        }

                        // Store token in localStorage
                        localStorage.setItem('swagger_access_token', accessToken);
                        localStorage.setItem('swagger_user_email', email);

                        // Set bearer token in Swagger UI
                        setBearerToken(accessToken);

                        showStatus('✓ Logged in successfully!', 'success');
                        showLoggedInState();

                        // Clear password field
                        passwordInput.value = '';

                    } catch (error) {
                        console.error('Login error:', error);
                        showStatus('Login failed: ' + error.message, 'error');
                    }
                });

                // Handle logout
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('swagger_access_token');
                    localStorage.removeItem('swagger_user_email');
                    localStorage.removeItem('swagger_refresh_token');
                    localStorage.removeItem('swagger_user_id');
                    clearBearerToken();
                    showStatus('Logged out', 'info');
                    showLoggedOutState();
                });

                // Google OAuth login using popup
                function loginWithGoogle() {
                    return new Promise((resolve, reject) => {
                        console.log('🔵 Initiating Google OAuth...');
                        showStatus('Opening Google sign-in...', 'info');

                        // Get button reference to reset it on error
                        const googleSignInBtn = document.getElementById('google-signin-btn');
                        let buttonReset = false;

                        // Function to reset button state
                        const resetButton = () => {
                            if (!buttonReset && googleSignInBtn) {
                                buttonReset = true;
                                googleSignInBtn.disabled = false;
                                googleSignInBtn.style.opacity = '1';
                                googleSignInBtn.innerHTML = `
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Sign in with Google
                                `;
                            }
                        };

                        // Open popup window for Google OAuth
                        const width = 500;
                        const height = 600;
                        const left = (window.screen.width - width) / 2;
                        const top = (window.screen.height - height) / 2;

                        // Use Swagger-specific Google OAuth endpoint
                        // This endpoint uses a separate callback URL that routes to Swagger callback
                        const popup = window.open(
                            '/api/auth/google/swagger',
                            'Google OAuth',
                            `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no`
                        );

                        if (!popup) {
                            showStatus('Popup blocked. Please allow popups.', 'error');
                            resetButton();
                            reject(new Error('Popup blocked. Please allow popups for this site.'));
                            return;
                        }

                        // Listen for postMessage from callback page
                        const messageHandler = (event) => {
                            // Security: Only accept messages from same origin
                            if (event.origin !== window.location.origin) {
                                return;
                            }

                            if (event.data && event.data.type === 'swagger-oauth-callback') {
                                window.removeEventListener('message', messageHandler);
                                clearInterval(checkInterval);

                                if (event.data.accessToken) {
                                    popup.close();

                                    // Store token
                                    localStorage.setItem('swagger_access_token', event.data.accessToken);
                                    if (event.data.refreshToken) {
                                        localStorage.setItem('swagger_refresh_token', event.data.refreshToken);
                                    }
                                    if (event.data.userId) {
                                        localStorage.setItem('swagger_user_id', event.data.userId);
                                    }
                                    if (event.data.email) {
                                        localStorage.setItem('swagger_user_email', event.data.email);
                                    }

                                    // Set bearer token in Swagger UI
                                    setBearerToken(event.data.accessToken);

                                    showStatus('✓ Signed in with Google!', 'success');
                                    showLoggedInState();

                                    console.log('✅ Google OAuth successful! Bearer token set.');
                                    resolve(event.data.accessToken);
                                } else if (event.data.error) {
                                    popup.close();
                                    showStatus('Google sign-in failed: ' + event.data.error, 'error');
                                    resetButton();
                                    reject(new Error(event.data.error));
                                }
                            }
                        };
                        window.addEventListener('message', messageHandler);

                        // Poll for popup to close or URL change
                        const checkInterval = setInterval(() => {
                            try {
                                // Check if popup is closed
                                if (popup.closed) {
                                    clearInterval(checkInterval);
                                    window.removeEventListener('message', messageHandler);

                                    // Check if we have a token (might have been set via postMessage)
                                    const token = localStorage.getItem('swagger_access_token');
                                    if (token) {
                                        // Token was set, success! (Don't reset button, showLoggedInState will handle it)
                                        return;
                                    }

                                    // Popup closed without token - user cancelled
                                    console.log('⚠️ Popup closed without token - user cancelled');
                                    showStatus('Google sign-in cancelled', 'info');
                                    resetButton();
                                    reject(new Error('Google sign-in was cancelled or popup was closed.'));
                                    return;
                                }

                                // Try to access popup's location (will throw if cross-origin)
                                try {
                                    const popupUrl = popup.location.href;
                                    console.log('Popup URL:', popupUrl);

                                    // Check if popup is on callback URL
                                    if (popupUrl.includes('/api/docs/auth-callback')) {
                                        const url = new URL(popupUrl);
                                        const accessToken = url.searchParams.get('accessToken');
                                        const error = url.searchParams.get('error');

                                        if (error) {
                                            clearInterval(checkInterval);
                                            window.removeEventListener('message', messageHandler);
                                            popup.close();
                                            showStatus('Google sign-in failed: ' + decodeURIComponent(error), 'error');
                                            reject(new Error(decodeURIComponent(error)));
                                            return;
                                        }

                                        // Token should be handled by postMessage, but fallback here
                                        if (accessToken) {
                                            clearInterval(checkInterval);
                                            window.removeEventListener('message', messageHandler);
                                            popup.close();

                                            // Store token
                                            localStorage.setItem('swagger_access_token', accessToken);
                                            const refreshToken = url.searchParams.get('refreshToken');
                                            const userId = url.searchParams.get('userId');
                                            const email = url.searchParams.get('email');

                                            if (refreshToken) {
                                                localStorage.setItem('swagger_refresh_token', refreshToken);
                                            }
                                            if (userId) {
                                                localStorage.setItem('swagger_user_id', userId);
                                            }
                                            if (email) {
                                                localStorage.setItem('swagger_user_email', email);
                                            }

                                            // Set bearer token in Swagger UI
                                            setBearerToken(accessToken);

                                            showStatus('✓ Signed in with Google!', 'success');
                                            showLoggedInState();

                                            console.log('✅ Google OAuth successful! Bearer token set.');
                                            resolve(accessToken);
                                            return;
                                        }
                                    }
                                } catch (e) {
                                    // Cross-origin error - expected when popup is on Google domain
                                    // This is normal, just continue polling
                                }
                            } catch (e) {
                                // Popup might be closed or inaccessible
                                if (popup.closed) {
                                    clearInterval(checkInterval);
                                    window.removeEventListener('message', messageHandler);

                                    // Check if token was set before popup closed
                                    const token = localStorage.getItem('swagger_access_token');
                                    if (!token) {
                                        console.log('⚠️ Popup closed without token - user cancelled');
                                        showStatus('Google sign-in cancelled', 'info');
                                        resetButton();
                                        reject(new Error('Google sign-in was cancelled.'));
                                    }
                                }
                            }
                        }, 500);

                        // Timeout after 5 minutes
                        setTimeout(() => {
                            if (!popup.closed) {
                                popup.close();
                            }
                            clearInterval(checkInterval);
                            window.removeEventListener('message', messageHandler);

                            // Check if token was set before timeout
                            const token = localStorage.getItem('swagger_access_token');
                            if (!token) {
                                showStatus('Google sign-in timed out', 'error');
                                resetButton();
                                reject(new Error('Google sign-in timed out. Please try again.'));
                            }
                        }, 300000);
                    });
                }

                // Handle Google sign-in button click
                // Attach handler after loginWithGoogle function is defined
                function attachGoogleButtonHandler() {
                    const googleSignInBtn = document.getElementById('google-signin-btn');
                    if (!googleSignInBtn) {
                        console.error('❌ Google sign-in button not found!');
                        // Retry after a short delay
                        setTimeout(attachGoogleButtonHandler, 100);
                        return;
                    }

                    console.log('✅ Google sign-in button found');

                    // Check if loginWithGoogle is available
                    if (typeof loginWithGoogle !== 'function') {
                        console.error('❌ loginWithGoogle function not available yet, retrying...');
                        setTimeout(attachGoogleButtonHandler, 100);
                        return;
                    }

                    console.log('✅ Attaching Google sign-in event listener');

                    // Store original button HTML for reset
                    const originalButtonHTML = googleSignInBtn.innerHTML;

                    googleSignInBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        console.log('🔵 Google sign-in button clicked');

                        const btn = e.currentTarget;
                        btn.disabled = true;
                        btn.style.opacity = '0.6';
                        btn.innerHTML = '<span>Signing in...</span>';

                        try {
                            await loginWithGoogle();
                            // Success - button state will be updated by showLoggedInState
                        } catch (error) {
                            console.error('❌ Google sign-in error:', error);

                            // Reset button state
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            btn.innerHTML = originalButtonHTML;

                            // Only show error message if it's not a cancellation
                            // (Cancellation is already handled in loginWithGoogle with 'info' status)
                            if (!error.message.includes('cancelled') && !error.message.includes('closed')) {
                                showStatus('Google sign-in failed: ' + error.message, 'error');
                            }
                        }
                    });
                }

                // Start attaching handler after a short delay
                setTimeout(attachGoogleButtonHandler, 200);

                function setBearerToken(token) {
                    // Set token in Swagger UI's authorization
                    try {
                        if (swaggerUI && swaggerUI.getSystem) {
                            const system = swaggerUI.getSystem();
                            if (system && system.authActions) {
                                // Method 1: Use authActions.authorize (Swagger UI 4.x+)
                                system.authActions.authorize({
                                    Bearer: {
                                        name: 'Bearer',
                                        schema: {
                                            type: 'http',
                                            scheme: 'bearer',
                                            bearerFormat: 'JWT'
                                        },
                                        value: token
                                    }
                                });
                                return;
                            }
                        }

                        // Method 2: Fallback - directly set in localStorage and trigger update
                        if (window.ui && window.ui.authActions) {
                            window.ui.authActions.authorize({
                                Bearer: { value: token }
                            });
                            return;
                        }

                        // Method 3: Manual fallback - set authorization header directly
                        console.warn('Could not set token via Swagger UI API, using manual method');
                        // The token will still be stored in localStorage for manual entry
                    } catch (error) {
                        console.error('Error setting bearer token:', error);
                    }
                }

                function clearBearerToken() {
                    try {
                        if (swaggerUI && swaggerUI.getSystem) {
                            const system = swaggerUI.getSystem();
                            if (system && system.authActions) {
                                system.authActions.logout(['Bearer']);
                                return;
                            }
                        }

                        if (window.ui && window.ui.authActions) {
                            window.ui.authActions.logout(['Bearer']);
                        }
                    } catch (error) {
                        console.error('Error clearing bearer token:', error);
                    }
                }

                function showStatus(message, type) {
                    const colors = {
                        success: '#4CAF50',
                        error: '#f44336',
                        info: '#2196F3'
                    };
                    statusDiv.textContent = message;
                    statusDiv.style.color = colors[type] || '#333';
                }

                function showLoggedInState() {
                    const userEmail = localStorage.getItem('swagger_user_email') || 'User';
                    // Hide login fields completely
                    loginFields.style.display = 'none';
                    // Show logout button
                    logoutBtn.style.display = 'block';
                    // Update title
                    loginTitle.textContent = `🔐 Logged in as ${userEmail}`;
                    // Collapse the form by default when logged in
                    isCollapsed = true;
                    loginContent.style.display = 'none';
                    loginToggle.textContent = '▶';
                }

                function showLoggedOutState() {
                    // Show login fields
                    loginFields.style.display = 'flex';
                    // Hide logout button
                    logoutBtn.style.display = 'none';
                    // Update title
                    loginTitle.textContent = '🔐 Swagger Login';
                    // Clear fields
                    emailInput.value = '';
                    passwordInput.value = '';
                    // Expand the form when logged out
                    isCollapsed = false;
                    loginContent.style.display = 'block';
                    loginToggle.textContent = '▼';
                    // Clear status
                    statusDiv.textContent = '';

                    // Reset Google sign-in button to original state
                    const googleSignInBtn = document.getElementById('google-signin-btn');
                    if (googleSignInBtn) {
                        googleSignInBtn.disabled = false;
                        googleSignInBtn.style.opacity = '1';
                        googleSignInBtn.innerHTML = `
                            <svg width="18" height="18" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Sign in with Google
                        `;
                        console.log('✅ Google sign-in button reset after logout');
                    }
                }
            } catch (error) {
                console.error('Error initializing Swagger login form:', error);
            }
        }

        // Start initialization when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initLoginForm, 1000);
            });
        } else {
            setTimeout(initLoginForm, 1000);
        }
    } catch (error) {
        console.error('Swagger auth plugin failed to load:', error);
        // Don't break Swagger UI if this script fails
    }
})();
