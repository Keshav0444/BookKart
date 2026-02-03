import React from 'react'

const page = () => {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-700">
            📖 BookKart Blog
          </h1>
          <p className="text-gray-600 mt-2">
            Insights, tips, and stories from the world of used books
          </p>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Blog 1 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Why Buying Used Books is a Smart Choice
            </h2>
            <p className="text-gray-600 mb-4">
              Used books are affordable, eco-friendly, and often just as good as
              new ones. Learn why choosing pre-owned books benefits both your
              wallet and the environment.
            </p>
            <span className="text-sm text-gray-500">
              Posted on Jan 10, 2026
            </span>
          </div>

          {/* Blog 2 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              How to Sell Your Old Books on BookKart
            </h2>
            <p className="text-gray-600 mb-4">
              Have unused books at home? This guide explains how you can list,
              price, and sell your old books easily on BookKart.
            </p>
            <span className="text-sm text-gray-500">
              Posted on Jan 5, 2026
            </span>
          </div>

          {/* Blog 3 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Sustainable Reading: Reduce, Reuse, Read
            </h2>
            <p className="text-gray-600 mb-4">
              Discover how reusing books contributes to sustainability and helps
              reduce paper waste while spreading knowledge.
            </p>
            <span className="text-sm text-gray-500">
              Posted on Dec 28, 2025
            </span>
          </div>

          {/* Blog 4 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Best Books for Students at Low Cost
            </h2>
            <p className="text-gray-600 mb-4">
              Explore a list of must-have academic and competitive exam books
              available at affordable prices on BookKart.
            </p>
            <span className="text-sm text-gray-500">
              Posted on Dec 20, 2025
            </span>
          </div>

          {/* Blog 5 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              How BookKart Helps Students Save Money
            </h2>
            <p className="text-gray-600 mb-4">
              Learn how BookKart enables students to buy textbooks at lower
              prices and even earn money by reselling them.
            </p>
            <span className="text-sm text-gray-500">
              Posted on Dec 10, 2025
            </span>
          </div>

          {/* Blog 6 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-transform transform hover:scale-105">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              The Future of Second-Hand Book Marketplaces
            </h2>
            <p className="text-gray-600 mb-4">
              Online platforms like BookKart are transforming how people buy and
              sell books. Here’s what the future looks like.
            </p>
            <span className="text-sm text-gray-500">
              Posted on Nov 30, 2025
            </span>
          </div>

        </div>
      </div>
    </main>
  )
}

export default page