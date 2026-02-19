import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const BestSeller = () => {
  const { products, productsLoading } = useContext(ShopContext)

  const [bestSeller, setBestSeller] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ Check if product has stock
  const hasStock = (product) => {
    return product?.colors?.some(color =>
      color?.sizes?.some(size => size.stock > 0)
    )
  }

  useEffect(() => {
    if (productsLoading) {
      setLoading(true)
      return
    }

    const bestProducts = (Array.isArray(products) ? products : [])
      .filter(item => item.bestSeller && hasStock(item)) // 🔥 FIX HERE
      .slice(0, 5)

    setBestSeller(bestProducts)
    setLoading(false)
  }, [products, productsLoading])

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'BEST'} text2={'SELLER'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          The pieces every guy is wearing right now. Proven favorites. Proven style.
        </p>
      </div>

      {loading ? (
        <div className='text-center text-gray-400 py-10'>
          Loading best sellers...
        </div>
      ) : bestSeller.length === 0 ? (
        <div className='text-center text-gray-400 py-10'>
          No best sellers available.
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
          {bestSeller.map(item => (
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

export default BestSeller
