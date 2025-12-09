import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import ShopContextProvider from './context/ShopContext.jsx';
import { AuthProvider } from './context/AuthProvider.jsx'; // ✅ Import from Context

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ShopContextProvider>
      
      <AuthProvider>
        <App />
      </AuthProvider>
    </ShopContextProvider>
  </BrowserRouter>
);