import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from "@heroicons/react/24/outline";
import api from "../../config/api"; 

const ListProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Modal & Edit States
  const [showProductDetails, setShowProductDetails] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  // Define options that were missing in your code
  const categoryOptions = ["All", "Formal", "Casual", "Ethnic"];
  const genderOptions = ["Men", "Women", "Kids", "Unisex"];
  const sizeOptions = ["S", "M", "L", "XL", "XXL", "Free Size"];

  // ✅ SMART IMAGE HELPER FUNCTION
  const getImageUrl = (imgPath) => {
    if (!imgPath) return "";
    if (imgPath.startsWith("http") || imgPath.startsWith("https")) {
      return imgPath;
    }
    const baseUrl = BACKEND_URL.replace(/\/$/, "");
    const path = imgPath.replace(/^\//, "");
    return `${baseUrl}/public/${path}`;
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get("/v1/products");
        setProducts(response.data.products);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Delete product by ID
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/v1/product/${id}`);
        setProducts(products.filter((product) => product._id !== id));
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product!");
      }
    }
  };

  const saveEditedProduct = async () => {
    if (editingProduct) {
      try {
        await api.put(`/v1/product/${editingProduct._id}`, editingProduct);
        setProducts(
          products.map((product) =>
            product._id === editingProduct._id ? { ...editingProduct } : product
          )
        );
        setEditingProduct(null);
        alert("Product updated successfully!");
      } catch (error) {
        console.error("Error updating product:", error);
        alert("Failed to update product!");
      }
    }
  };

  // Image Upload Logic for Edit Modal
  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("productImage", e.target.files[0]);

      try {
        const response = await api.post("/v1/upload-product-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        const newImages = editingProduct.images
          ? [...editingProduct.images, response.data.filename]
          : [response.data.filename];
          
        setEditingProduct({
          ...editingProduct,
          images: newImages,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image!");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "" || selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // UI Helpers
  const getProductStatus = (product) => {
    if (product.totalQuantity <= 0) return "Out of Stock";
    if (product.totalQuantity < 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-800";
      case "Low Stock": return "bg-yellow-100 text-yellow-800";
      case "Out of Stock": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Variant Helpers
  const addVariant = () => {
    if (editingProduct) {
      const newVariants = [...(editingProduct.variants || [])];
      newVariants.push({ color: "", size: "", quantity: 0 });
      setEditingProduct({ ...editingProduct, variants: newVariants });
    }
  };

  const removeVariant = (index) => {
    if (editingProduct) {
      const newVariants = [...editingProduct.variants];
      newVariants.splice(index, 1);
      const totalQuantity = newVariants.reduce((sum, variant) => sum + variant.quantity, 0);
      setEditingProduct({ ...editingProduct, variants: newVariants, totalQuantity });
    }
  };

  const updateVariant = (index, field, value) => {
    if (editingProduct) {
      const newVariants = [...editingProduct.variants];
      newVariants[index] = {
        ...newVariants[index],
        [field]: field === 'quantity' ? parseInt(value) || 0 : value
      };
      const totalQuantity = newVariants.reduce((sum, variant) => sum + variant.quantity, 0);
      setEditingProduct({ ...editingProduct, variants: newVariants, totalQuantity });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">Products</h2>
        <Link
          to="/admin/addProduct"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 text-sm md:text-base"
        >
          + Add New
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : (
        <>
          {/* 📱 MOBILE VIEW: CARDS (Visible only on small screens) */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500">No products found</p>
            ) : (
              filteredProducts.map((product) => {
                const status = getProductStatus(product);
                return (
                  <div key={product._id} className="bg-white border rounded-lg p-4 shadow-sm relative">
                    {/* Top Row: Image & Title */}
                    <div className="flex gap-4 mb-3">
                      <div className="h-20 w-20 bg-gray-100 rounded-md flex-shrink-0">
                         {product.images && product.images.length > 0 && (
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.productName}
                              className="h-full w-full object-cover rounded-md"
                              onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                            />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{product.productName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
                            {status}
                          </span>
                          <span className="text-sm text-gray-500">{product.category}</span>
                        </div>
                        <p className="text-blue-600 font-bold mt-1">Rs.{product.price.toFixed(0)}</p>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex justify-between items-center border-t pt-3 mt-2">
                       <span className="text-xs text-gray-500">Qty: {product.totalQuantity}</span>
                       <div className="flex space-x-3">
                          <button 
                            onClick={() => setShowProductDetails(showProductDetails === product._id ? null : product._id)}
                            className="text-indigo-600 p-1"
                          >
                             <EyeIcon className="h-6 w-6" />
                          </button>
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="text-blue-600 p-1"
                          >
                             <PencilIcon className="h-6 w-6" />
                          </button>
                          <button 
                             onClick={() => handleDelete(product._id)}
                             className="text-red-600 p-1"
                          >
                             <TrashIcon className="h-6 w-6" />
                          </button>
                       </div>
                    </div>

                    {/* Mobile Details View */}
                    {showProductDetails === product._id && (
                       <div className="mt-3 pt-3 border-t text-sm bg-gray-50 p-3 rounded">
                          <p><strong>ID:</strong> {product._id}</p>
                          <p><strong>Sold:</strong> {product.totalSold}</p>
                          <p><strong>Description:</strong> {product.description}</p>
                       </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 💻 LAPTOP VIEW: TABLE (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No products found</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getProductStatus(product);
                    return (
                      <React.Fragment key={product._id}>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-md mr-3">
                                {product.images && product.images.length > 0 && (
                                  <img
                                    src={getImageUrl(product.images[0])}
                                    alt={product.productName}
                                    className="h-10 w-10 object-cover rounded-md"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{product.productName}</div>
                                <div className="text-sm text-gray-500">ID: #{product._id.substring(product._id.length - 6)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-800">{product.category}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">Rs.{product.price.toFixed(0)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{product.totalQuantity} units</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(status)}`}>{status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button onClick={() => setShowProductDetails(showProductDetails === product._id ? null : product._id)} className="text-indigo-600 hover:text-indigo-900">
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:text-blue-900">
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                         {showProductDetails === product._id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            {/* Detailed View Logic (Same as before) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium text-sm mb-2">Product Info</h4>
                                <p className="text-sm"><span className="font-medium">Name:</span> {product.productName}</p>
                                <p className="text-sm"><span className="font-medium">Description:</span> {product.description}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm mb-2">Inventory</h4>
                                <p className="text-sm"><span className="font-medium">Stock:</span> {product.totalQuantity}</p>
                                <p className="text-sm"><span className="font-medium">Sold:</span> {product.totalSold}</p>
                              </div>
                              <div>
                                 {/* Image thumbnails code */}
                                 <div className="flex gap-2">
                                   {product.images?.map((img, i) => (
                                     <img key={i} src={getImageUrl(img)} className="w-12 h-12 rounded object-cover" />
                                   ))}
                                 </div>
                              </div>
                            </div>
                            
                            {/* Variants Table in Details */}
                             <div className="mt-4">
                                <h5 className="font-bold text-xs uppercase text-gray-500 mb-2">Variants</h5>
                                <div className="grid grid-cols-3 gap-2 text-sm bg-white p-2 rounded border">
                                   {product.variants?.map((v, i) => (
                                      <div key={i} className="flex flex-col items-center p-2 border rounded">
                                         <div className="w-4 h-4 rounded-full border mb-1" style={{background: v.color}}></div>
                                         <span>{v.size}</span>
                                         <span className="text-xs text-gray-500">Qty: {v.quantity}</span>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit Product Modal (Keep logic same, just ensure responsive width) */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
            
            {/* ... EDIT FORM INPUTS (Used your existing logic with fixed variable names) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                  <label className="text-sm font-medium">Name</label>
                  <input 
                    type="text" 
                    value={editingProduct.productName} 
                    onChange={e => setEditingProduct({...editingProduct, productName: e.target.value})}
                    className="w-full border p-2 rounded" 
                  />
               </div>
               <div>
                  <label className="text-sm font-medium">Price</label>
                  <input 
                    type="number" 
                    value={editingProduct.price} 
                    onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                    className="w-full border p-2 rounded" 
                  />
               </div>
               <div>
                  <label className="text-sm font-medium">Category</label>
                  <select 
                     value={editingProduct.category}
                     onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                     className="w-full border p-2 rounded"
                  >
                     {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-sm font-medium">Gender</label>
                  <select 
                     value={editingProduct.gender || ""}
                     onChange={e => setEditingProduct({...editingProduct, gender: e.target.value})}
                     className="w-full border p-2 rounded"
                  >
                     {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </div>
            </div>

            {/* Image Upload for Edit */}
            <div className="mb-4">
               <label className="block text-sm font-medium mb-1">Images</label>
               <div className="flex gap-2 mb-2 flex-wrap">
                  {editingProduct.images?.map((img, i) => (
                     <div key={i} className="relative w-16 h-16">
                        <img src={getImageUrl(img)} className="w-full h-full object-cover rounded" />
                        <button 
                           onClick={() => {
                              const newImgs = [...editingProduct.images];
                              newImgs.splice(i, 1);
                              setEditingProduct({...editingProduct, images: newImgs});
                           }}
                           className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
                        >
                           <TrashIcon className="w-3 h-3" />
                        </button>
                     </div>
                  ))}
               </div>
               <input type="file" onChange={handleImageUpload} className="text-sm" />
            </div>

            {/* Variants Edit Section */}
            <div className="mb-4 border-t pt-4">
               <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Variants</h4>
                  <button onClick={addVariant} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Add Variant</button>
               </div>
               {editingProduct.variants?.map((v, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                     <input 
                        placeholder="Color" 
                        value={v.color} 
                        onChange={e => updateVariant(i, 'color', e.target.value)} 
                        className="border p-1 w-1/3 text-sm rounded"
                     />
                     <select 
                        value={v.size} 
                        onChange={e => updateVariant(i, 'size', e.target.value)}
                        className="border p-1 w-1/3 text-sm rounded"
                     >
                        <option value="">Size</option>
                        {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                     <input 
                        type="number" 
                        placeholder="Qty" 
                        value={v.quantity} 
                        onChange={e => updateVariant(i, 'quantity', e.target.value)} 
                        className="border p-1 w-1/4 text-sm rounded"
                     />
                     <button onClick={() => removeVariant(i)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button>
                  </div>
               ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
               <button onClick={() => setEditingProduct(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
               <button onClick={saveEditedProduct} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProducts;