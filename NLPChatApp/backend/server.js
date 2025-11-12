const express = require('express');
const cors = require('cors');
const Sentiment = require('sentiment');

const app = express();
app.use(cors());
app.use(express.json()); // <-- built-in JSON parser

app.post('/analyze', (req, res) => {
    const sentiment = new Sentiment();
    const text = req.body.text;
    const result = sentiment.analyze(text);
    res.json({
        text: text,
        score: result.score,
        comparative: result.comparative,
        positiveWords: result.positive,
        negativeWords: result.negative
    });
});

app.get('/', (req, res) => {
    res.send('Welcome to Local Tone Analyzer!');
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
