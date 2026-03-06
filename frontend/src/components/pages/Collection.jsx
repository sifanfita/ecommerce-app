import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../../context/ShopContext'
import { assets } from '../../assets/assets'
import Title from '../Title'
import ProductItem from '../ProductItem'
import { ProductGridSkeleton } from '../Skeleton'

function Collection() {
  const { products, search, showSearch, productsLoading, productsError } = useContext(ShopContext)

  const [showFilter, setShowFilter] = useState(false)
  const [filterProducts, setFilterProducts] = useState([])
  const [category, setCategory] = useState([])
  const [sortType, setSortType] = useState('relevant')
  const [loading, setLoading] = useState(true)

  // ✅ Check if product has at least ONE size with stock > 0
  const hasStock = (product) => {
    return product?.colors?.some(color =>
      color?.sizes?.some(size => size.stock > 0)
    )
  }

  const toggleCategory = (e) => {
    const value = e.target.value
    setCategory(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  const applyFilter = () => {
    if (!Array.isArray(products) || products.length === 0) return

    let productsCopy = products
      .filter(product => hasStock(product)) // 🔥 REMOVE ZERO-STOCK PRODUCTS
      .slice()

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item =>
        category.includes(item.category)
      )
    }

    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    let fpCopy = [...filterProducts]

    switch (sortType) {
      case 'low-high':
        fpCopy.sort((a, b) => a.price - b.price)
        break
      case 'high-low':
        fpCopy.sort((a, b) => b.price - a.price)
        break
      default:
        applyFilter()
        return
    }

    setFilterProducts(fpCopy)
  }

  useEffect(() => {
    if (productsLoading) {
      setLoading(true)
      return
    }

    applyFilter()
    setLoading(false)
  }, [products, category, search, showSearch])

  useEffect(() => {
    sortProduct()
  }, [sortType])

  return (
    <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-10 pt-6 sm:pt-8 lg:pt-10 px-3 sm:px-4 max-w-[1600px] mx-auto'>
      
      {/* Left Filters - responsive width, collapsible on mobile */}
      <div className='w-full sm:w-auto sm:min-w-[140px] md:min-w-[180px] lg:min-w-[240px] flex-shrink-0'>
        <p
          onClick={() => setShowFilter(!showFilter)}
          className='my-2 text-base sm:text-lg lg:text-xl flex items-center cursor-pointer gap-2'
        >
          FILTERS
          <img className='h-3 sm:hidden' src={assets.downArrow} alt='' />
        </p>

        <div
          className={`border border-gray-300 pl-4 sm:pl-5 py-3 mt-4 sm:mt-6 ${
            showFilter ? '' : 'hidden'
          } sm:block`}
        >
          <p className='mb-3 text-xs sm:text-sm font-medium'>CATEGORIES</p>

          <div className='flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm font-light text-gray-700'>
            {['T-shirt','Shirt','Trouser','Shoes','Jacket','Tuta'].map(cat => (
              <label key={cat} className='flex gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  value={cat}
                  className='w-3 flex-shrink-0 mt-0.5'
                  onChange={toggleCategory}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right Product List - flex-1 with min-w-0 for grid overflow */}
      <div className='flex-1 min-w-0'>
        <div className='flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className='border-2 border-gray-300 text-xs sm:text-sm px-2 py-1.5 sm:py-2 w-full sm:w-auto max-w-[200px] sm:max-w-none'
          >
            <option value='relevant'>Sort by: Relevant</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-low'>Sort by: High to Low</option>
          </select>
        </div>
        {!showSearch && (
          <p className='text-gray-500 text-xs sm:text-sm mb-3'>Use the search icon in the navbar to search products.</p>
        )}

        {productsError ? (
          <div className="text-center text-red-500 py-10">
            {productsError}
          </div>
        ) : loading ? (
          <ProductGridSkeleton count={12} columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" gapClass="gap-6" />
        ) : filterProducts.length === 0 ? (
          <div className='text-center text-gray-400 py-10 text-sm sm:text-base'>
            No products found.
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {filterProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                name={item.name}
                price={item.price}
                image={item.image[0]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection
