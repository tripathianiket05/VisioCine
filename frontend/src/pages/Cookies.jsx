import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Cookies() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <Header />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[800px] mx-auto min-h-[80vh]">
        <h1 className="text-4xl md:text-5xl font-display uppercase tracking-widest mb-4">Cookie Preferences</h1>
        <div className="w-20 h-1 bg-primary mb-12"></div>
        
        <p className="text-white/60 font-body-md mb-8">
          We use cookies to improve your experience on VisioCine. Manage your preferences below to control what information we can collect and use.
        </p>

        <div className="space-y-6 mb-10">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
            <input type="checkbox" checked disabled className="mt-1 w-5 h-5 accent-primary opacity-50 cursor-not-allowed" />
            <div>
              <h3 className="text-xl font-label-md text-white mb-2">Essential Cookies (Required)</h3>
              <p className="text-white/50 text-sm">These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:border-primary/30 transition-colors">
            <input 
              type="checkbox" 
              checked={preferences.analytics} 
              onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
              className="mt-1 w-5 h-5 accent-primary cursor-pointer" 
            />
            <div>
              <h3 className="text-xl font-label-md text-white mb-2">Analytics Cookies</h3>
              <p className="text-white/50 text-sm">Help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:border-primary/30 transition-colors">
            <input 
              type="checkbox" 
              checked={preferences.marketing} 
              onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
              className="mt-1 w-5 h-5 accent-primary cursor-pointer" 
            />
            <div>
              <h3 className="text-xl font-label-md text-white mb-2">Marketing Cookies</h3>
              <p className="text-white/50 text-sm">Used to track visitors across websites to display relevant advertisements tailored to your interests.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="bg-primary hover:bg-rose-600 text-white font-label-md px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
            Save Preferences
          </button>
          {saved && <span className="text-green-400 font-label-md animate-fade-in">Preferences saved successfully!</span>}
        </div>

      </main>
      <Footer />
    </div>
  );
}
