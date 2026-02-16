const express = require('express');
const cors = require('cors');
const path = require('path');
const { searchGoogleMaps, searchIndiaMart, searchJustdial } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve React frontend in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

app.post('/api/search', async (req, res) => {
    const { query, location } = req.body;

    if (!query || !location) {
        return res.status(400).json({ error: 'Query and Location are required' });
    }

    try {
        console.log(`Received search request for: ${query} in ${location}`);

        // Run Sequentially to avoid resource issues
        console.log("Starting Google Scrape...");
        const googleResults = await searchGoogleMaps(query, location);
        console.log(`Google Returned: ${googleResults.length}`);

        console.log("Starting Justdial Scrape...");
        const justdialResults = await searchJustdial(query, location);
        console.log(`Justdial Returned: ${justdialResults.length}`);

        console.log("Starting IndiaMART Scrape...");
        const indiaMartResults = await searchIndiaMart(query, location);
        console.log(`IndiaMART Returned: ${indiaMartResults.length}`);

        const allResults = [...googleResults, ...justdialResults, ...indiaMartResults];

        res.json({ success: true, count: allResults.length, data: allResults });
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ success: false, error: 'Failed to scrape data', details: error.message });
    }
});

// Serve React app for any non-API route (SPA fallback)
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
