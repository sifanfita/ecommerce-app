
import React, { useState } from 'react'
import Title from '../Title'
import { assets } from '../../assets/assets'
import { Send } from 'lucide-react'
import { toast } from 'react-toastify'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        'https://formspree.io/f/mrppjale',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
  ...formData,
  _subject: `New Contact Message: ${formData.subject}`
})
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast.success('Your message has been sent successfully!')

        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        toast.error(data.errors?.[0]?.message || 'Failed to send message')
      }

    } catch (error) {
      console.error(error)
      toast.error('Unable to send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-5">

      {/* Page Title */}
      <div className="text-center text-2xl pt-10">
        <Title text1="CONTACT" text2="US" />
        <p className="text-sm text-gray-500 mt-3">
          We'd love to hear from you. Get in touch with us!
        </p>
      </div>

      {/* Store Information */}
      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-16">

        <img
          className="w-full md:max-w-[480px] object-cover rounded-lg"
          src={assets.ContactImage}
          alt="Our store"
        />

        <div className="flex flex-col justify-center items-start gap-5">
          <p className="font-semibold text-xl text-gray-700">
            Our Store
          </p>

          <p className="text-gray-500 leading-7">
            Infront of Hiwot Building, Plaza Market Center
            <br />
            Bishoftu, Oromia, Ethiopia
          </p>

          <div className="text-gray-500 leading-7">
            <p>Tel: 0922249789</p>
            <p>Email: dinko@gmail.com</p>
            <p>Telegram: @DiNkogeb</p>
          </div>

          <div className="text-gray-500 leading-7">
            <p className="font-medium text-gray-700">Business Hours</p>
            <p>Mon - Sat: 9:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-3xl mx-auto mb-28 px-4">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Send Us a Message
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Have a question or need assistance? Fill out the form below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5"
        >

          {/* Name and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                maxLength={100}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                maxLength={254}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What is your message about?"
              required
              maxLength={150}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              rows="6"
              required
              maxLength={3000}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Spam Protection */}
          <input
            type="text"
            name="_gotcha"
            tabIndex="-1"
            autoComplete="off"
           className="absolute -left-[9999px]"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Sending...'
            ) : (
              <>
                <Send size={18} />
                Send Message
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  )
}

export default Contact
