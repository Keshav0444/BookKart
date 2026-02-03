"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            📞 Contact BookKart
          </h1>
          <p className="text-gray-600 mt-2">
            We’d love to hear from you. Reach out anytime!
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Get in Touch
            </h2>
            <p className="text-gray-600 mb-2">
              Have questions about buying or selling books on BookKart?
              Feel free to contact us.
            </p>
            <p className="text-gray-600">
              📧 Email: <span className="font-medium">support@bookkart.com</span>
            </p>
            <p className="text-gray-600">
              📞 Phone: <span className="font-medium">+91 8368192633</span>
            </p>
            <p className="text-gray-600">
              📍 Address: New Delhi, India
            </p>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Send Message
            </button>

            {submitted && (
              <p className="text-green-600 mt-2">
                Your message has been sent successfully!
              </p>
            )}
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} BookKart. All rights reserved.
        </div>

      </div>
    </main>
  );
}