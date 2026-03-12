document.addEventListener('DOMContentLoaded', function () {
    const originalTextInput = document.getElementById('originalText');
    const spokenTextInput = document.getElementById('spokenText');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsSection = document.getElementById('results');
    const loadingSection = document.getElementById('loading');
    const errorSection = document.getElementById('error');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const practiceItems = document.getElementById('practiceItems');
    const errorMessage = document.getElementById('errorMessage');

    analyzeBtn.addEventListener('click', async function (e) {
        e.preventDefault(); // 🔒 IMPORTANT: stop form default submit

        const originalText = originalTextInput.value.trim();
        const spokenText = spokenTextInput.value.trim();

        if (!originalText || !spokenText) {
            showError('Please fill in both text fields.');
            return;
        }

        resultsSection.style.display = 'none';
        errorSection.style.display = 'none';

        loadingSection.style.display = 'block';
        analyzeBtn.disabled = true;

        try {
            const response = await fetch('/api/analyze-reading', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originalText,
                    spokenText
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to analyze reading');
            }

            const data = await response.json();
            displayResults(data);

        } catch (error) {
            showError(error.message || 'An error occurred while analyzing the reading.');
        } finally {
            loadingSection.style.display = 'none';
            analyzeBtn.disabled = false;
        }
    });

    function displayResults(data) {
        feedbackMessage.textContent = data.feedbackMessage;
        practiceItems.innerHTML = '';

        if (data.practiceItems && data.practiceItems.length > 0) {
            data.practiceItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'practice-item';

                const textDiv = document.createElement('div');
                textDiv.className = 'practice-item-text';
                textDiv.textContent = item.text;
                itemDiv.appendChild(textDiv);

                if (item.comment) {
                    const commentDiv = document.createElement('div');
                    commentDiv.className = 'practice-item-comment';
                    commentDiv.textContent = item.comment;
                    itemDiv.appendChild(commentDiv);
                }

                practiceItems.appendChild(itemDiv);
            });
        } else {
            practiceItems.innerHTML =
                '<p style="color:#666;">No practice items needed – perfect reading!</p>';
        }

        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
