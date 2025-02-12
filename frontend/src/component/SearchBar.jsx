import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/Shopcontext'

const searchBar = () => {

    const [search, setSearch, showSearch, setShowSearch] = useContext(ShopContext);

  return showSearch ?(
    <div className='bg-gray-50 text-center'>
      <div className='inline-flex items-center justify-center border-gray-400 px-5 my-5 mx-3 rounded-full w-3/4 sm:w-1/2 '>
            
      </div>
    </div>
  ): null
}

export default searchBar
