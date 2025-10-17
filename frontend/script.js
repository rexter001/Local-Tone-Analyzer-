async function analyzeText() {
    const text = document.getElementById('textInput').value;
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = "Analyzing...";

    try {
        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        resultDiv.innerHTML = `
            <b>Text:</b> ${data.text}<br>
            <b>Score:</b> ${data.score}<br>
            <b>Comparative:</b> ${data.comparative}<br>
            <b>Positive Words:</b> ${data.positiveWords.join(", ")}<br>
            <b>Negative Words:</b> ${data.negativeWords.join(", ")}
        `;
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
}
