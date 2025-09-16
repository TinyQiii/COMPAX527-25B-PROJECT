const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../COMPAX527-25B-PROJECT/frontend'));

// Upload handling (memory storage for demo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = (
      file.mimetype.startsWith('image/') ||
      ['image/png', 'image/jpeg', 'text/csv', 'application/vnd.ms-excel'].includes(file.mimetype)
    );
    cb(ok ? null : new Error('Unsupported file type'), ok);
  }
});

// WHO API configuration
const WHO_BASE_URL = 'https://ghoapi.azureedge.net/api';
const WHO_INDICATORS = {
  // COVID-19 related indicators
  covid_cases: 'C_1_1_1',
  covid_deaths: 'C_1_1_2',
  // Other health indicators
  life_expectancy: 'WHOSIS_000001',
  mortality_rate: 'WHOSIS_000002',
  // Infectious diseases
  tuberculosis: 'MDG_0000000006',
  malaria: 'MDG_0000000007',
  hiv: 'MDG_0000000008'
};

// Helper function to fetch WHO data
async function fetchWHOData(indicator, country = '') {
  try {
    // For demo purposes, return mock data instead of calling real WHO API
    // This ensures the application works even if WHO API is down or changed
    console.log(`Fetching mock data for indicator: ${indicator}, country: ${country}`);
    
    return generateMockData(indicator, country);
  } catch (error) {
    console.error(`Error fetching WHO data for ${indicator}:`, error.message);
    throw new Error(`Failed to fetch WHO data: ${error.message}`);
  }
}

// Generate mock data for demonstration
function generateMockData(indicator, country = '') {
  const countryName = country || 'Global';
  const baseDate = new Date();
  
  // Generate data for the last 12 months
  const mockData = {
    value: []
  };
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() - i);
    
    let value = 0;
    switch (indicator) {
      case 'C_1_1_1': // COVID-19 cases
        value = Math.floor(Math.random() * 10000) + 1000;
        break;
      case 'C_1_1_2': // COVID-19 deaths
        value = Math.floor(Math.random() * 500) + 50;
        break;
      case 'WHOSIS_000001': // Life expectancy
        value = Math.floor(Math.random() * 20) + 60;
        break;
      case 'WHOSIS_000002': // Mortality rate
        value = Math.floor(Math.random() * 50) + 5;
        break;
      case 'MDG_0000000006': // Tuberculosis
        value = Math.floor(Math.random() * 1000) + 100;
        break;
      case 'MDG_0000000007': // Malaria
        value = Math.floor(Math.random() * 2000) + 200;
        break;
      case 'MDG_0000000008': // HIV/AIDS
        value = Math.floor(Math.random() * 500) + 50;
        break;
      default:
        value = Math.floor(Math.random() * 1000) + 100;
    }
    
    mockData.value.push({
      Value: value,
      NumericValue: value,
      TimeDimension: date.toISOString().split('T')[0],
      Country: countryName,
      SpatialDim: countryName
    });
  }
  
  return mockData;
}

// API Routes

// Scan endpoint (mock inference)
app.post('/api/scan', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const model = (req.body && req.body.model) || 'standard';
    // Mock inference: derive stable randomness from file size and name to look consistent
    const seed = (req.file.size + (req.file.originalname || '').length + model.length) % 1000;
    const rand = (seed % 700) / 1000 + 0.25; // 0.25 ~ 0.95
    const confidence = Math.min(0.95, Math.max(0.25, rand));
    const detected = confidence > 0.5;
    const processingMs = 300 + (seed % 400);
    await new Promise(r => setTimeout(r, processingMs));
    return res.json({
      success: true,
      result: {
        detected,
        confidence,
        model,
        filename: req.file.originalname,
        mime: req.file.mimetype,
        size: req.file.size,
        processingMs
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in /api/scan:', err);
    return res.status(500).json({ success: false, error: err.message || 'Scan failed' });
  }
});

// Get WHO health data
app.get('/api/who/health-data', async (req, res) => {
  try {
    const { country = '', indicator = 'all' } = req.query;
    console.log(`API request: country=${country}, indicator=${indicator}`);
    
    let data = {};
    
    if (indicator === 'all') {
      // Fetch multiple indicators
      const indicators = Object.keys(WHO_INDICATORS);
      console.log('Fetching all indicators:', indicators);
      
      for (const key of indicators) {
        try {
          const result = await fetchWHOData(WHO_INDICATORS[key], country);
          data[key] = result;
          console.log(`Successfully fetched data for ${key}`);
        } catch (error) {
          console.error(`Error fetching ${key}:`, error.message);
          data[key] = { error: error.message };
        }
      }
    } else {
      // Fetch specific indicator
      const indicatorKey = WHO_INDICATORS[indicator];
      if (!indicatorKey) {
        return res.status(400).json({ error: 'Invalid indicator' });
      }
      
      console.log(`Fetching specific indicator: ${indicator} -> ${indicatorKey}`);
      data = await fetchWHOData(indicatorKey, country);
    }
    
    console.log('Returning data:', Object.keys(data));
    
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: 'WHO Global Health Observatory (Mock Data)'
    });
    
  } catch (error) {
    console.error('Error in /api/who/health-data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get COVID-19 data specifically
app.get('/api/who/covid', async (req, res) => {
  try {
    const { country = '' } = req.query;
    
    const [casesData, deathsData] = await Promise.all([
      fetchWHOData(WHO_INDICATORS.covid_cases, country),
      fetchWHOData(WHO_INDICATORS.covid_deaths, country)
    ]);
    
    res.json({
      success: true,
      data: {
        cases: casesData,
        deaths: deathsData
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/who/covid:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available indicators
app.get('/api/who/indicators', (req, res) => {
  res.json({
    success: true,
    indicators: WHO_INDICATORS,
    description: {
      covid_cases: 'COVID-19 Cases',
      covid_deaths: 'COVID-19 Deaths',
      life_expectancy: 'Life Expectancy at Birth',
      mortality_rate: 'Mortality Rate',
      tuberculosis: 'Tuberculosis Cases',
      malaria: 'Malaria Cases',
      hiv: 'HIV/AIDS Cases'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 InfectWatch Backend Server running on port ${PORT}`);
  console.log(`📊 WHO API endpoints available at http://localhost:${PORT}/api/who/`);
  console.log(`🌐 Frontend served at http://localhost:${PORT}/infectwatch.html`);
});

module.exports = app;
