import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'
import RelatedProduct from '../RelatedProduct'
import Loader from '../Loader'
import { toast } from 'react-toastify'
import placeholder from '../../assets/placeholder.jpg'

function Product() {
  const { productId } = useParams()
  const { products, currency, addToCart } = useContext(ShopContext)

  const [productData, setProductData] = useState(null)
  const [mainImage, setMainImage] = useState(placeholder)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  const fetchProductData = () => {
    setLoading(true)
    const product = products.find(item => item._id === productId)
    if (product) {
      setProductData(product)
      setMainImage(product.image?.[0] || placeholder)
    }
    setTimeout(() => setLoading(false), 300)
  }

  useEffect(() => {
    fetchProductData()
  }, [productId, products])

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.warning("Please select both color and size")
      return
    }
    setAddingToCart(true)
    try {
      await addToCart(productData._id, selectedColor, selectedSize);

      toast.success("Product added to cart!")
    } catch (err) {
      toast.error("Failed to add product to cart.")
      console.error(err)
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return <Loader message="Loading product..." className="pt-20" />
  }

  if (!productData) return null

  return (
    <div className='pt-10 transition-opacity ease-in duration-500'>

      {/* Product Section */}
      <div className='flex gap-12 flex-col sm:flex-row'>

        {/* Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll sm:w-[18.7%] w-full'>
            {(productData.image?.length ? productData.image : [placeholder]).map((item, index) => (
              <img
                key={index}
                src={item}
                onClick={() => setMainImage(item)}
                onError={(e) => e.target.src = placeholder}
                className='w-[24%] sm:w-full sm:mb-3 cursor-pointer border'
              />
            ))}
          </div>

          <div className='w-full sm:w-[80%]'>
            <img
              src={mainImage}
              onError={(e) => e.target.src = placeholder}
              className='w-full h-auto border'
            />
          </div>
        </div>

        {/* Product Info */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          {/* Colors */}
          <div className='flex flex-col gap-4 my-4'>
            <p>Select Color</p>
            <div className='flex gap-2'>
              {productData.colors.map((colorObj, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedColor(colorObj.color)
                    setSelectedSize('')
                    setMainImage(colorObj.image?.[0] || productData.image?.[0] || placeholder)
                  }}
                  className={`border py-2 px-4 ${colorObj.color === selectedColor ? 'border-orange-500' : ''}`}
                >
                  {colorObj.color}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          {selectedColor && (() => {
            const colorObj = productData.colors.find(c => c.color === selectedColor)
            const sizes = colorObj?.sizes ?? []
            const inStockSizes = sizes.filter(s => s.stock > 0)
            const selectedSizeStock = sizes.find(s => s.size === selectedSize)?.stock ?? 0
            return (
              <div className='flex flex-col gap-4 my-4'>
                <p>Select Size</p>
                <div className='flex gap-2 flex-wrap'>
                  {sizes.map((sizeObj, index) => {
                    const outOfStock = sizeObj.stock === 0
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !outOfStock && setSelectedSize(sizeObj.size)}
                        disabled={outOfStock}
                        className={`border py-2 px-4 ${outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' : 'bg-gray-100 hover:border-orange-400'} ${sizeObj.size === selectedSize ? 'border-orange-500 ring-1 ring-orange-500' : ''}`}
                      >
                        {sizeObj.size} {outOfStock ? '(Out of stock)' : `(${sizeObj.stock})`}
                      </button>
                    )
                  })}
                </div>
                {inStockSizes.length === 0 && (
                  <p className="text-amber-600 text-sm font-medium">This color is currently out of stock.</p>
                )}
              </div>
            )
          })()}

          {/* Add To Cart */}
          {(() => {
            const colorObj = productData.colors?.find(c => c.color === selectedColor)
            const selectedSizeStock = colorObj?.sizes?.find(s => s.size === selectedSize)?.stock ?? 0
            const canAdd = selectedColor && selectedSize && selectedSizeStock > 0 && !addingToCart
            const label = addingToCart ? 'Adding...' : (selectedSize && selectedSizeStock === 0 ? 'Out of stock' : 'ADD TO CART')
            return (
              <button
                onClick={handleAddToCart}
                disabled={!canAdd}
                className='bg-black text-white px-8 py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {label}
                {addingToCart && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" aria-hidden />}
              </button>
            )
          })()}

          <hr className='mt-7 sm:w-4/5' />

          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Easy return and exchange within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
        </div>
        <div className='border px-6 text-sm text-gray-500'>
          <p className='py-5'>{productData.description}</p>
        </div>
      </div>

      <RelatedProduct category={productData.category} />
    </div>
  )
}

export default Product
