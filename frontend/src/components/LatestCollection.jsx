import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const LatestCollection = () => {
  const { products } = useContext(ShopContext)

  const [latestProducts, setLatestProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ Check if product has available stock
  const hasStock = (product) => {
    return product?.colors?.some(color =>
      color?.sizes?.some(size => size.stock > 0)
    )
  }

  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setLoading(true)
      return 
    }

    const availableProducts = products
      .filter(item => hasStock(item)) // 🔥 FIX HERE
      .slice(0, 10)

    setLatestProducts(availableProducts)
    setLoading(false)
  }, [products])

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTIONS'} />
        <p className='text-gray-700 text-xs sm:text-sm md:text-base'>
          Bold Style, Real Quality
        </p>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover the latest collections curated just for men who know what they want.
          From sharp coats and premium tees to standout accessories — everything you need to own your look.
          Shop now and step up your game.
        </p>
      </div>

      {loading ? (
        <div className='text-center text-gray-400 py-10'>
          Loading latest collection...
        </div>
      ) : latestProducts.length === 0 ? (
        <div className='text-center text-gray-400 py-10'>
          No products available.
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
          {latestProducts.map(item => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image[0]}
              name={item.name}
              price={item.price}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default LatestCollection
