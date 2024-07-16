const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const WINDOW_SIZE = 10;

let storedNumbers = [];

// Fetch numbers from third-party server
async function fetchNumbers(numberId) {
    let apiUrl = '';

    switch (numberId) {
        case 'p':
            apiUrl = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            apiUrl = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            apiUrl = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            apiUrl = 'http://20.244.56.144/test/rand';
            break;
        default:
            return [];
    }

    try {
        const response = await axios.get(apiUrl);
        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error fetching numbers for ${numberId}:`, error.message);
        return [];
    }
}

// Calculate average of numbers
function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

// Middleware to handle requests
app.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;
    const validIds = ['p', 'f', 'e', 'r'];

    if (!validIds.includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    // Fetch numbers from third-party server
    const numbers = await fetchNumbers(numberId);

    // Handle unique numbers, disregard duplicates
    numbers.forEach(num => {
        if (!storedNumbers.includes(num)) {
            storedNumbers.push(num);
        }
    });

    // Maintain window size
    if (storedNumbers.length > WINDOW_SIZE) {
        storedNumbers = storedNumbers.slice(-WINDOW_SIZE);
    }

    // Calculate average of stored numbers
    const avg = calculateAverage(storedNumbers);

    // Format response
    const response = {
        windowPrevState: storedNumbers.slice(0, -numbers.length), // Numbers before latest API call
        windowCurrState: storedNumbers.slice(-numbers.length), // Numbers after latest API call
        numbers: numbers,
        avg: avg.toFixed(2)
    };

    res.json(response);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
