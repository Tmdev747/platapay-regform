# PlataPay Agent Application Portal

This is the official PlataPay Agent Application Portal, a secure platform for managing agent applications.

## Production Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Supabase account
- Mapbox account for location services
- ElevenLabs account for voice services
- Groq API key for AI services

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Mapbox Configuration (server-side only)
MAPBOX_TOKEN=your_mapbox_token

# ElevenLabs Configuration (for voice)
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
ELEVEN_LABS_VOICE_ID=your_elevenlabs_voice_id

# Groq Configuration (for AI)
GROQ_API_KEY=your_groq_api_key

# Application URL
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
\`\`\`

### Database Setup

1. Create a new Supabase project
2. Run the database setup script:

\`\`\`bash
npm run setup:database
\`\`\`

### Admin User Creation

Create an admin user with the following command:

\`\`\`bash
npm run create:admin
\`\`\`

Follow the prompts to enter admin email, password, and name.

### Build and Deployment

1. Install dependencies:

\`\`\`bash
npm install
\`\`\`

2. Build the application:

\`\`\`bash
npm run build
\`\`\`

3. Start the production server:

\`\`\`bash
npm start
\`\`\`

### Security Considerations

- Ensure all environment variables are properly set and secured
- Use strong passwords for admin accounts
- Enable MFA for admin accounts in Supabase
- Regularly update dependencies
- Monitor application logs for suspicious activities
- Set up proper backup procedures for the database

## Features

- Secure authentication system
- Agent application management
- Application status tracking
- Admin review interface
- Interactive map of agent locations
- Voice-assisted application form
- Email notifications for application status changes

## License

Copyright © PlataPay. All rights reserved.
