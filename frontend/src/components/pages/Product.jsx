import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'
import RelatedProduct from '../RelatedProduct'
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
      toast.warning("Please select color and size")
      return
    }

    setAddingToCart(true)
    try {
      await addToCart(productData._id, selectedColor, selectedSize)
      toast.success("Product added to cart!")
    } catch (err) {
      toast.error("Failed to add product to cart.")
      console.error(err)
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return <div className="pt-20 text-center text-gray-400">Loading product...</div>
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
          {selectedColor && (
            <div className='flex flex-col gap-4 my-4'>
              <p>Select Size</p>
              <div className='flex gap-2 flex-wrap'>
                {productData.colors.find(c => c.color === selectedColor).sizes.map((sizeObj, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(sizeObj.size)}
                    className={`border py-2 px-4 bg-gray-100 ${sizeObj.size === selectedSize ? 'border-orange-500' : ''}`}
                  >
                    {sizeObj.size} ({sizeObj.stock})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add To Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize || addingToCart}
            className='bg-black text-white px-8 py-3 mt-4 disabled:opacity-50 flex items-center gap-2'
          >
            {addingToCart ? "Adding..." : "ADD TO CART"}
            {addingToCart && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>}
          </button>

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
