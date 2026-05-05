import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import "./Auth.css";

export default function Auth() {
  const circleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const circleContainer = circleContainerRef.current;
    if (!circleContainer) return;

    const numBars = 50;
    let activeBars = 0;

    // Create bars
    for (let i = 0; i < numBars; i++) {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.transform = `rotate(${(360 / numBars) * i}deg) translateY(-170px)`;
      circleContainer.appendChild(bar);
    }

    const interval = setInterval(() => {
      const bars = circleContainer.querySelectorAll(".bar");
      if (bars.length === 0) return;

      bars[activeBars % numBars].classList.add("active");

      if (activeBars > 8) {
        bars[(activeBars - 8) % numBars].classList.remove("active");
      }

      activeBars++;
    }, 100);

    return () => {
      clearInterval(interval);
      if (circleContainer) {
        circleContainer.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="auth-page-wrapper">
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-2 text-xs font-label tracking-widest uppercase text-white hover:bg-white/20 transition-colors backdrop-blur-md rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          Back To Landing
        </Link>
      </div>

      <div className="container">
        <div className="circle-container" ref={circleContainerRef}></div>

        <div className="login-box">
          <h2>Login</h2>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <input type="email" placeholder="Email" required />
              <span className="input-icon">
                <Mail className="w-4 h-4 text-white" />
              </span>
            </div>

            <div className="input-group">
              <input type="password" placeholder="Password" required />
              <span className="input-icon toggle-password">
                <Lock className="w-4 h-4 text-white" />
              </span>
            </div>

            <div className="forgot-password">
              <a href="#">Forgot your password ?</a>
            </div>

            <button type="submit" className="login-btn">
              LOGIN
            </button>
          </form>

          <div className="social-login">
            <p>log in with</p>
            <div className="social-icons">
              <div className="social-icon facebook">f</div>
              <div className="social-icon twitter">𝕏</div>
              <div className="social-icon google">G</div>
            </div>
          </div>

          <div className="signup-link">
            <a href="#">Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
}
