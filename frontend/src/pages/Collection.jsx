import React, { useContext, useEffect, useState } from "react";
import { assets, products } from "../assets/assets";
// import { ShopContext } from '../context/Shopcontext'
import ProductItem from "../component/ProductItem";

const Collection = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sortType , setSortType] = useState("Relavent");

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSizes = (e) => {
    if (sizes.includes(e.target.value)) {
      setSizes((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSizes((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () =>{
    
    let productsCopy= products.slice();

    if(category.length > 0){
      productsCopy= productsCopy.filter(item => category.includes(item.category));
    }

    if(sizes.length > 0){
      productsCopy= productsCopy.filter(item => item.sizes.some(size => sizes.includes(size)));
    }
      setFilterProducts(productsCopy)
  }

  const sortProduct = () =>{

   let filterProductCopy = filterProducts.slice()

   switch (sortType){
    case 'low-high':
      setFilterProducts(filterProductCopy.sort((a,b)=>(a.price-b.price)));
      break;

      case 'high-low':
        setFilterProducts(filterProductCopy.sort((a,b)=>(b.price-a.price)));
        break;

        default:
          applyFilter();
          break;
   }
  }

  useEffect(() =>{
      applyFilter()
  },[category, sizes])

  useEffect(()=>{
    sortProduct();
  },[sortType])



  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 pb-8 ">
      {/* filter options */}
      <div className="min-w-90 bg-white px-3 rounded-xl ">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-2xl font-bold flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
          />
        </p>

        {/* Category Filter */}
        <div
          className={`bg-gray-300 pl-5 py-3 mt-6 rounded mb-4 mr-3 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-base font-bold">CATEGORIES</p>
          <div className="flex flex-col gap-3 text-md font-semibold text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Men"}
                onChange={toggleCategory}
              />
              Men
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Women"}
                onChange={toggleCategory}
              />
              Women
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Kids"}
                onChange={toggleCategory}
              />
              Kids
            </p>
          </div>
        </div>
        {/* Sizes */}
        <div
          className={`bg-gray-300 pl-5 py-3 mt-6 rounded mb-4 mr-3 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-base font-bold">SIZES</p>
          <div className="flex flex-colS gap-3 text-md font-semibold text-gray-700 pr-3">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"S"}
                onChange={toggleSizes}
              />
              S
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"M"}
                onChange={toggleSizes}
              />
              M
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"L"}
                onChange={toggleSizes}
              />
              L
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"XL"}
                onChange={toggleSizes}
              />
              XL
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"XXL"}
                onChange={toggleSizes}
              />
              XXL
            </p>
          </div>
        </div>
      </div>
      {/* right side */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <h2 className="my-3 text-3xl font-semibold">ALL COLLECTIONS---</h2>

          {/* sorting products */}
          <div className="flex px-2 items-center justify-center my-3">
            <p className="inline-flex text-sm px-2">Sort By:</p>
            <select onChange={(e)=>setSortType(e.target.value)} className="min-w-30 border-gray-200 shadow text-base font-medium px-3">
              <option value="relavent">Relavent</option>
              <option value="low-high">Low-High</option>
              <option value="high-low">High-Low</option>
            </select>
          </div>
        </div>



        {/* map products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3">
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              name={item.name}
              id={item._id}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
