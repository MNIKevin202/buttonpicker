const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3117;

// Serve static files
app.use(express.static('.'));

// API endpoints for data management
app.get('/api/picker-data/:pickerType', (req, res) => {
    const pickerType = req.params.pickerType;
    let dataPath;
    
    switch(pickerType) {
        case 'BRCP':
            dataPath = path.join(__dirname, 'BRCP/pickerData.json');
            break;
        case 'FNFSPicker':
            dataPath = path.join(__dirname, 'FNFSPicker/pickerData.json');
            break;
        case 'WheelSpin':
            dataPath = path.join(__dirname, 'wheelSpin/pickerData.json');
            break;
        default:
            return res.status(404).json({ error: 'Picker type not found' });
    }
    
    try {
        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            res.json(data);
        } else {
            res.json({});
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/picker-data/:pickerType', express.json(), (req, res) => {
    const pickerType = req.params.pickerType;
    const data = req.body;
    let dataPath;
    
    switch(pickerType) {
        case 'BRCP':
            dataPath = path.join(__dirname, 'BRCP/pickerData.json');
            break;
        case 'FNFSPicker':
            dataPath = path.join(__dirname, 'FNFSPicker/pickerData.json');
            break;
        case 'WheelSpin':
            dataPath = path.join(__dirname, 'wheelSpin/pickerData.json');
            break;
        default:
            return res.status(404).json({ error: 'Picker type not found' });
    }
    
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`ButtonPicker server running on port ${PORT}`);
});
