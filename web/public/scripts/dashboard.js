// Dashboard JavaScript - Only for interactive features

document.addEventListener('DOMContentLoaded', function () {
    // Dashboard functionality
    console.log('Dashboard loaded');
});

// Quick action functions
function createWorkflow() {
    alert('Create Workflow feature coming soon!');
}

function generateReport() {
    alert('Generate Report feature coming soon!');
}

function openSettings() {
    alert('Settings panel coming soon!');
}

function viewAnalytics() {
    alert('Advanced Analytics coming soon!');
}

// Real-time updates simulation
function updateDashboardStats() {
    // Simulate real-time updates
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        // Add subtle animation to show live updates
        stat.style.transform = 'scale(1.05)';
        setTimeout(() => {
            stat.style.transform = 'scale(1)';
        }, 200);
    });
}

// Update stats every 30 seconds (demo)
setInterval(updateDashboardStats, 30000);

// Workflow status updates
function updateWorkflowStatus() {
    const workflowItems = document.querySelectorAll('.workflow-item');
    workflowItems.forEach(item => {
        const statusDot = item.querySelector('.workflow-status');
        const statsText = item.querySelector('.workflow-stats');

        // Simulate status changes
        if (Math.random() > 0.8) {
            statusDot.classList.toggle('active');
            statusDot.classList.toggle('warning');

            // Update time
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            statsText.textContent = `Last run: ${timeString}`;
        }
    });
}

// Update workflow status every 10 seconds (demo)
setInterval(updateWorkflowStatus, 10000);
