import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";

const tools = [
  {
    title: "Video Idea Generator",
    desc: "Generate endless high-potential video concepts for your niche.",
    route: "/video-idea-generator",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Script Generator",
    desc: "Turn your ideas into engaging, ready-to-record scripts.",
    route: "/script-generator",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    title: "Title Generator",
    desc: "Craft irresistible video titles that boost your CTR.",
    route: "/title-suggestor",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
  },
  {
    title: "Description Generator",
    desc: "Write optimized video descriptions in seconds.",
    route: "/seo-description",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8" />
      </svg>
    ),
  },
  {
    title: "Hashtag Finder",
    desc: "Find trending hashtags to maximize your reach.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10M7 17h10" />
      </svg>
    ),
  },
  {
    title: "Thumbnail Idea Generator",
    desc: "Get creative thumbnail concepts that grab attention.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    title: "Trending Video Finder",
    desc: "Discover what's trending in your niche right now.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" />
      </svg>
    ),
  },
  {
    title: "Content Calendar",
    desc: "Plan your uploads and stay consistent with ease.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    title: "SEO Optimizer",
    desc: "Optimize your content for search and discovery.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: "Audience Analyzer",
    desc: "Understand your viewers and tailor your content.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      </svg>
    ),
  },
  {
    title: "Collaboration Finder",
    desc: "Find creators to collaborate with in your space.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l4 4m-4-4l-4-4" />
      </svg>
    ),
  },
  {
    title: "Content Repurposer",
    desc: "Turn one video into multiple pieces of content.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h8v8H8z" />
      </svg>
    ),
  },
  {
    title: "Comment Responder",
    desc: "Reply to comments with smart, engaging responses.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    title: "Analytics Dashboard",
    desc: "Track your growth and see what's working.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6M15 17V7" />
      </svg>
    ),
  },
  {
    title: "Idea Organizer",
    desc: "Save and organize your best ideas for later.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
      </svg>
    ),
  },
  {
    title: "Content Brief Generator",
    desc: "Create detailed briefs for your next big project.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h8M8 12h8M8 16h8" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name ?? Cookies.get("user_name") ?? "";

  return (
    <div className="text-gray-800 font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="text-2xl font-bold text-gray-900">CreatorSuite</a>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#tools" className="text-gray-600 hover:text-gray-900 transition-colors">Tools</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {displayName && (
              <span className="text-sm font-medium text-gray-600">{displayName}</span>
            )}
            <button
              onClick={logout}
              className="bg-gray-900 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle mobile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-2">
            <a href="#tools" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>Tools</a>
            <a href="#testimonials" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            <a href="#pricing" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              {displayName && <span className="text-sm text-gray-500">{displayName}</span>}
              <button onClick={logout} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 sm:py-24 lg:py-32" style={{ backgroundColor: "#f9fafb", backgroundImage: "radial-gradient(circle at top, white, #f9fafb 80%)" }}>
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tighter">
              Your All-in-One Toolkit for <br className="hidden md:inline" />
              Content That Connects.
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600">
              Stop the guesswork. Beat creative block, streamline your workflow, and grow your audience with 16 powerful tools designed for the modern creator.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <a href="#tools" className="w-full sm:w-auto bg-gray-900 text-white font-semibold py-4 px-8 rounded-lg hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Explore All 16 Tools →
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">A single, one-time payment. Lifetime access.</p>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">The Creator's Suite: 16 Tools to Elevate Your Content.</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Everything you need, from initial spark to final publish. All in one place.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {tools.map((tool, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(tool.route || "/work-in-progress")}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(tool.route || "/work-in-progress");
                    }
                  }}
                >
                  <div className="bg-indigo-100 text-indigo-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    {tool.icon}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{tool.title}</h3>
                  <p className="text-gray-600 mt-2 text-sm">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 sm:py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Creators Are Saying</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <p className="text-gray-600 italic">"This toolkit took the guesswork out of starting my channel. The Idea and Script generators are lifesavers. I went from posting once a month to once a week, consistently."</p>
                <div className="mt-6 flex items-center">
                  <img className="h-12 w-12 rounded-full object-cover" src="https://placehold.co/100x100/E2E8F0/4A5568?text=AR" alt="Alex R." />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Alex R.</p>
                    <p className="text-gray-500">10k Subscribers</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
                <p className="text-gray-600 italic">"I was hitting a creative wall after years on the platform. The Trending Video Finder and Title Generator gave me the edge I needed to get my growth back on track."</p>
                <div className="mt-6 flex items-center">
                  <img className="h-12 w-12 rounded-full object-cover" src="https://placehold.co/100x100/E2E8F0/4A5568?text=MS" alt="Maria S." />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Maria S.</p>
                    <p className="text-gray-500">500k Subscribers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border-2 border-gray-900 overflow-hidden">
              <div className="p-8 md:p-10 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Get Lifetime Access Today.</h2>
                <p className="mt-2 text-gray-600">One single purchase. All 16 tools, forever. No subscriptions, no hidden fees.</p>
                <div className="my-8">
                  <span className="text-6xl font-extrabold text-gray-900">$99</span>
                  <span className="text-xl font-medium text-gray-500 line-through ml-2">$249</span>
                </div>
                <a href="#" className="w-full block bg-gray-900 text-white font-semibold py-4 px-8 rounded-lg hover:bg-gray-700 transition-all shadow-lg">
                  I want this!
                </a>
              </div>
              <div className="bg-gray-50 p-8 border-t border-gray-200">
                <ul className="space-y-4">
                  {[
                    "Lifetime access to all 16 tools",
                    "All future tool updates, free",
                    "One-time secure payment",
                    "14-day money-back guarantee",
                  ].map((item) => (
                    <li key={item} className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} CreatorSuite. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
