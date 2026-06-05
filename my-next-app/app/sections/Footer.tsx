"use client";

export default function Footer() {
  return (
    <footer className="py-16 bg-black border-t border-purple-500/20 relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Column 1 - Logo & About */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">TelecloudX</span>
            </a>
            <p className="text-sm text-gray-500 mb-4">
              Next-generation cloud infrastructure and telecom analytics powered by AI.
            </p>
            <p className="text-sm text-gray-600">hello@telecloudx.io</p>
          </div>

          {/* Column 2 - Services */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Cloud Infrastructure</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Telecom Analytics</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">AI Insights</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Security Dashboard</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Real-Time Metrics</a></li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Press Kit</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Sales</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Status Page</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">API Reference</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#222]">
          <p className="text-sm text-gray-600">© 2025 TelecloudX. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="w-9 h-9 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-gray-500 hover:text-white hover:border-purple-500/30 transition-all duration-300" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-gray-500 hover:text-white hover:border-purple-500/30 transition-all duration-300" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-gray-500 hover:text-white hover:border-purple-500/30 transition-all duration-300" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-gray-500 hover:text-white hover:border-purple-500/30 transition-all duration-300" aria-label="Discord">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
