// Application configuration based on environment

export const config = {
  // Production URLs
  production: {
    appUrl: 'https://strong-habit-app.netlify.app',
    redirectUrl: 'https://strong-habit-app.netlify.app/auth/callback'
  },
  
  // Development URLs
  development: {
    appUrl: 'http://localhost:3002',
    redirectUrl: 'http://localhost:3002/auth/callback'
  }
}

// Get current environment configuration
export const getCurrentConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction ? config.production : config.development
}

// Get the correct redirect URL for OAuth
export const getAuthRedirectUrl = () => {
  const currentConfig = getCurrentConfig()
  return currentConfig.redirectUrl
}

// Get the base app URL
export const getAppUrl = () => {
  const currentConfig = getCurrentConfig()
  return currentConfig.appUrl
} 