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
    },
    de: {
        positive: ['schön', 'gut', 'wunderbar', 'toll', 'ausgezeichnet', 'prima', 'angenehm', 'herrlich', 'glücklich', 'sehr gut', 'fantastisch', 'perfekt'],
        negative: ['schlecht', 'schrecklich', 'furchtbar', 'hässlich', 'traurig', 'böse', 'übel', 'schlimm', 'ärgerlich', 'sehr schlecht', 'miserabel']
    },
    es: {
        positive: ['bueno', 'excelente', 'fantástico', 'hermoso', 'maravilloso', 'feliz', 'alegre', 'genial', 'estupendo', 'perfecto', 'increíble'],
        negative: ['malo', 'terrible', 'horrible', 'feo', 'triste', 'pésimo', 'desagradable', 'fatal', 'peor', 'malísimo', 'espantoso']
    },
    fr: {
        positive: ['bon', 'excellent', 'fantastique', 'beau', 'merveilleux', 'heureux', 'joyeux', 'génial', 'superbe', 'parfait', 'incroyable'],
        negative: ['mauvais', 'terrible', 'horrible', 'laid', 'triste', 'affreux', 'désagréable', 'nul', 'pire', 'catastrophique', 'épouvantable']
    },
    it: {
        positive: ['buono', 'eccellente', 'fantastico', 'bello', 'meraviglioso', 'felice', 'gioioso', 'ottimo', 'perfetto', 'incredibile', 'stupendo'],
        negative: ['cattivo', 'terribile', 'orribile', 'brutto', 'triste', 'pessimo', 'spiacevole', 'peggiore', 'disastroso', 'spaventoso', 'terrificante']
    },
    pt: {
        positive: ['bom', 'excelente', 'fantástico', 'bonito', 'maravilhoso', 'feliz', 'alegre', 'ótimo', 'perfeito', 'incrível', 'espetacular'],
        negative: ['mau', 'terrível', 'horrível', 'feio', 'triste', 'péssimo', 'desagradável', 'pior', 'desastroso', 'assustador', 'espantoso']
    },
    nl: {
        positive: ['goed', 'uitstekend', 'fantastisch', 'mooi', 'geweldig', 'gelukkig', 'blij', 'prima', 'perfect', 'ongelooflijk', 'prachtig'],
        negative: ['slecht', 'verschrikkelijk', 'vreselijk', 'lelijk', 'droevig', 'ellendig', 'onaangenaam', 'erger', 'rampzalig', 'angstaanjagend', 'afschuwelijk']
    }
    ,
    ja: {
        positive: [
            '良い', '素晴らしい', '最高', '嬉しい', '楽しい', '素敵', '快適', '満足', '最高だ', '良かった',
            // Romanized / English-typed variants
            'ii', 'yoi', 'subarashii', 'sugoi', 'ureshii', 'tanoshii', 'suteki', 'kaiteki', 'manzoku', 'saikou', 'yokatta'
        ],
        negative: [
            '悪い', '最悪', 'ひどい', '悲しい', '不満', '不快', '嫌い', '辛い', '問題', '失望', '酷い',
            // Romanized / English-typed variants
            'warui', 'saiaku', 'hidoi', 'kanashii', 'fuman', 'fukai', 'kirai', 'tsurai', 'mondai', 'shitsubou'
        ]
    },
    ko: {
        positive: [
            '좋다', '아주 좋다', '최고', '행복', '기쁘다', '즐겁다', '멋지다', '훌륭하다', '만족', '정말 좋다', '최고다',
            // Romanized / English-typed variants
            'johta', 'joayo', 'choego', 'haengbok', 'gippeuda', 'jeulgeopda', 'meotjida', 'hullyunghada', 'manjok', 'choegoda'
        ],
        negative: [
            '나쁘다', '최악', '끔찍하다', '슬프다', '불만', '불쾌', '싫다', '고통', '문제', '실망', '형편없다',
            // Romanized / English-typed variants
            'nappeuda', 'choegak', 'kkeumjjikhada', 'seulpeuda', 'bulman', 'bulkwae', 'silta', 'gotong', 'munje', 'silmang'
        ]
    },
    zh: {
        positive: [
            '好', '非常好', '棒', '精彩', '快乐', '幸福', '优秀', '满意', '漂亮', '美好', '太棒了',
            // Romanized / English-typed variants (Pinyin)
            'hao', 'feichang hao', 'bang', 'jingcai', 'kuaile', 'xingfu', 'youxiu', 'manyi', 'piaoliang', 'meihao', 'tai bang le'
        ],
        negative: [
            '坏', '很糟', '糟糕', '难过', '悲伤', '讨厌', '失望', '问题', '可怕', '糟透了', '差劲',
            // Romanized / English-typed variants (Pinyin)
            'huai', 'hen zao', 'zaogao', 'nanguo', 'beishang', 'taoyan', 'shiwang', 'wenti', 'kepai', 'zaotoule'
        ]
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
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
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
        
        // Use custom analysis for languages with word lists
        if (customWordLists[language]) {
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
