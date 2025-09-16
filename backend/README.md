# InfectWatch Backend

Node.js backend server for the InfectWatch application that provides WHO Global Health Observatory API integration and data visualization.

## Features

- 🌍 WHO Global Health Observatory API integration
- 📊 COVID-19 data (cases, deaths)
- 🏥 Health indicators (life expectancy, mortality rate, etc.)
- 🦠 Infectious disease data (tuberculosis, malaria, HIV/AIDS)
- 🌐 CORS-enabled for frontend integration
- 📈 Data visualization endpoints

## API Endpoints

### Health Data
- `GET /api/who/health-data` - Get WHO health data
  - Query params: `country` (optional), `indicator` (optional)
  - Example: `/api/who/health-data?country=USA&indicator=covid_cases`

### COVID-19 Specific
- `GET /api/who/covid` - Get COVID-19 data specifically
  - Query params: `country` (optional)

### Available Indicators
- `GET /api/who/indicators` - List all available indicators

### Health Check
- `GET /api/health` - Server health status

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable.

## WHO API Integration

This backend integrates with the WHO Global Health Observatory API to fetch:
- COVID-19 cases and deaths
- Life expectancy data
- Mortality rates
- Infectious disease statistics
- Other health indicators

## Frontend Integration

The backend serves the frontend static files and provides API endpoints for data visualization. The frontend can be accessed at `http://localhost:3000/infectwatch.html`.

## Error Handling

The API includes comprehensive error handling for:
- WHO API timeouts
- Invalid indicators
- Network errors
- Data processing errors

## License

MIT
