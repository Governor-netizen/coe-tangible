import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const VISME_FORM_URL = "https://forms.visme.co/formsPlayer/q74edmvw-membership-sign-up-form";

export default function Auth() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f0f0] relative">
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 border border-outline-variant/40 bg-white/95 px-3 py-2 text-xs font-label tracking-widest uppercase text-[#3b3f51] hover:text-[#1a1a2e] hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back To Landing
        </Link>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f0f0f0]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-[#cfd4e3] border-t-[#0057ff] animate-spin" />
            <p className="font-label text-xs tracking-widest uppercase text-[#0057ff]">Loading Sign In Form</p>
          </div>
        </div>
      )}
      <iframe
        src={VISME_FORM_URL}
        title="Membership Sign Up Form"
        className={`w-full h-screen border-0 transition-opacity duration-200 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="clipboard-read; clipboard-write"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
