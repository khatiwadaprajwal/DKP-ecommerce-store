import React, { useContext } from "react";
import { ShopContext } from "../context/Shopcontext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);
  return (
    <Link className="text-gray-700 cursor-pointer " to={`/product`}>
      <div className="overflow-hidden">
        <img
          className="hover:scale-110 transition ease-in-out max-h-100"
          src={image[0]}
        /> 
      </div>
      <p className="pt-3 pb-1 text-base">{name}</p>
      <p className="text-base font-medium">
        {currency} {price}
      </p>
    </Link>
  );
};

export default ProductItem;
