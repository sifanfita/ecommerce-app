import React, { useEffect, useState, useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const RelatedProduct = ({ category }) => {
  const { products, productsLoading } = useContext(ShopContext)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)  // 👈 NEW

  useEffect(() => {
    if (productsLoading) {
      setLoading(true)
      return
    }

    const filtered = (Array.isArray(products) ? products : []).filter(item => item.category === category)
    setRelated(filtered.slice(0, 5))
    setLoading(false)
  }, [products, productsLoading, category])

  return (
    <div className='my-24'>
      <div className='text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">
          Loading related products...
        </div>
      ) : related.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          No related products found.
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
          {related.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              name={item.name}
              image={item.image[0]}
              price={item.price}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RelatedProduct
