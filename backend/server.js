const express = require('express');
const cors = require('cors');
const path = require('path');
const Sentiment = require('sentiment');

const app = express();

// Configure CORS with specific options
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const sentiment = new Sentiment();

// Custom positive and negative word lists for Indian languages (in transliterated form)
const customWordLists = {
    te: {
        positive: ['bagundi', 'chala bagundi', 'manchidi', 'goppa', 'adhbutham', 'sahasam', 'andam', 'premalekha', 'santosham', 'dhairyam', 'chala manchidi'],
        negative: ['chetha', 'chiraku', 'kopam', 'dukham', 'baadha', 'kastam', 'noppi', 'virakti', 'asahyam', 'edupu', 'chala chetha']
    },
    ta: {
        positive: ['nalla', 'romba nalla', 'magilchi', 'super', 'arumai', 'nanmai', 'inbam', 'anbu', 'santosam', 'theiryam', 'romba super'],
        negative: ['mosam', 'kovam', 'kashtam', 'thunbam', 'varutham', 'vali', 'verupppu', 'sogram', 'azhugai', 'romba kashtam']
    },
    hi: {
        positive: ['achha', 'bahut achha', 'uttam', 'sundar', 'pyara', 'shreshth', 'madhur', 'preeti', 'khushi', 'himmat', 'bahut sundar'],
        negative: ['bura', 'kharab', 'dukh', 'gussa', 'dard', 'mushkil', 'pareshan', 'nafrat', 'rona', 'chinta', 'bahut bura']
    }
};

// Language names for display
const languageNames = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    nl: 'Dutch',
    hi: 'Hindi (Type in English)',
    te: 'Telugu (Type in English)',
    ta: 'Tamil (Type in English)',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese'
};

app.get('/languages', (req, res) => {
    res.json(Object.entries(languageNames).map(([code, name]) => ({ code, name })));
});

// Function to analyze Indian language text
function analyzeIndianLanguageText(text, language) {
    const wordList = customWordLists[language];
    if (!wordList) return { score: 0, words: { positive: [], negative: [] } };

    const inputText = text.toLowerCase();
    let score = 0;
    const foundPositive = [];
    const foundNegative = [];

    // Check for positive words/phrases
    wordList.positive.forEach(word => {
        if (inputText.includes(word.toLowerCase())) {
            score += 1;
            foundPositive.push(word);
        }
    });

    // Check for negative words/phrases
    wordList.negative.forEach(word => {
        if (inputText.includes(word.toLowerCase())) {
            score -= 1;
            foundNegative.push(word);
        }
    });

    return {
        score: score,
        words: {
            positive: foundPositive,
            negative: foundNegative
        }
    };
}

app.post('/analyze', (req, res) => {
    let { text, language = 'en' } = req.body;

    if (!text) {
        return res.status(400).json({
            error: 'Please provide some text to analyze'
        });
    }

    // Clean the text (remove extra spaces)
    text = text.trim().replace(/\s+/g, ' ');

    try {
        let result;
        
        // Use custom analysis for Indian languages
        if (['te', 'ta', 'hi'].includes(language)) {
            const customAnalysis = analyzeIndianLanguageText(text, language);
            result = {
                score: customAnalysis.score,
                comparative: customAnalysis.score / text.split(/\s+/).length,
                positive: customAnalysis.words.positive,
                negative: customAnalysis.words.negative
            };
        } else {
            // Use sentiment package for other languages
            result = sentiment.analyze(text);
        }
        
        // Determine sentiment category
        let sentimentCategory;
        if (result.score > 0) sentimentCategory = 'Positive';
        else if (result.score < 0) sentimentCategory = 'Negative';
        else sentimentCategory = 'Neutral';

        res.json({
            text: text,
            language: languageNames[language] || 'English',
            sentiment: sentimentCategory,
            score: result.score,
            comparative: result.comparative,
            positiveWords: result.positive || [],
            negativeWords: result.negative || [],
            details: {
                numWords: text.split(/\s+/).length,
                language: language
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error analyzing text',
            details: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
