# Full Stack Web Application

## Project Overview
This is a modern full-stack web application built with a React frontend and Node.js/Express backend. The project follows a microservices architecture with separate frontend and backend services, providing a scalable and maintainable codebase.

## Project Flow

### Client-Server Architecture
```
[Client/Frontend]  <------>  [Server/Backend]  <------>  [Database/MongoDB]
    React App         HTTP       Express.js          Mongoose
                    (API)
```

### Data Flow
1. **User Interaction Flow**:
   - User interacts with React frontend components
   - Frontend components make API calls using Axios
   - Backend processes requests through Express routes
   - Data is stored/retrieved from MongoDB database
   - Response sent back to frontend
   - UI updates with new data

2. **Authentication Flow**:
   - User submits login/signup credentials
   - Frontend sends request to authentication endpoints
   - Backend validates credentials using bcryptjs
   - JWT token generated and sent to client
   - Frontend stores token for authenticated requests
   - Protected routes check token validity

3. **Feature Workflows**:
   - **Maps Integration**:
     - Frontend uses Google Maps/Leaflet components
     - Location data processed through backend APIs
     - Real-time updates using state management

   - **File Upload**:
     - Files selected through frontend interface
     - Multer middleware processes uploads on backend
     - Files stored in designated storage
     - File URLs/metadata saved in database

   - **Payment Processing**:
     - Payment initiated through frontend UI
     - PayPal SDK handles payment flow
     - Backend validates and processes transactions
     - Email notifications sent via Nodemailer

   - **Scheduled Tasks**:
     - Node-cron manages scheduled operations
     - Automated processes run at specified intervals
     - System maintenance and updates handled automatically

4. **Error Handling**:
   - Frontend displays errors using toast notifications
   - Backend middleware catches and processes errors
   - Consistent error responses across application

## Technology Stack

### Frontend
- **Framework**: React (v19)
- **Build Tool**: Vite
- **UI/Styling**:
  - Tailwind CSS
  - Shadcn UI
  - Styled Components
  - Framer Motion (for animations)
  - AOS (Animate On Scroll)
- **State Management & Routing**:
  - React Router DOM (v7)
  - JWT for authentication
- **Maps Integration**:
  - React Google Maps API
  - Leaflet/React Leaflet
- **Additional Features**:
  - Toast notifications (react-hot-toast, react-toastify)
  - Date handling with date-fns
  - Swiper for carousels/sliders
  - Axios for API requests

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: 
  - JWT (JSON Web Tokens)
  - bcryptjs for password hashing
- **Additional Features**:
  - Multer for file uploads
  - Nodemailer for email functionality
  - PayPal integration
  - CORS enabled
  - Node-cron for scheduled tasks
  - Environment variable management with dotenv

## Project Structure

```
├── frontend/                # React frontend application
│   ├── src/                # Source files
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
│
├── backend/                # Node.js backend application
│   ├── controller/         # Route controllers
│   ├── model/             # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   ├── utils/             # Utility functions
│   └── app.js             # Main application file
```

## Getting Started

### Prerequisites
- Node.js (Latest LTS version recommended)
- MongoDB installed and running
- npm or yarn package manager

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with necessary environment variables
4. Start the server:
   ```bash
   npm start
   ```

## Features
- Modern and responsive UI with Tailwind CSS
- Interactive maps integration
- Secure authentication system
- File upload capabilities
- Email notification system
- Payment integration with PayPal
- Scheduled tasks with node-cron
- RESTful API architecture
