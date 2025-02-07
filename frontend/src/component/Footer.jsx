import React from "react";

const Footer = () => {
  return (
    <div>
      <div className=" flex flex-col sm:grid grid-cols-[3fr_2fr_2fr] gap-10 my-20 mt-25 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <div>
          {/* <img src={assets.logo} className='mb-5 w-32' alt='' /> */}
          <p className="text-4xl mb-2 item-center justify-between">
            <b>DISHYANTA KAPADA PASAL</b>
          </p>
          <p className="w-full md:w-2/3 ">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cupiditate
            ipsum explicabo fuga, velit consequatur laudantium et voluptates
            sequi rem hic quas distinctio. Unde harum in odio ex libero ipsam
            ipsa!
          </p>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">Company</p>
          <ul className="flex flex-col gap-1 text-black">
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div>
          <p className="text-xl  font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 ">
            <li>sdhfkjah</li>
            <li>s,hishfiuwh</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Footer;
