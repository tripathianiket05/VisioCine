import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Header />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1000px] mx-auto min-h-[80vh]">
        <h1 className="text-4xl md:text-5xl font-display uppercase tracking-widest mb-4">Terms of Service</h1>
        <div className="w-20 h-1 bg-primary mb-12"></div>
        
        <div className="space-y-8 text-white/70 font-body-md leading-relaxed">
          <section>
            <h2 className="text-2xl font-label-md text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the VisioCine platform, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-label-md text-white mb-4">2. Ticketing Policy</h2>
            <p>All ticket sales are final unless otherwise stated in our refund policy. You must present a valid QR code or booking ID at the cinema. VisioCine is not responsible for lost or stolen tickets. Age restrictions apply to certain films; valid ID may be required.</p>
          </section>

          <section>
            <h2 className="text-2xl font-label-md text-white mb-4">3. User Conduct</h2>
            <p>You agree not to use the service for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws). Exploitation of the platform's booking systems or use of automated bots is strictly prohibited.</p>
          </section>

          <section>
            <h2 className="text-2xl font-label-md text-white mb-4">4. Modifications to Service</h2>
            <p>VisioCine reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
