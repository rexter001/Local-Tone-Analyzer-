function updateInputHelper(text) {
    const helperDiv = document.getElementById('inputHelper');
    if (!text) {
        helperDiv.textContent = 'Please enter a sentence.';
        return;
    }

    const startsWithCapital = /^[A-Z]/.test(text.trim());
    const endsWithPunctuation = /[.!?]$/.test(text.trim());
    const hasMultipleWords = text.trim().split(/\s+/).length >= 2;

    let hints = [];
    if (!startsWithCapital) hints.push('Start with a capital letter');
    if (!endsWithPunctuation) hints.push('End with proper punctuation (. ! ?)');
    if (!hasMultipleWords) hints.push('Use at least two words');

    helperDiv.textContent = hints.length ? `Tips: ${hints.join(' • ')}` : 'Valid sentence structure!';
    helperDiv.style.color = hints.length ? '#ff6b81' : '#4cd137';
}

async function analyzeText() {
    const text = document.getElementById('textInput').value;
    const resultDiv = document.getElementById('result');

    if (!text) {
        resultDiv.innerHTML = '<span style="color: #ff6b81;">Please enter some text!</span>';
        return;
    }

    resultDiv.innerHTML = '<div class="analyzing">Analyzing...</div>';

    try {
        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Analysis failed');
        }

        // Calculate sentiment label and color
        let sentimentLabel, sentimentColor;
        if (data.comparative > 0.3) {
            sentimentLabel = 'Positive';
            sentimentColor = '#4cd137';
        } else if (data.comparative < -0.3) {
            sentimentLabel = 'Negative';
            sentimentColor = '#ff6b81';
        } else {
            sentimentLabel = 'Neutral';
            sentimentColor = '#ffa502';
        }

        resultDiv.innerHTML = `
            <div class="analysis-header">
                <h3>Analysis Results</h3>
                <span class="confidence">Confidence: ${Math.round(data.confidence * 100)}%</span>
            </div>
            <div class="analysis-content">
                <p><b>Text:</b> ${data.text}</p>
                <p><b>Overall Sentiment:</b> <span style="color: ${sentimentColor}">${sentimentLabel}</span></p>
                <p><b>Score:</b> ${data.score}</p>
                <p><b>Intensity:</b> ${Math.abs(data.comparative).toFixed(2)}</p>
                <div class="word-analysis">
                    <div class="positive-words">
                        <b>Positive Words:</b><br>
                        ${data.analysis.positiveWords.length ? data.analysis.positiveWords.join(", ") : "None"}
                    </div>
                    <div class="negative-words">
                        <b>Negative Words:</b><br>
                        ${data.analysis.negativeWords.length ? data.analysis.negativeWords.join(", ") : "None"}
                    </div>
                </div>
                <p class="recommendation">${data.recommendation}</p>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}
