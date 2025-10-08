/**
 * Profile Module JavaScript
 * Handles user profile functionality including viewing, editing, and preferences
 */

const Profile = {
    // Current profile data
    currentProfile: null,
    
    // API endpoints
    endpoints: {
        profile: '/api/profile',
        update: '/api/profile/update',
        avatar: '/api/profile/avatar',
        password: '/api/profile/password',
        preferences: '/api/profile/preferences'
    },

    /**
     * Initialize the profile module
     */
    init: function() {
        console.log('Initializing Profile module...');
        
        // Load profile data
        this.loadProfile();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup file preview for avatar upload
        this.setupAvatarPreview();
    },

    /**
     * Setup event listeners for forms and buttons
     */
    setupEventListeners: function() {
        // Profile form submission
        $('#profile-form').on('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Preferences form submission
        $('#preferences-form').on('submit', (e) => {
            e.preventDefault();
            this.updatePreferences();
        });

        // Password form submission
        $('#password-form').on('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        // Avatar form submission
        $('#avatar-form').on('submit', (e) => {
            e.preventDefault();
            this.uploadAvatar();
        });
    },

    /**
     * Setup avatar file preview
     */
    setupAvatarPreview: function() {
        $('#avatar-file').on('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    Profile.showError('File too large. Maximum size is 5MB.');
                    this.value = '';
                    return;
                }

                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    Profile.showError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
                    this.value = '';
                    return;
                }

                // Show preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#avatar-preview-img').attr('src', e.target.result);
                    $('#avatar-preview').show();
                };
                reader.readAsDataURL(file);
            } else {
                $('#avatar-preview').hide();
            }
        });
    },

    /**
     * Load current user profile data
     */
    loadProfile: function() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.showError('Authentication required');
            return;
        }

        $.ajax({
            url: this.endpoints.profile,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            success: (response) => {
                if (response.success) {
                    this.currentProfile = response.data;
                    this.populateProfileData(response.data);
                } else {
                    this.showError(response.message || 'Failed to load profile');
                }
            },
            error: (xhr) => {
                console.error('Profile load error:', xhr);
                this.showError('Failed to load profile data');
            }
        });
    },

    /**
     * Populate the UI with profile data
     */
    populateProfileData: function(profile) {
        // Profile information display
        $('#profile-name').text(`${profile.first_name} ${profile.last_name}`);
        $('#profile-email').text(profile.email);
        $('#profile-role').text(profile.is_admin ? 'Administrator' : 'User');
        
        // Avatar
        if (profile.avatar) {
            $('#profile-avatar').attr('src', profile.avatar);
        }
        
        // Member since and last login
        if (profile.created_at) {
            const memberSince = new Date(profile.created_at).toLocaleDateString();
            $('#profile-member-since').text(memberSince);
        }
        
        if (profile.last_login) {
            const lastLogin = new Date(profile.last_login).toLocaleDateString();
            $('#profile-last-login').text(lastLogin);
        }

        // Profile form fields
        $('#first_name').val(profile.first_name || '');
        $('#last_name').val(profile.last_name || '');
        $('#email').val(profile.email || '');
        $('#phone').val(profile.phone || '');
        $('#bio').val(profile.bio || '');

        // Preferences form fields
        $('#timezone').val(profile.timezone || 'UTC');
        $('#language').val(profile.language || 'en');
        $('#theme').val(profile.theme || 'light');
        $('#date_format').val(profile.date_format || 'Y-m-d');
        $('#notifications_email').prop('checked', profile.notifications_email !== false);
        $('#notifications_browser').prop('checked', profile.notifications_browser !== false);

        // Security status
        $('#2fa-status').text(profile.two_factor_enabled ? 'Enabled' : 'Disabled')
                       .removeClass('bg-secondary bg-success')
                       .addClass(profile.two_factor_enabled ? 'bg-success' : 'bg-secondary');
    },

    /**
     * Update user profile
     */
    updateProfile: function() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.showError('Authentication required');
            return;
        }

        const formData = {
            first_name: $('#first_name').val(),
            last_name: $('#last_name').val(),
            phone: $('#phone').val(),
            bio: $('#bio').val()
        };

        // Show loading state
        const submitBtn = $('#profile-form button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.html('<i class="fas fa-spinner fa-spin me-1"></i>Saving...').prop('disabled', true);

        $.ajax({
            url: this.endpoints.update,
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(formData),
            success: (response) => {
                if (response.success) {
                    this.currentProfile = response.data;
                    this.populateProfileData(response.data);
                    this.showSuccess('Profile updated successfully!');
                } else {
                    this.showError(response.message || 'Failed to update profile');
                }
            },
            error: (xhr) => {
                console.error('Profile update error:', xhr);
                const errorMsg = xhr.responseJSON?.message || 'Failed to update profile';
                this.showError(errorMsg);
            },
            complete: () => {
                // Restore button state
                submitBtn.html(originalText).prop('disabled', false);
            }
        });
    },

    /**
     * Update user preferences
     */
    updatePreferences: function() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.showError('Authentication required');
            return;
        }

        const formData = {
            timezone: $('#timezone').val(),
            language: $('#language').val(),
            theme: $('#theme').val(),
            date_format: $('#date_format').val(),
            notifications_email: $('#notifications_email').is(':checked'),
            notifications_browser: $('#notifications_browser').is(':checked')
        };

        // Show loading state
        const submitBtn = $('#preferences-form button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.html('<i class="fas fa-spinner fa-spin me-1"></i>Saving...').prop('disabled', true);

        $.ajax({
            url: this.endpoints.preferences,
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(formData),
            success: (response) => {
                if (response.success) {
                    this.showSuccess('Preferences updated successfully!');
                } else {
                    this.showError(response.message || 'Failed to update preferences');
                }
            },
            error: (xhr) => {
                console.error('Preferences update error:', xhr);
                const errorMsg = xhr.responseJSON?.message || 'Failed to update preferences';
                this.showError(errorMsg);
            },
            complete: () => {
                // Restore button state
                submitBtn.html(originalText).prop('disabled', false);
            }
        });
    },

    /**
     * Change user password
     */
    changePassword: function() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.showError('Authentication required');
            return;
        }

        const currentPassword = $('#current_password').val();
        const newPassword = $('#new_password').val();
        const confirmPassword = $('#confirm_password').val();

        // Client-side validation
        if (newPassword !== confirmPassword) {
            this.showError('New password and confirmation do not match');
            return;
        }

        if (newPassword.length < 8) {
            this.showError('Password must be at least 8 characters long');
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            this.showError('Password must contain at least one lowercase letter, one uppercase letter, and one number');
            return;
        }

        const formData = {
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
        };

        // Show loading state
        const submitBtn = $('#password-form button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.html('<i class="fas fa-spinner fa-spin me-1"></i>Changing...').prop('disabled', true);

        $.ajax({
            url: this.endpoints.password,
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(formData),
            success: (response) => {
                if (response.success) {
                    this.showSuccess('Password changed successfully!');
                    // Clear form
                    $('#password-form')[0].reset();
                } else {
                    this.showError(response.message || 'Failed to change password');
                }
            },
            error: (xhr) => {
                console.error('Password change error:', xhr);
                const errorMsg = xhr.responseJSON?.message || 'Failed to change password';
                this.showError(errorMsg);
            },
            complete: () => {
                // Restore button state
                submitBtn.html(originalText).prop('disabled', false);
            }
        });
    },

    /**
     * Show avatar upload modal
     */
    showAvatarUpload: function() {
        $('#avatarUploadModal').modal('show');
    },

    /**
     * Upload avatar image
     */
    uploadAvatar: function() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.showError('Authentication required');
            return;
        }

        const fileInput = $('#avatar-file')[0];
        if (!fileInput.files || !fileInput.files[0]) {
            this.showError('Please select an image file');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', fileInput.files[0]);

        // Show loading state
        const uploadBtn = $('#avatarUploadModal .btn-primary');
        const originalText = uploadBtn.html();
        uploadBtn.html('<i class="fas fa-spinner fa-spin me-1"></i>Uploading...').prop('disabled', true);

        $.ajax({
            url: this.endpoints.avatar,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                if (response.success) {
                    // Update avatar in UI
                    $('#profile-avatar').attr('src', response.data.avatar);
                    this.showSuccess('Avatar uploaded successfully!');
                    
                    // Close modal and reset form
                    $('#avatarUploadModal').modal('hide');
                    $('#avatar-form')[0].reset();
                    $('#avatar-preview').hide();
                } else {
                    this.showError(response.message || 'Failed to upload avatar');
                }
            },
            error: (xhr) => {
                console.error('Avatar upload error:', xhr);
                const errorMsg = xhr.responseJSON?.message || 'Failed to upload avatar';
                this.showError(errorMsg);
            },
            complete: () => {
                // Restore button state
                uploadBtn.html(originalText).prop('disabled', false);
            }
        });
    },

    /**
     * Reset profile form to original values
     */
    resetForm: function() {
        if (this.currentProfile) {
            this.populateProfileData(this.currentProfile);
            this.showInfo('Form reset to original values');
        }
    },

    /**
     * Toggle two-factor authentication
     */
    toggle2FA: function() {
        // This would typically open a modal or redirect to 2FA setup
        this.showInfo('Two-factor authentication setup is not implemented in this demo');
    },

    /**
     * Show success message
     */
    showSuccess: function(message) {
        this.showToast(message, 'success');
    },

    /**
     * Show error message
     */
    showError: function(message) {
        this.showToast(message, 'error');
    },

    /**
     * Show info message
     */
    showInfo: function(message) {
        this.showToast(message, 'info');
    },

    /**
     * Show toast notification
     */
    showToast: function(message, type = 'info') {
        // Create toast element if it doesn't exist
        if (!$('#toast-container').length) {
            $('body').append(`
                <div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index: 11000;">
                </div>
            `);
        }

        const toastId = 'toast-' + Date.now();
        const bgClass = type === 'success' ? 'bg-success' : 
                       type === 'error' ? 'bg-danger' : 
                       type === 'warning' ? 'bg-warning' : 'bg-info';
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle';

        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-${icon} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        $('#toast-container').append(toastHtml);
        
        // Initialize and show toast
        const toastElement = new bootstrap.Toast(document.getElementById(toastId), {
            autohide: true,
            delay: 5000
        });
        
        toastElement.show();

        // Remove toast element after it's hidden
        $(`#${toastId}`).on('hidden.bs.toast', function() {
            $(this).remove();
        });
    }
};

// Initialize when document is ready
$(document).ready(function() {
    // Only initialize if we're on the profile page
    if ($('.profile-container').length > 0) {
        Profile.init();
    }
});

// Export for global access
window.Profile = Profile;
