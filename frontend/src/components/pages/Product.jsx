import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'
import { assets } from '../../assets/assets'
import RelatedProduct from '../RelatedProduct'


function Product() {

  const {productId} = useParams();
  const {products, currency, addToCart} = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id == productId){
        setProductData(item);
        setImage(item.image[0]);
        
        return null;
      }
    })

  }

  useEffect(() =>{
    fetchProductData();
  }, [productId])

  
  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* Product Details Section */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Product Images Section */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row '>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((item, index) => (
              <img onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'/>
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img src={image} className='w-full h-auto' />
          </div>
        </div>
        {/* Product Info Section */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) =>(
                <button onClick={() => setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
              ))}

            </div>

          </div>
          <button onClick={() => addToCart(productData._id, size)} className='bg-black text-white px-8 py-3 active:bg-gray-700'>ADD TO CART</button>
          <hr className='mt-7 sm:w-4/5'/>
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            
            <p>Easy return and excahange policy within 7 days.</p>
          </div>
          
        </div>
        

      </div>
      {/* description and review section */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          
        </div>
        <div className='flex flex-col gap-4 border px-6 text-sm text-gray-500 '>
          <p className='py-5'>An e-commerce website is an online platform where businesses or individuals sell products or services directly over the internet, acting as a digital marketplace for transactions.</p>
          <p className='py-5'>An e-commerce website is an online platform where businesses or individuals sell products or services directly over the internet, acting as a digital marketplace for transactions.</p>

        </div>

      </div>

      <RelatedProduct category={productData.category}/>
     
      

    </div>
  ) : <div className='opacity-0'></div>
}

export default Product