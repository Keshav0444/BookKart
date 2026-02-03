import React from 'react'

const page = () => {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          📚 Welcome to BookKart
        </h1>

        {/* Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Overview
          </h2>
          <p className="text-gray-600 leading-relaxed">
            BookKart is an online platform that enables users to buy and sell
            used and old books in a simple, affordable, and eco-friendly way.
            The platform connects book lovers, students, and sellers, allowing
            books to be reused instead of wasted while making knowledge
            accessible at lower costs.
          </p>
        </section>

        {/* How it works */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            How BookKart Works
          </h2>

          <div className="space-y-4 text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">
                1. User Registration & Login:
              </span>{" "}
              Users sign up on BookKart using their email or mobile number.
              Once logged in, users can act as both buyers and sellers on the
              platform.
            </p>

            <p>
              <span className="font-semibold text-gray-800">
                2. Selling Used Books:
              </span>{" "}
              Sellers list their books by entering details such as book title,
              author, condition, and price. The listed books become visible to
              all users on the platform.
            </p>

            <p>
              <span className="font-semibold text-gray-800">
                3. Browsing & Searching:
              </span>{" "}
              Buyers can browse available books, search by title or author, and
              filter based on price or category to easily find the books they
              need.
            </p>

            <p>
              <span className="font-semibold text-gray-800">
                4. Buying Books:
              </span>{" "}
              Buyers select a book and place an order. Once the purchase is
              confirmed, the book is marked as sold and removed from the active
              listings.
            </p>

            <p>
              <span className="font-semibold text-gray-800">
                5. Payment & Delivery:
              </span>{" "}
              Payments are processed securely through online payment methods.
              Books are delivered via courier services or through direct pickup
              based on the seller’s preference.
            </p>
            
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Key Benefits of BookKart
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Affordable books for students and readers</li>
            <li>Earn money by selling unused books</li>
            <li>Eco-friendly and sustainable reading</li>
            <li>Easy-to-use and secure platform</li>
            <li>Community-driven book exchange</li>
          </ul>
        </section>

        {/* Purpose */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Purpose of BookKart
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The main purpose of BookKart is to promote affordable education,
            reduce book wastage, and encourage sustainable learning. By allowing
            users to resell books after use, BookKart creates a circular economy
            where books continue to benefit multiple readers.
          </p>
        </section>

      </div>
    </main>
  )
}

export default page