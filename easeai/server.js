const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');



dotenv.config();


const app = express();
const port= 3000;

// Middleware to serve static files from the 'public' directory
app.use(express.static('public'));
// Middleware to parse JSON bodies
app.use(express.json());



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Simple in-memory storage for the RAG feature ---
let documentText = ""; // We'll store the uploaded document text here for simplicity

// --- File Upload Setup (for DocuChat) ---
const upload = multer({ dest: 'uploads/' });




// A simple test route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to EaseAi API!' });
});


app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Use a more efficient model for general tasks
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const generationConfig = {
            maxOutputTokens: 1024, // Limit token usage
        };

        const result = await model.generateContent(prompt, generationConfig);
        const response = await result.response;
        const text = response.text();
        
        res.json({ response: text });

    } catch (error) {
        console.error("Error in /api/generate:", error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});



app.post('/api/upload', upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        documentText = data.text; // Store the extracted text in our in-memory variable
        
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ message: 'Document processed successfully! You can now ask questions.' });
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: 'Failed to process document.' });
    }
});





app.post('/api/chat', async (req, res) => {
    const { question } = req.body;

    if (!documentText) {
        return res.status(400).json({ error: 'Please upload a document first.' });
    }
    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        // This is a simplified RAG prompt
        const ragPrompt = `Based *only* on the following document content, answer the user's question. If the answer is not in the document, say "I cannot find the answer in the provided document."

        --- Document Content ---
        ${documentText.substring(0, 7000)}  // Limit context to manage token size
        --- End of Document ---

        User Question: "${question}"`;
        
        const result = await model.generateContent(ragPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });

    } catch (error) {
        console.error("Error in /api/chat:", error);
        res.status(500).json({ error: 'Failed to chat with document.' });
    }
});

app.listen(port, () => {
    console.log(`EaseAi server listening at http://localhost:${port}`);
});