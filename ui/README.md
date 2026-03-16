# The Competent Community - Community Platform

A modern web application for community engagement, featuring a business directory, events management, and complaint tracking system.

## Features

- **Homepage**: Community overview with statistics and featured content
- **Business Directory**: Search and browse local businesses with filtering
- **Events Page**: Community events with search, filtering, and attendance tracking
- **Complaints Page**: Submit and track community issues with status management

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd unite-the-hood
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx      # Navigation component
│   └── Footer.jsx      # Footer component
├── pages/              # Page components
│   ├── HomePage.jsx    # Homepage
│   ├── BusinessDirectory.jsx  # Business directory
│   ├── EventsPage.jsx  # Events page
│   └── ComplaintsPage.jsx     # Complaints page
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Features Overview

### Homepage
- Hero section with call-to-action buttons
- Community statistics
- Feature highlights
- Community spotlight section

### Business Directory
- Search functionality
- Category filtering
- Business cards with contact information
- Rating and review display

### Events Page
- Event listings with images
- Search and category filtering
- Attendance tracking
- Event details and registration

### Complaints Page
- Submit new complaints
- Status tracking (pending, in-progress, resolved)
- Priority levels
- Response system
- Statistics dashboard

## Customization

### Colors
The application uses a custom color scheme defined in `tailwind.config.js`:
- Primary colors: Blue shades
- Secondary colors: Purple shades

### Styling
Global styles and component classes are defined in `src/index.css` using Tailwind CSS utilities.

## Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deploying to Render

This project is configured for deployment to Render as a static site.

#### Prerequisites
- A Render account
- Your repository connected to Render

#### Steps

1. **Connect your repository to Render:**
   - Go to your Render dashboard
   - Click "New +" → "Static Site"
   - Connect your Git repository
   - Select the `ui` directory as the root directory

2. **Configure the service:**
   - **Name**: `the-competent-community-ui` (or your preferred name)
   - **Build Command**: `npm ci && npm run build` ⚠️ **IMPORTANT: This must be set manually in the dashboard**
   - **Publish Directory**: `dist`
   - **Node Version**: `20` (or use the `.nvmrc` file)
   - Note: The `render.yaml` file provides default configuration, but you may need to verify these settings in the Render dashboard

3. **Set Environment Variables:**
   In the Render dashboard, add the following environment variables:
   - `VITE_API_URL` - Your backend API URL
   - `VITE_WEATHER_API_KEY` - OpenWeatherMap API key (if using weather features)
   - `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key (if using maps features)
   - `VITE_DATABASE_URL` - Database URL (if needed)
   - `VITE_AUTH_DOMAIN` - Auth domain (if using authentication)
   - `VITE_AUTH_CLIENT_ID` - Auth client ID (if using authentication)

4. **Deploy:**
   - Click "Create Static Site"
   - Render will automatically build and deploy your application
   - Your site will be available at `https://your-service-name.onrender.com`

#### Notes
- Render automatically handles SPA routing for React Router
- The `render.yaml` file contains the deployment configuration
- Environment variables prefixed with `VITE_` are available in your React app via `import.meta.env.VITE_*`
- Make sure your backend API is deployed and accessible before setting `VITE_API_URL`

### Other Recommended Hosting
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository. 