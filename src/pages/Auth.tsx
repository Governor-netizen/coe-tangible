import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.jpeg";
import "./Auth.css";

export default function Auth() {
  const navigate = useNavigate();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      alert("Success! Check your email for a confirmation link.");
      setIsRightPanelActive(false); // Switch to login
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      navigate("/"); // Redirect to home on success
    }
    setLoading(false);
  };

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
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            <div className="auth-social-container">
              <a href="#" aria-label="Sign up with Google">G</a>
              <a href="#" aria-label="Sign up with GitHub">⌘</a>
              <a href="#" aria-label="Sign up with LinkedIn">in</a>
            </div>
            <span>or use your email for registration</span>
            {error && isRightPanelActive && <div className="text-red-500 text-sm my-2">{error}</div>}
            <input 
              type="text" 
              placeholder="Full Name" 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
            <div className="auth-mobile-toggle">
              Already have an account?{" "}
              <a href="#" onClick={(e) => { 
                e.preventDefault(); 
                setError(null);
                setIsRightPanelActive(false); 
              }}>
                Sign In
              </a>
            </div>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="auth-form-container auth-sign-in">
          <form onSubmit={handleSignIn}>
            <h1>Sign In</h1>
            <div className="auth-social-container">
              <a href="#" aria-label="Sign in with Google">G</a>
              <a href="#" aria-label="Sign in with GitHub">⌘</a>
              <a href="#" aria-label="Sign in with LinkedIn">in</a>
            </div>
            <span>or use your account</span>
            {error && !isRightPanelActive && <div className="text-red-500 text-sm my-2">{error}</div>}
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <a href="#">Forgot your password?</a>
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <div className="auth-mobile-toggle">
              Don't have an account?{" "}
              <a href="#" onClick={(e) => { 
                e.preventDefault();
                setError(null); 
                setIsRightPanelActive(true); 
              }}>
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
