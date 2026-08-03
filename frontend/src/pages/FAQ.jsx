import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function FAQ() {
  const faqs = [
    {
      q: "How do I book a ticket on VisioCine?",
      a: "Browse our movies or cinemas, select a showtime, pick your preferred seats, and proceed to checkout to secure your tickets instantly."
    },
    {
      q: "Can I cancel or refund my ticket?",
      a: "Yes, tickets can be cancelled up to 2 hours before the showtime for a full refund minus a small convenience fee."
    },
    {
      q: "How do I get my ticket after booking?",
      a: "Your ticket will be available in your Profile under 'My Bookings'. You will also receive an email with a QR code which you can show at the cinema entrance."
    },
    {
      q: "Do you offer food and beverage booking?",
      a: "Yes! You can pre-book popcorn, drinks, and snacks during the checkout process and have them ready when you arrive."
    },
    {
      q: "What payment methods are accepted?",
      a: "We accept all major credit/debit cards, UPI, digital wallets, and VisioCine Gift Cards."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Header />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto min-h-[80vh]">
        <h1 className="text-4xl md:text-5xl font-display uppercase tracking-widest mb-4">Frequently Asked Questions</h1>
        <div className="w-20 h-1 bg-primary mb-12"></div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-label-md mb-3 text-white/90">{faq.q}</h3>
              <p className="text-white/60 font-body-md leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
