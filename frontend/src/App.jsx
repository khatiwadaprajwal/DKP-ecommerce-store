import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Page Imports
import Home from "./pages/Home";
import About from "./pages/About";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import Order from "./pages/Order";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Product from "./pages/Product";
import PlaceOrder from "./pages/PlaceOrder";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import PaypalSuccess from "./pages/PaypalSuccess";
import Profile from "./pages/profile";
import UserLayout from "./pages/UserLayout";

// Admin Imports
import Adminpage from "./pages/Admin/Adminpage";
import AddProduct from "./pages/Admin/AddProduct";
import Dashboard from "./pages/Admin/Dashboard";
import ListProducts from "./pages/Admin/ListProducts";
import ListOrders from "./pages/Admin/ListOrders";
import ListUsers from "./pages/Admin/ListUsers";
import AdminMessagesPage from "./pages/Admin/AdminMessagePage";

// ✅ Import Routes from their component file (NOT AuthProvider)
import { AdminRoute, CustomerRoute } from "./component/ProtectedRoutes";

const App = () => {
  return (
    <div className="app-container">
      {/* ✅ Single Toast Container */}
      <ToastContainer position="bottom-right" />
      
      <Routes>
        {/* --- ADMIN ROUTES (Protected) --- */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Adminpage />}>
            <Route index element={<Dashboard />} />
            <Route path="addProduct" element={<AddProduct />} />
            <Route path="listProducts" element={<ListProducts />} />
            <Route path="ordersList" element={<ListOrders />} />
            <Route path="listUsers" element={<ListUsers />} />
            <Route path="message" element={<AdminMessagesPage />} />
          </Route>
        </Route>

        {/* --- CUSTOMER/PUBLIC ROUTES --- */}
        <Route element={<UserLayout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          
          {/* PayPal Success */}
          <Route path="/paypal/success" element={<PaypalSuccess />} />

          {/* Protected Customer Routes (Requires Login) */}
          <Route element={<CustomerRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/placeOrder" element={<PlaceOrder />} />
            <Route path="/order" element={<Order />} />
            <Route path="/cart" element={<Cart />} />
            {/* <Route path="/change-password" element={<ChangePassword />} /> */}
          </Route>
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;