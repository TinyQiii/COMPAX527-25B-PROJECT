// InfectWatch Backend Configuration
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  whoApi: {
    baseUrl: 'https://ghoapi.azureedge.net/api',
    timeout: 10000
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  }
};
