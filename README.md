# FitFolio – Wardrobe Management System

FitFolio is a full-stack web application for managing a digital wardrobe. Users can upload clothing photos, extract EXIF metadata, create outfits, and view analytics dashboards.

# Technologies Used

## Frontend

- **React 19.1.1** - Modern React with latest features
- **Vite 7.1.7** - Fast development build tool
- **React Router DOM 7.11.0** - Client-side routing
- **Chart.js 4.5.1** - Data visualization and analytics charts
- **React Chart.js 2 5.3.1** - React wrapper for Chart.js
- **Leaflet 1.9.4** - Interactive maps
- **React Leaflet 5.0.0**
- React components for Leaflet
- **Axios 1.13.2** - HTTP client for API calls
- **Exifr 7.1.3** - EXIF data extraction from images
- **React Icons 5.5.0** - Icon library
- **Tailwind CSS 4.1.18** - Utility-first CSS framework

## Backend

- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web application framework
- **SQLite3 5.1.7** - Lightweight database
- **JWT 9.0.3** - JSON Web Tokens for authentication
- **Bcryptjs 3.0.3** - Password hashing
- **Multer 2.0.2** - File upload handling
- **CORS 2.8.5** - Cross-Origin Resource Sharing
- **UUID 13.0.0** - Unique identifier generation
- **Exifr 7.1.3** - Server-side EXIF data processing

# Features

## User Features

- **Photo Upload** - Upload your own clothing items
- **Item Management** - Organize clothing items with categories, brands, prices, and descriptions
- **Outfit Creator** - Combine multiple items to create and save outfit combinations

## Admin Features

- **User Management** - Comprehensive admin dashboard for user oversight
- **Advanced Analytics** - Multi-dimensional data visualization including:
- Photo activity heatmaps by hour
- Wardrobe class distribution analysis
- Economic status segmentation
- Geographic user distribution
- Upload frequency analysis
- **Data Insights** - Bubble charts showing wardrobe value vs item count patterns
- **Economic Status Filtering** - Filter and analyze users by spending patterns
- **EXIF Data Management** - Complete oversight of user-generated metadata

## Technical Features

- **Secure Authentication** - JWT-based login system with admin roles
- **Responsive Design** - Using Tailwind CSS
- **Data Synchronization** - Consistent state management across components

# Getting Started

1. **Clone the repository**
   bash
   git clone [<repository-url>](https://github.com/EHB-MCT/wdm-PemaBhutia2005)
   cd wdm-PemaBhutia2005
2. **Docker**
   bash
   cd wdm
   docker-compose up --build

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

# Test Account

For testing purposes, a test user account is pre-populated with sample clothing items and outfits:

**Email:** testuser2@email.com  
**Password:** testuser2

This account contains:
- 8 clothing items with EXIF data and images
- Sample outfit combinations
- Realistic pricing and brand data

# Sources

## Docker

https://docs.docker.com/

- `docker-compose.yml` - Lines 1-25 (Multi-container orchestration)
- `wdm/frontend/Dockerfile` - Lines 1-14 (Frontend container setup)
- `wdm/backend/Dockerfile` - Lines 1-15 (Backend containerization)

## Database & Files

### SQLite

https://www.sqlite.org/docs.html

- `wdm/backend/config/database.js` - Lines 10-45 (Database connection, schema creation)
- `wdm/backend/models/User.js` - Lines 15-80 (Table creation, raw SQL queries)
- `wdm/backend/models/ClothingItem.js` - Lines 20-100 (SQLite operations)

### Sequelize ORM

https://sequelize.org/docs/v6/

- `wdm/backend/config/database.js` - Lines 1-50 (Database initialization)
- `wdm/backend/models/Outfit.js` - Lines 1-60 (Model definitions)
- `wdm/backend/models/ClothingItem.js` - Lines 80-120 (Query operations)

### Multer (File Uploads)

https://github.com/expressjs/multer

- `wdm/backend/routes/clothing-items.js` - Lines 5-25 (Upload middleware configuration)
- `wdm/backend/index.js` - Lines 13-14 (Static file serving)
- `wdm/backend/routes/clothing-items.js` - Lines 30-50 (File handling logic)

## Auth & Security

### JWT Authentication

https://jwt.io/introduction

- `wdm/backend/routes/auth.js` - Lines 32-36, 72-76 (Token generation)
- `wdm/backend/routes/auth.js` - Lines 92-115 (Token verification in /me endpoint)
- `wdm/backend/middleware/auth.js` - Lines 5-25 (JWT middleware)
- `wdm/frontend/src/context/AuthContext.jsx` - Lines 15-35 (Token storage)

### bcrypt (Password Hashing)

https://github.com/dcodeIO/bcrypt.js

- `wdm/backend/models/User.js` - Lines 40-65 (Password hashing functions)
- `wdm/backend/routes/auth.js` - Lines 66, 86 (Password validation)
- `wdm/backend/models/User.js` - Lines 70-80 (Password comparison)

## Data & Media

### Chart.js

https://www.chartjs.org/docs/latest/

- `wdm/frontend/src/components/charts/PhotoHistogramChart.jsx` - Lines 10-60 (Chart configuration)
- `wdm/frontend/src/components/charts/WardrobeClassChart.jsx` - Lines 15-70 (Chart types)
- `wdm/frontend/src/components/AdminDashboard.jsx` - Lines 150-220 (Chart instances)

### React Chart.js 2

https://react-chartjs-2.js.org/

- `wdm/frontend/src/components/charts/PhotoHistogramChart.jsx` - Lines 1-10, 60-80 (React wrapper)
- `wdm/frontend/src/components/charts/WardrobeClassChart.jsx` - Lines 1-15, 70-85 (Component integration)
- `wdm/frontend/src/components/AdminDashboard.jsx` - Lines 100-150 (Chart rendering)

### EXIF / Image Metadata (exifr)

https://github.com/MikeKovarik/exifr

- `wdm/backend/routes/clothing-items.js` - Lines 45-75 (EXIF data extraction)
- `wdm/backend/models/ClothingItem.js` - Lines 100-120 (Metadata storage)
- `wdm/frontend/src/services/api.jsx` - Lines 55-65 (EXIF data handling)

## AI

### ChatGPT

https://chatgpt.com/g/g-p-6952952a47b881919dbb7fcfeb1159cb-dev5/project

- All JavaScript/JSX files - Code generation, debugging, optimization

### OpenCode

see startup-stories.md

- `startup-stories.md` - Documentation of AI-assisted development

# Author

Pema Bhutia - 3BaMCT - 2025-2026
