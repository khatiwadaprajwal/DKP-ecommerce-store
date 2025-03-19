import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import Order from "./pages/Order";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Product from "./pages/Product";
import { ToastContainer } from "react-toastify";
import PlaceOrder from "./pages/PlaceOrder";
import Adminpage from "./pages/Admin/Adminpage";
import AddProduct from "./pages/Admin/AddProduct";
import Dashboard from "./pages/Admin/Dashboard";
import ListProducts from "./pages/Admin/ListProducts";
import "react-toastify/dist/ReactToastify.css";
import ListOrders from "./pages/Admin/ListOrders";
import UserLayout from "./pages/UserLayout";
import ListUsers from "./pages/Admin/ListUsers";
import ForgotPassword from "./pages/ForgotPassword";
// import ChangePassword from "./pages/ChangePassword";
import {
  AdminRoute,
  AuthProvider,
  CustomerRoute,
} from "./component/ProtectedRoutes";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <AuthProvider>
      <div>
        <ToastContainer />
        <Routes>
          {/* Auth Routes - No Layout */}

          {/* Admin Routes - Protected with Admin Role */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Adminpage />}>
              <Route index element={<Dashboard />} />
              <Route path="addProduct" element={<AddProduct />} />
              <Route path="listProducts" element={<ListProducts />} />
              <Route path="ordersList" element={<ListOrders />} />
              <Route path="listUsers" element={<ListUsers />} />
            </Route>
          </Route>

          {/* Customer Routes - Some Protected */}
          <Route element={<UserLayout />}>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<Order />} />
            <Route path="/placeOrder" element={<PlaceOrder />} />

            {/* Protected Customer Routes */}
            <Route element={<CustomerRoute />}>
            
              {/* <Route path="/change-password" element={<ChangePassword />} /> */}
            </Route>
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
