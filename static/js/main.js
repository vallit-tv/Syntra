// Common JavaScript functions

// Form handling
function handleFormSubmit(formId, endpoint, onSuccess, onError) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            if (response.ok && onSuccess) {
                onSuccess(result);
            } else {
                const errorMsg = result.error || 'Error occurred';
                if (onError) {
                    onError(errorMsg);
                } else {
                    alert(errorMsg);
                }
            }
        } catch (error) {
            const errorMsg = 'Network error: ' + error.message;
            if (onError) {
                onError(errorMsg);
            } else {
                alert(errorMsg);
            }
        }
    });
}

// Show/hide messages
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.insertBefore(alertDiv, document.body.firstChild);
    setTimeout(() => alertDiv.remove(), 5000);
}

