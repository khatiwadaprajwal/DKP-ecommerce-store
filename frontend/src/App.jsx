import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Navbar from "./component/Navbar";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import Order from "./pages/Order";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Product from "./pages/Product";
import Footer from "./component/Footer";
import { ToastContainer, toast } from 'react-toastify';
import PlaceOrder from "./pages/PlaceOrder";
import Adminpage from "./pages/Admin/Adminpage";
import AddProduct from "./pages/Admin/AddProduct";
import Dashboard from "./pages/Admin/Dashboard";
import ListProducts from "./pages/Admin/ListProducts";
import 'react-toastify/dist/ReactToastify.css';
import ListOrders from "./pages/Admin/ListOrders";
import UserLayout from "./pages/UserLayout";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>

        {/* Admin Routes without Navbar/Footer */}
        <Route path="/admin" element={<Adminpage />}>
          <Route index element={<Dashboard />} />
          <Route path="addProduct" element={<AddProduct />} />
          <Route path="listProducts" element={<ListProducts />} />
          <Route path="ordersList" element={<ListOrders />} />
        </Route>

        {/* User Routes with Navbar/Footer */}
        <Route element={<UserLayout/>}>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/order" element={<Order />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/placeOrder" element={<PlaceOrder />} />
        </Route>

      </Routes>
    </div>
  );
};

export default App;
