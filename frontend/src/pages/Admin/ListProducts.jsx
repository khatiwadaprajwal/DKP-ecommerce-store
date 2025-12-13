import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from "@heroicons/react/24/outline";
import api from "../../config/api"; // ✅ Use centralized API

const ListProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Modal & Edit States
  const [showProductDetails, setShowProductDetails] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // ✅ Define Backend URL locally for Image Helper (since we removed it from Context)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  // ✅ SMART IMAGE HELPER FUNCTION
  const getImageUrl = (imgPath) => {
    if (!imgPath) return "";
    
    if (imgPath.startsWith("http") || imgPath.startsWith("https")) {
      return imgPath;
    }
    
    // Ensure we don't double slashes
    const baseUrl = BACKEND_URL.replace(/\/$/, "");
    const path = imgPath.replace(/^\//, "");
    
    return `${baseUrl}/public/${path}`;
  };

  const categoryOptions = ["All", "Formal", "Casual", "Ethnic"];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // ✅ api.get automatically uses BaseURL
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
        // ✅ No manual headers needed. Interceptor handles Token.
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
        // ✅ No manual headers, cleaned up URL
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

  const updateProductStatus = async (productId, newStatus) => {
    const productToUpdate = products.find((p) => p._id === productId);
    if (!productToUpdate) return;

    const updatedProduct = {
      ...productToUpdate,
      status: newStatus,
    };

    try {
      // ✅ No manual headers, cleaned up URL
      await api.put(`/v1/product/${productId}`, updatedProduct);

      setProducts(
        products.map((product) =>
          product._id === productId
            ? { ...product, status: newStatus }
            : product
        )
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("Failed to update product status!");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "" ||
      selectedCategory === "All" ||
      product.category === selectedCategory;

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

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Formal": return "bg-blue-100 text-blue-800";
      case "Casual": return "bg-green-100 text-green-800";
      case "Ethnic": return "bg-yellow-100 text-yellow-800";
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Link
          to="/admin/addProduct"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
        >
          Add New Product
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No products found
                  </td>
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
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/placeholder.jpg";
                                  }}
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {product.productName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: #
                                {product._id.substring(product._id.length - 6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getCategoryBadgeClass(
                              product.category
                            )}`}
                          >
                            {product.category}
                          </span>
                          {product.gender && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              {product.gender}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          Rs.{product.price.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.totalQuantity} units available
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                setShowProductDetails(
                                  showProductDetails === product._id
                                    ? null
                                    : product._id
                                )
                              }
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {showProductDetails === product._id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium text-sm mb-2">
                                  Product Information
                                </h4>
                                <p className="text-sm">
                                  <span className="font-medium">Name:</span>{" "}
                                  {product.productName}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">ID:</span>{" "}
                                  {product._id}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Category:</span>{" "}
                                  {product.category}
                                </p>
                                {product.gender && (
                                  <p className="text-sm">
                                    <span className="font-medium">Gender:</span>{" "}
                                    {product.gender}
                                  </p>
                                )}
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Description:
                                  </span>{" "}
                                  {product.description}
                                </p>
                                {product.averageRating > 0 && (
                                  <p className="text-sm">
                                    <span className="font-medium">Rating:</span>{" "}
                                    {product.averageRating.toFixed(1)}/5
                                  </p>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-sm mb-2">
                                  Inventory Details
                                </h4>
                                <p className="text-sm">
                                  <span className="font-medium">Price:</span>{" "}
                                  Rs.{product.price.toFixed(0)}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Available Stock:
                                  </span>{" "}
                                  {product.totalQuantity}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Total Sold:
                                  </span>{" "}
                                  {product.totalSold}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Status:</span>{" "}
                                  {status}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm mb-2">
                                  Product Images
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {product.images &&
                                  product.images.length > 0 ? (
                                    product.images.map((img, index) => (
                                      <div
                                        key={index}
                                        className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden"
                                      >
                                        <img
                                          src={getImageUrl(img)}
                                          alt={`${product.productName} ${index}`}
                                          className="h-16 w-16 object-cover"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                              "/images/placeholder.jpg";
                                          }}
                                        />
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      No images available
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Variants Section */}
                            <div className="mb-4">
                              <h4 className="font-medium text-sm mb-2">
                                Product Variants
                              </h4>
                              {product.variants && product.variants.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Color
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Size
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Available Quantity
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {product.variants.map((variant, index) => (
                                        <tr key={index}>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            <div 
                                              className="w-4 h-4 rounded-full inline-block mr-2" 
                                              style={{ backgroundColor: variant.color }}
                                            ></div>
                                            {variant.color}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            {variant.size}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            {variant.quantity}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  No variants available
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Quick Actions
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                                >
                                  Edit All Details
                                </button>
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
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editingProduct.productName}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      productName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions
                    .filter((cat) => cat !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={editingProduct.gender || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      gender: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {genderOptions.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Sold
                </label>
                <input
                  type="number"
                  value={editingProduct.totalSold}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      totalSold: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editingProduct.averageRating || 0}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      averageRating: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Product Images Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editingProduct.images && editingProduct.images.length > 0 ? (
                  editingProduct.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative h-16 w-16 bg-gray-200 rounded-md overflow-hidden group"
                    >
                      <img
                        src={`${backend_url}/public/${img}`}
                        alt={`${editingProduct.productName} ${index}`}
                        className="h-16 w-16 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/placeholder.jpg";
                        }}
                      />
                      <button
                        className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                        onClick={() => {
                          const updatedImages = [...editingProduct.images];
                          updatedImages.splice(index, 1);
                          setEditingProduct({
                            ...editingProduct,
                            images: updatedImages,
                          });
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    No images available
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  id="product-image"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      // Create a FormData object to send the file
                      const formData = new FormData();
                      formData.append("productImage", e.target.files[0]);

                      // Upload the image using axios
                      axios
                        .post(
                          `${backend_url}/v1/upload-product-image`,
                          formData,
                          {
                            headers: {
                              "Content-Type": "multipart/form-data",
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        )
                        .then((response) => {
                          // Add the new image to the product's images array
                          const newImages = editingProduct.images
                            ? [...editingProduct.images, response.data.filename]
                            : [response.data.filename];
                          setEditingProduct({
                            ...editingProduct,
                            images: newImages,
                          });
                          // Reset the file input
                          e.target.value = "";
                        })
                        .catch((error) => {
                          console.error("Error uploading image:", error);
                          alert("Failed to upload image!");
                        });
                    }
                  }}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500">
                  Upload new product images here. Images will be automatically
                  saved.
                </p>
              </div>
            </div>

            {/* Product Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={editingProduct.description || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Product Variants Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Variants
                </label>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-2 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600 flex items-center"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Add Variant
                </button>
              </div>
              {editingProduct.variants && editingProduct.variants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Color
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {editingProduct.variants.map((variant, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              value={variant.color}
                              onChange={(e) => updateVariant(index, 'color', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <select
                              value={variant.size}
                              onChange={(e) => updateVariant(index, 'size', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            >
                              <option value="">Select Size</option>
                              {sizeOptions.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              value={variant.quantity}
                              onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <button
                              onClick={() => removeVariant(index)}
                              className="text-red-600 hover:text-red-900"
                              title="Remove Variant"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-500 mb-2">
                  No variants available. Add a variant to get started.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedProduct}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProducts;