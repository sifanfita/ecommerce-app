import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgSrc, setImgSrc] = useState(image || assets.placeHolder)

  return (
    <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className='overflow-hidden relative w-48 h-48 bg-gray-200 rounded-lg'>
        
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-300"></div>
        )}

        <img
          className={`w-48 h-48 object-cover transition-transform duration-300 ease-in-out
          ${imgLoaded ? 'opacity-100' : 'opacity-0'} hover:scale-110`}
          src={imgSrc}
          alt={name}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgSrc(assets.placeHolder)}
        />
      </div>

      <p className='pt-3 pb-1 text-sm truncate'>{name}</p>
      <p className='text-sm font-medium'>{currency} {price}</p>
    </Link>
  )
}

export default ProductItem
