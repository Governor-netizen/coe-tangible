import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../assets/logo.jpeg";
import "./Auth.css";

export default function Auth() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-back-link">
        <Link
          to="/"
          className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs tracking-widest uppercase text-white/70 hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md rounded-lg"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      <div className={`auth-container ${isRightPanelActive ? "right-panel-active" : ""}`}>
        {/* Sign Up Form */}
        <div className="auth-form-container auth-sign-up">
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Create Account</h1>
            <div className="auth-social-container">
              <a href="#" aria-label="Sign up with Google">G</a>
              <a href="#" aria-label="Sign up with GitHub">⌘</a>
              <a href="#" aria-label="Sign up with LinkedIn">in</a>
            </div>
            <span>or use your email for registration</span>
            <input type="text" placeholder="Full Name" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
            <div className="auth-mobile-toggle">
              Already have an account?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsRightPanelActive(false); }}>
                Sign In
              </a>
            </div>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="auth-form-container auth-sign-in">
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Sign In</h1>
            <div className="auth-social-container">
              <a href="#" aria-label="Sign in with Google">G</a>
              <a href="#" aria-label="Sign in with GitHub">⌘</a>
              <a href="#" aria-label="Sign in with LinkedIn">in</a>
            </div>
            <span>or use your account</span>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <a href="#">Forgot your password?</a>
            <button type="submit">Sign In</button>
            <div className="auth-mobile-toggle">
              Don't have an account?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsRightPanelActive(true); }}>
                Sign Up
              </a>
            </div>
          </form>
        </div>

        {/* Overlay */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="auth-overlay-panel auth-overlay-left">
              <img alt="Tangible" src={logo} className="w-12 h-12 object-contain mb-4 opacity-80" />
              <h1>Welcome Back!</h1>
              <p>Sign in to continue exploring interactive 3D machines and deep technical visualizations.</p>
              <button
                className="auth-ghost"
                onClick={() => setIsRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className="auth-overlay-panel auth-overlay-right">
              <img alt="Tangible" src={logo} className="w-12 h-12 object-contain mb-4 opacity-80" />
              <h1>Hello, Engineer!</h1>
              <p>Join Tangible and start your journey into spatial understanding of electrical machines.</p>
              <button
                className="auth-ghost"
                onClick={() => setIsRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
