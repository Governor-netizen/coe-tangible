import { AnimatePresence, motion, useAnimation } from "framer-motion";

interface AuthModalProps {
  visible: boolean;
  controls?: ReturnType<typeof useAnimation>;
}

export function AuthModal({ visible, controls }: AuthModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, x: 120 }}
          animate={controls ?? { opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.92, x: 24 }}
          transition={{ duration: 0.55, type: "spring", stiffness: 140, damping: 16 }}
          style={{ transformOrigin: "left center" }}
          className="w-[92vw] max-w-[430px] bg-surface-container border border-outline-variant/30 shadow-[0_24px_50px_rgba(0,0,0,0.32)] p-6 md:p-8 will-change-transform"
        >
          <div className="mb-6">
            <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Engineer Access</p>
            <h2 className="font-headline text-3xl text-on-surface">Sign In</h2>
            <p className="text-on-surface-variant text-sm mt-2">Continue to your machine lab dashboard.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Email</label>
              <input
                type="email"
                placeholder="engineer@lab.com"
                className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-container text-on-primary-container px-4 py-3 font-label text-xs tracking-widest uppercase hover:bg-opacity-90 transition-colors"
            >
              Access Dashboard
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
