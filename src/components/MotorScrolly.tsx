import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  {
    title: "Understand Machines.",
    desc: "Dive into the architecture of motion through high-fidelity visualization.",
    color: "text-white",
  },
  {
    title: "Electromagnetic Core.",
    desc: "The high-density copper armature rotates within a calibrated magnetic stator.",
    color: "text-white",
  },
  {
    title: "Precision Components.",
    desc: "From carbon brushes to neodymium magnets, every part is engineered for torque.",
    color: "text-white",
  },
  {
    title: "Beyond the Surface.",
    desc: "Explore our full library of interactive 3D machines below.",
    color: "text-[#0057FF]",
    hasLine: true,
  },
];

export default function MotorScrolly() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4500); // loops every 4.5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full bg-[#050505] overflow-hidden flex items-center justify-center">
      {/* Background GIF */}
      <img
        src="/motor.gif"
        alt="DC motor animation"
        className="absolute inset-0 z-0 w-full h-full object-cover mix-blend-screen opacity-90"
        draggable={false}
      />

      {/* Foreground Container for Texts */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end md:justify-center p-8 pointer-events-none pb-32 md:pb-8">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            className="absolute text-center flex flex-col items-center"
          >
            {/* Primary line: enters left-to-right, exits right-to-left */}
            <motion.h2
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className={`text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-4 font-headline uppercase [text-shadow:_0_1px_8px_rgba(0,0,0,0.5)] ${messages[currentIndex].color}`}
            >
              {messages[currentIndex].title}
            </motion.h2>

            {/* Secondary line: enters upward from right, exits downward to right */}
            <motion.p
              initial={{ x: 80, y: 60, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ x: 80, y: 60, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="text-white/80 text-lg md:text-xl max-w-2xl font-serif-body mb-8 [text-shadow:_0_1px_6px_rgba(0,0,0,0.4)]"
            >
              {messages[currentIndex].desc}
            </motion.p>

            {messages[currentIndex].hasLine && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="h-1 w-32 bg-[#0057FF] mx-auto rounded-full blur-[1px] shadow-[0_0_15px_#0057FF]"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
