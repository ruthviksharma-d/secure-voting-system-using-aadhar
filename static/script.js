// Voting Platform JavaScript
class VotingPlatform {
    constructor() {
        this.currentVoterID = null;
        this.currentVoterName = null;
        this.init();
    }

    init() {
        // Bind event listeners
        const identificationForm = document.getElementById('identification-form');
        const votingForm = document.getElementById('voting-form');
        
        if (identificationForm) {
            identificationForm.addEventListener('submit', this.handleIdentification.bind(this));
        }
        
        if (votingForm) {
            votingForm.addEventListener('submit', this.handleVoting.bind(this));
        }
        
        // Initialize UI state
        this.resetToIdentification();
    }

    // Handle voter identification via fingerprint upload
    async handleIdentification(event) {
        event.preventDefault();
        
        const form = event.target;
        const fileInput = document.getElementById('fingerprint-upload');
        const submitBtn = document.getElementById('identify-btn');
        
        // Validate file selection
        if (!fileInput.files.length) {
            this.showMessage('Please select a fingerprint file (.wsq, .jpg, .jpeg, or .png) to upload.', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Validate file type
        const validExtensions = ['.wsq', '.jpg', '.jpeg', '.png'];
        const fileExtension = file.name.toLowerCase().substr(file.name.lastIndexOf('.'));
        
        if (!validExtensions.includes(fileExtension)) {
            this.showMessage('Invalid file type. Please upload a fingerprint file (.wsq, .jpg, .jpeg, or .png only).', 'error');
            return;
        }
        
        // Show loading state
        this.setButtonLoading(submitBtn, true);
        this.clearMessages();
        
        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('fingerprint', file);
            
            // Send identification request
            const response = await fetch('/identify_voter', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store voter information
                this.currentVoterID = result.voter_id;
                this.currentVoterName = result.voter_name;
                
                // Show success message
                this.showMessage(result.message, 'success');
                
                // Enable voting section
                this.showVotingSection();
                
            } else {
                // Show error message
                this.showMessage(result.message, 'error');
            }
            
        } catch (error) {
            console.error('Error during identification:', error);
            this.showMessage('Network error occurred. Please check your connection and try again.', 'error');
        } finally {
            // Remove loading state
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Handle vote casting
    async handleVoting(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = document.getElementById('vote-btn');
        
        // Get selected candidate
        const selectedCandidate = form.querySelector('input[name="candidate"]:checked');
        
        if (!selectedCandidate) {
            this.showMessage('Please select a candidate before casting your vote.', 'error');
            return;
        }
        
        // Verify voter is identified
        if (!this.currentVoterID) {
            this.showMessage('Please identify yourself first by uploading your fingerprint file (.wsq, .jpg, .jpeg, or .png).', 'error');
            this.resetToIdentification();
            return;
        }
        
        // Show loading state
        this.setButtonLoading(submitBtn, true);
        this.clearMessages();
        
        try {
            // Prepare vote data
            const voteData = {
                voter_id: this.currentVoterID,
                candidate: selectedCandidate.value
            };
            
            // Send vote request
            const response = await fetch('/cast_vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(voteData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                this.showMessage(result.message, 'success');
                
                // Show completion status
                this.showCompletionStatus(selectedCandidate.value);
                
            } else {
                // Show error message
                this.showMessage(result.message, 'error');
                
                // If already voted, reset to identification
                if (result.message.includes('already cast')) {
                    setTimeout(() => {
                        this.resetToIdentification();
                    }, 3000);
                }
            }
            
        } catch (error) {
            console.error('Error during voting:', error);
            this.showMessage('Network error occurred. Please check your connection and try again.', 'error');
        } finally {
            // Remove loading state
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Show the voting section after successful identification
    showVotingSection() {
        const votingSection = document.getElementById('voting-section');
        const voterInfo = document.getElementById('voter-info');
        
        // Update voter information display
        voterInfo.innerHTML = `
            <i class="fas fa-user-check me-2"></i>
            <strong>Voter Identified:</strong> ${this.currentVoterName || 'Registered Voter'}
            <br>
            <small class="text-muted">You may now select your candidate and cast your vote.</small>
        `;
        
        // Show voting section with animation
        votingSection.style.display = 'block';
        votingSection.classList.add('fade-in');
        
        // Scroll to voting section
        votingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Show completion status after successful vote
    showCompletionStatus(candidate) {
        const statusSection = document.getElementById('status-section');
        const timestampSpan = document.getElementById('vote-timestamp');
        
        // Hide other sections
        document.getElementById('identification-section').style.display = 'none';
        document.getElementById('voting-section').style.display = 'none';
        
        // Update timestamp
        timestampSpan.textContent = new Date().toLocaleString();
        
        // Show status section
        statusSection.style.display = 'block';
        statusSection.classList.add('fade-in');
        
        // Update status with candidate information
        const statusBody = statusSection.querySelector('.card-body');
        statusBody.innerHTML = `
            <h5 class="card-title text-success">
                <i class="fas fa-check-circle me-2"></i>
                Vote Cast Successfully
            </h5>
            <p class="card-text">
                Thank you for participating in the election.<br>
                Your vote for <strong>${candidate}</strong> has been recorded.
            </p>
            <div class="text-muted small">
                <i class="fas fa-clock me-1"></i>
                <span>${new Date().toLocaleString()}</span>
            </div>
        `;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Reset UI to identification step
    resetToIdentification() {
        // Clear voter data
        this.currentVoterID = null;
        this.currentVoterName = null;
        
        // Reset forms
        document.getElementById('identification-form').reset();
        document.getElementById('voting-form').reset();
        
        // Show/hide sections
        document.getElementById('identification-section').style.display = 'block';
        document.getElementById('voting-section').style.display = 'none';
        document.getElementById('status-section').style.display = 'none';
        
        // Clear messages
        this.clearMessages();
    }

    // Display messages to user
    showMessage(message, type) {
        const messageArea = document.getElementById('message-area');
        const alertClass = type === 'success' ? 'message-success' : 'message-error';
        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
        
        messageArea.innerHTML = `
            <div class="alert ${alertClass} fade-in" role="alert">
                <i class="fas ${iconClass} me-2"></i>
                ${message}
            </div>
        `;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.clearMessages();
            }, 5000);
        }
        
        // Scroll to message
        messageArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Clear all messages
    clearMessages() {
        const messageArea = document.getElementById('message-area');
        messageArea.innerHTML = '';
    }

    // Set button loading state
    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}

// Initialize the voting platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.votingPlatform = new VotingPlatform();
});

// Additional utility functions for enhanced user experience
document.addEventListener('DOMContentLoaded', () => {
    // File input change handler for better UX
    const fileInput = document.getElementById('fingerprint-upload');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type immediately
            const validExtensions = ['.wsq', '.jpg', '.jpeg', '.png'];
            const fileExtension = file.name.toLowerCase().substr(file.name.lastIndexOf('.'));
            if (!validExtensions.includes(fileExtension)) {
                e.target.value = ''; // Clear the input
                const messageArea = document.getElementById('message-area');
                messageArea.innerHTML = `
                    <div class="alert message-error fade-in" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Invalid file type selected. Please choose a fingerprint file (.wsq, .jpg, .jpeg, or .png).
                    </div>
                `;
                setTimeout(() => {
                    messageArea.innerHTML = '';
                }, 3000);
            }
        }
    });

    // Radio button change handler for better visual feedback
    const radioButtons = document.querySelectorAll('input[name="candidate"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            // Clear any previous candidate selection messages
            const messageArea = document.getElementById('message-area');
            if (messageArea.innerHTML.includes('Please select a candidate')) {
                messageArea.innerHTML = '';
            }
        });
    });
});
