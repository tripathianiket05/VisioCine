import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Header />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1000px] mx-auto min-h-[80vh]">
        <h1 className="text-4xl md:text-5xl font-display uppercase tracking-widest mb-4">Privacy Policy</h1>
        <div className="w-20 h-1 bg-primary mb-12"></div>
        
        <div className="space-y-8 text-white/70 font-body-md leading-relaxed">
          <section>
            <h2 className="text-2xl font-label-md text-white mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create or modify your account, purchase tickets, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
          </section>

          <section>
            <h2 className="text-2xl font-label-md text-white mb-4">2. Use of Information</h2>
            <p>We use the information we collect about you to provide, maintain, and improve our services, such as to facilitate ticketing, process payments, send receipts, provide products and services you request (and send related information), develop new features, and provide customer support.</p>
          </section>

          <section>
            <h2 className="text-2xl font-label-md text-white mb-4">3. Sharing of Information</h2>
            <p>We may share the information we collect about you with our cinema partners to fulfill your booking requests. We do not sell your personal information to third parties. We may also share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</p>
          </section>

          <section>
            <h2 className="text-2xl font-label-md text-white mb-4">4. Data Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. All payment transactions are encrypted using secure socket layer technology (SSL).</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
