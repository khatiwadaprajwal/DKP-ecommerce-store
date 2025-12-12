import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Package, MapPin, CreditCard, DollarSign, ArrowLeft, MapIcon } from "lucide-react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { address as addressData } from "../assets/address.js";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationPicker = ({ onLocationSelected }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({ click(e) { setPosition(e.latlng); onLocationSelected(e.latlng); } });
  return position === null ? null : <Marker position={position} />;
};

const PlaceOrder = () => {
  const { cartData, token, delivery_fee, fetchCartData, backend_url, openPayPalPopup } = useContext(ShopContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [shippingInfo, setShippingInfo] = useState({ 
    fullName: "", 
    streetAddress: "", 
    city: "", 
    phone: "" 
  });
  
  // Nepal address state
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  
  const [location, setLocation] = useState({ lat: 27.7172, lng: 85.324 });
  const [locationSelected, setLocationSelected] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }));
    loadSelectedItems();
  }, []);

  const loadSelectedItems = () => {
    const stored = localStorage.getItem("selectedCartItems");
    if (!stored) { navigate("/cart"); return; }
    try {
      const parsed = JSON.parse(stored);
      setSelectedItems(parsed);
      const matched = cartData.filter(c => parsed.some(s => s.productId === c.itemId && s.color === (c.color || "default") && s.size === (c.size || "default")));
      if (matched.length > 0) setSelectedProducts(matched);
    } catch(e) {}
  };

  useEffect(() => {
    if (cartData.length && selectedItems.length) {
      const matched = cartData.filter(c => selectedItems.some(s => s.productId === c.itemId && s.color === (c.color || "default") && s.size === (c.size || "default")));
      if (matched.length) setSelectedProducts(matched);
    }
  }, [cartData, selectedItems]);

  // Handle province selection
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setSelectedDistrict("");
    setSelectedMunicipality("");
    setAvailableMunicipalities([]);
    
    if (provinceId) {
      const province = addressData.find(p => p.id.toString() === provinceId);
      if (province && province.districts) {
        setAvailableDistricts(Array.isArray(province.districts) ? province.districts : Object.values(province.districts));
      }
    } else {
      setAvailableDistricts([]);
    }
  };

  // Handle district selection
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedMunicipality("");
    
    if (districtId) {
      const district = availableDistricts.find(d => d.id.toString() === districtId);
      if (district && district.municipalities) {
        setAvailableMunicipalities(Array.isArray(district.municipalities) ? district.municipalities : Object.values(district.municipalities));
      }
    } else {
      setAvailableMunicipalities([]);
    }
  };

  // Handle municipality selection
  const handleMunicipalityChange = (e) => {
    setSelectedMunicipality(e.target.value);
  };

  const total = selectedProducts.reduce((sum, i) => sum + i.price * i.quantity, 0) + delivery_fee;
  const handleInputChange = (e) => setShippingInfo(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleLocationSelected = (l) => { setLocation({ lat: l.lat, lng: l.lng }); setLocationSelected(true); toast.success("Location selected!"); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    for (const v of Object.values(shippingInfo)) {
      if (!v.trim()) return toast.error("Fill all shipping information fields");
    }
    
    if (!selectedProvince) return toast.error("Please select a province");
    if (!selectedDistrict) return toast.error("Please select a district");
    if (!selectedMunicipality) return toast.error("Please select a municipality");
    if (!locationSelected) return toast.error("Select location on map");

    setIsLoading(true);
    try {
      const productsForAPI = selectedProducts.map(item => ({ 
        productId: item.itemId, 
        quantity: item.quantity, 
        color: item.color || "default", 
        size: item.size || "default" 
      }));
      
      // Get selected address names
      const province = addressData.find(p => p.id.toString() === selectedProvince);
      const district = availableDistricts.find(d => d.id.toString() === selectedDistrict);
      const municipality = availableMunicipalities.find(m => m.id.toString() === selectedMunicipality);
      
      const fullAddress = `${shippingInfo.fullName}, ${shippingInfo.streetAddress}, ${shippingInfo.city}, ${municipality?.name || ''}, ${district?.name || ''}, ${province?.name || ''}, ${shippingInfo.phone}`;
      
      const orderData = {
        selectedProducts: productsForAPI,
        address: fullAddress,
        location, 
        paymentMethod
      };

      const response = await axios.post(`${backend_url}/v1/placeorder`, orderData, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem("selectedCartItems");

      if (response.data.khaltiUrl) {
        window.location.href = response.data.khaltiUrl;
      } else if (response.data.approvalUrl) {
        const ids = selectedProducts.map(item => item.itemId).join(',');
        localStorage.setItem('paypal_pending_product_ids', ids);
        openPayPalPopup(response.data.approvalUrl);
      } else {
        fetchCartData();
        toast.success("Order successful!");
        navigate("/order", { state: { order: response.data.order } });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate("/cart")} className="flex items-center text-blue-600 mb-4">
        <ArrowLeft size={16} />Back to Cart
      </button>
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 shadow-md rounded-xl">
           <form onSubmit={handleSubmit}>
             <h3 className="font-bold mb-3 text-lg">Shipping Information</h3>
             
             {/* Personal Information */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <input 
                 name="fullName" 
                 placeholder="Full Name *" 
                 value={shippingInfo.fullName} 
                 onChange={handleInputChange} 
                 className="border p-2 rounded" 
                 required 
               />
               <input 
                 name="phone" 
                 placeholder="Phone Number *" 
                 value={shippingInfo.phone} 
                 onChange={handleInputChange} 
                 className="border p-2 rounded" 
                 required 
               />
             </div>
             
             {/* Nepal Address Dropdowns */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <select 
                 value={selectedProvince} 
                 onChange={handleProvinceChange} 
                 className="border p-2 rounded" 
                 required
               >
                 <option value="">Select Province *</option>
                 {addressData.map(province => (
                   <option key={province.id} value={province.id}>
                     {province.name}
                   </option>
                 ))}
               </select>
               
               <select 
                 value={selectedDistrict} 
                 onChange={handleDistrictChange} 
                 className="border p-2 rounded" 
                 required
                 disabled={!selectedProvince}
               >
                 <option value="">Select District *</option>
                 {availableDistricts.map(district => (
                   <option key={district.id} value={district.id}>
                     {district.name}
                   </option>
                 ))}
               </select>
               
               <select 
                 value={selectedMunicipality} 
                 onChange={handleMunicipalityChange} 
                 className="border p-2 rounded" 
                 required
                 disabled={!selectedDistrict}
               >
                 <option value="">Select Municipality *</option>
                 {availableMunicipalities.map(municipality => (
                   <option key={municipality.id} value={municipality.id}>
                     {municipality.name}
                   </option>
                 ))}
               </select>
               
               <input 
                 name="city" 
                 placeholder="City/Area *" 
                 value={shippingInfo.city} 
                 onChange={handleInputChange} 
                 className="border p-2 rounded" 
                 required 
               />
             </div>
             
             {/* Street Address */}
             <div className="mb-4">
               <input 
                 name="streetAddress" 
                 placeholder="Street Address / House Number *" 
                 value={shippingInfo.streetAddress} 
                 onChange={handleInputChange} 
                 className="border p-2 rounded w-full" 
                 required 
               />
             </div>
             
             <h3 className="font-bold mb-3 text-lg mt-6">Select Delivery Location</h3>
             <div className="h-64 mb-6 border rounded overflow-hidden">
                <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker onLocationSelected={handleLocationSelected} />
                  {locationSelected && <Marker position={location} />}
                </MapContainer>
             </div>

             <h3 className="font-bold mb-3 text-lg">Payment Method</h3>
             <div className="space-y-3 mb-6">
                <label className="block p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input type="radio" value="Cash" checked={paymentMethod==="Cash"} onChange={()=>setPaymentMethod("Cash")} className="mr-2"/>
                  Cash on Delivery
                </label>
                <label className="block p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input type="radio" value="Khalti" checked={paymentMethod==="Khalti"} onChange={()=>setPaymentMethod("Khalti")} className="mr-2"/>
                  Pay with Khalti
                </label>
                <label className="block p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input type="radio" value="PayPal" checked={paymentMethod==="PayPal"} onChange={()=>setPaymentMethod("PayPal")} className="mr-2"/>
                  Pay with PayPal
                </label>
             </div>
             
             <button 
               type="submit" 
               disabled={isLoading} 
               className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
             >
               {isLoading ? "Processing..." : "Place Order"}
             </button>
           </form>
        </div>
        
        <div className="md:col-span-1 bg-white p-6 shadow-md rounded-xl h-fit">
           <h3 className="font-bold mb-4">Order Summary</h3>
           <div className="space-y-2 mb-4">
             {selectedProducts.map((item, index) => (
               <div key={index} className="flex justify-between text-sm">
                 <span>{item.name || 'Product'} x {item.quantity}</span>
                 <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
               </div>
             ))}
           </div>
           <div className="flex justify-between text-sm mb-2">
             <span>Delivery Fee</span>
             <span>Rs. {delivery_fee.toFixed(2)}</span>
           </div>
           <div className="flex justify-between font-bold border-t pt-2 text-lg">
             <span>Total</span>
             <span>Rs. {total.toFixed(2)}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;