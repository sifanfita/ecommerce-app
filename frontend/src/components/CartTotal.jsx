import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'

const CartTotal = () => {
  const { getCartAmount, currency, delivery_fee } = useContext(ShopContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const amount = getCartAmount()
    if (amount !== undefined && currency && delivery_fee !== undefined) {
      setLoading(false)
    }
  }, [getCartAmount, currency, delivery_fee])

  if (loading) {
    return (
      <div className="w-full text-center py-6 text-gray-400">
        Calculating total...
      </div>
    )
  }

  const subtotal = getCartAmount()
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTAL'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{currency} {subtotal.toFixed(2)}</p>
        </div>

        <hr />

        <div className='flex justify-between'>
          <p>Delivery Fee</p>
          <p>{currency} {delivery_fee.toFixed(2)}</p>
        </div>

        <hr />

        <div className='flex justify-between'>
          <b>Total</b>
          <b>{currency} {total.toFixed(2)}</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal
