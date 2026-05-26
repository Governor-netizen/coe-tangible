import { motion } from "framer-motion";

interface StitchSectionProps {
  onMachineSelect?: (machineId: "dc-motor" | "dc-generator" | "transformer" | "induction-motor") => void;
}

export default function StitchSection({ onMachineSelect }: StitchSectionProps) {
  // Fade-in/up motion animation presets for unified premium feel
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="w-full">
      {/* 1. A Scientific Workflow */}
      <section className="py-24 bg-surface-container-lowest overflow-hidden">
        <div className="container mx-auto px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="font-headline text-4xl sm:text-5xl text-center mb-20 text-on-surface"
          >
            A Scientific Workflow
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="relative grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-5xl mx-auto"
          >
            {/* Dashed connector line for desktop */}
            <div className="hidden lg:block absolute top-12 left-0 w-full h-px border-t border-dashed border-secondary/30 -z-0"></div>

            {/* Step 1 */}
            <motion.div variants={fadeInUp} className="relative z-10 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-surface border border-outline-variant flex items-center justify-center mb-8 shadow-sm">
                <span className="material-symbols-outlined text-4xl text-primary">inventory_2</span>
              </div>
              <div className="font-label text-sm tech-tag mb-4">STEP_01</div>
              <h3 className="font-headline text-xl mb-4 text-on-surface">Browse Library</h3>
              <p className="font-serif-body text-sm text-on-surface-variant max-w-xs">
                Select from hundreds of machines mapped to university curricula.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp} className="relative z-10 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-surface border border-outline-variant flex items-center justify-center mb-8 shadow-sm">
                <span className="material-symbols-outlined text-4xl text-primary">view_in_ar</span>
              </div>
              <div className="font-label text-sm tech-tag mb-4">STEP_02</div>
              <h3 className="font-headline text-xl mb-4 text-on-surface">Open 3D</h3>
              <p className="font-serif-body text-sm text-on-surface-variant max-w-xs">
                Manipulate models in real-time. Toggle exploded views and animations.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp} className="relative z-10 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-surface border border-outline-variant flex items-center justify-center mb-8 shadow-sm">
                <span className="material-symbols-outlined text-4xl text-primary">edit_note</span>
              </div>
              <div className="font-label text-sm tech-tag mb-4">STEP_03</div>
              <h3 className="font-headline text-xl mb-4 text-on-surface">Annotate &amp; Study</h3>
              <p className="font-serif-body text-sm text-on-surface-variant max-w-xs">
                Layer technical data and equations directly over the active 3D components.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Interactive Machine Spotlight (Mastering the Transformer) */}
      <section className="py-32 bg-[#0A0C10] border-t border-outline-variant/10 overflow-hidden relative">
        <div className="absolute inset-0 blueprint-grid opacity-10"></div>
        <div className="container mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Content Column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="lg:col-span-5 order-2 lg:order-1"
            >
              <span className="font-label tech-tag text-xs tracking-[0.3em] uppercase block mb-6">
                High-Fidelity Rendering
              </span>
              <h2 className="font-headline text-5xl lg:text-6xl mb-8 leading-tight text-on-surface">
                Mastering the <span className="italic text-primary">Transformer</span>.
              </h2>
              <p className="font-serif-body text-on-surface-variant text-lg leading-relaxed mb-10">
                Navigate the intricate geometry of core-type transformers. Our high-fidelity models expose the physics behind mutual induction, flux distribution, and eddy current losses.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onMachineSelect?.("transformer")}
                  className="bg-primary-container text-white px-8 py-4 font-label text-xs tracking-widest uppercase hover:bg-primary transition-all duration-200 active:scale-95"
                >
                  Launch 3D Explorer
                </button>
                <button
                  className="border border-outline-variant text-on-surface px-8 py-4 font-label text-xs tracking-widest uppercase hover:bg-surface-container-high transition-all duration-200"
                  onClick={() => window.open("/research", "_self")}
                >
                  View Schematic ↗
                </button>
              </div>
            </motion.div>

            {/* Showcase Image Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 order-1 lg:order-2 relative"
            >
              <div className="relative group overflow-hidden border border-outline-variant/20 shadow-2xl rounded-sm">
                <img
                  alt="Single-Phase Transformer Technical Showcase"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-700 ease-out contrast-[1.05] saturate-[1.05] brightness-[1.02]"
                  style={{ imageRendering: "high-quality" }}
                  src="/stitch-images/transformer4 (1).png"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Contextual Use Case: The Modern Laboratory */}
      <section className="py-32 bg-surface px-8 border-t border-outline-variant/10">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="aspect-[4/3] overflow-hidden border border-outline-variant/20 shadow-xl rounded-sm group">
                <img
                  alt="Engineering students collaborating in laboratory"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out contrast-[1.08] saturate-[1.05] brightness-[1.02]"
                  style={{ imageRendering: "high-quality" }}
                  src="/stitch-images/group.png"
                />
              </div>
            </motion.div>

            {/* Testimonial & Narrative Column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="flex flex-col justify-center"
            >
              <span className="font-label tech-tag text-xs tracking-[0.3em] uppercase block mb-8">
                Pedagogical Framework
              </span>
              <h2 className="font-headline text-5xl sm:text-6xl mb-10 leading-[1.1] text-on-surface">
                The Modern <br />
                <span className="italic text-primary">Laboratory</span>.
              </h2>
              <div className="space-y-8 font-serif-body text-lg sm:text-xl text-on-surface-variant leading-relaxed">
                <p>
                  Tangible bridges the critical gap between digital abstraction and physical implementation. By visualizing electromagnetic fields and mechanical stresses in real-time, students develop a &quot;muscle memory&quot; for physics that traditional lectures cannot provide.
                </p>
                <p className="text-on-surface font-light border-l-4 border-primary pl-8 italic bg-surface-container-low/30 py-4 pr-4">
                  &quot;The ability to see the flux moving through the core while adjusting the load was the moment electrical machines finally clicked for me.&quot;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Advanced Research Features (Advanced Infrastructure) */}
      <section className="py-32 bg-surface-container-lowest relative overflow-hidden border-t border-outline-variant/10">
        <div className="absolute inset-0 blueprint-grid-fine opacity-10"></div>
        <div className="container mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 md:mb-20 gap-8 text-center md:text-left">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <span className="font-label tech-tag text-xs tracking-[0.3em] uppercase block mb-4">
                Research &amp; Development
              </span>
              <h2 className="font-headline text-4xl sm:text-5xl text-on-surface">Advanced Infrastructure</h2>
            </motion.div>
            <motion.button
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="font-label text-xs tracking-widest text-primary hover:text-white transition-colors flex items-center justify-center gap-2 group underline underline-offset-8 w-full md:w-auto mt-4 md:mt-0"
              onClick={() => window.open("/research", "_self")}
            >
              VIEW TECHNICAL DOCUMENTATION <span className="group-hover:translate-x-1 transition-transform">→</span>
            </motion.button>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-1 border-t border-outline-variant/10"
          >
            {/* Card 1 */}
            <motion.div
              variants={fadeInUp}
              className="p-10 bg-[#0C0E12]/50 border-r border-b border-outline-variant/10 hover:bg-surface-container-low transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-primary-container/10 flex items-center justify-center mb-10 group-hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">psychology</span>
                </div>
                <div className="font-label text-[10px] tech-tag tracking-widest mb-4">ENGINE_AI_V2</div>
                <h3 className="font-headline text-2xl mb-6 text-on-surface">AI Research Assistant</h3>
                <p className="font-serif-body text-sm text-on-surface-variant leading-relaxed mb-10">
                  Natural language querying of machine parameters and automated derivation of performance equations.
                </p>
              </div>
              <div className="flex items-center gap-2 font-label text-[10px] text-outline">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                STATUS: OPERATIONAL
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={fadeInUp}
              className="p-10 bg-[#0C0E12]/50 border-r border-b border-outline-variant/10 hover:bg-surface-container-low transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-primary-container/10 flex items-center justify-center mb-10 group-hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">menu_book</span>
                </div>
                <div className="font-label text-[10px] tech-tag tracking-widest mb-4">LIB_ARCHIVE</div>
                <h3 className="font-headline text-2xl mb-6 text-on-surface">Publications Archive</h3>
                <p className="font-serif-body text-sm text-on-surface-variant leading-relaxed mb-10">
                  A peer-reviewed library of interactive case studies, simulation results, and curriculum whitepapers.
                </p>
              </div>
              <div className="flex items-center gap-2 font-label text-[10px] text-outline">
                542 DOCUMENTS INDEXED
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={fadeInUp}
              className="p-10 bg-[#0C0E12]/50 border-b border-outline-variant/10 hover:bg-surface-container-low transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-primary-container/10 flex items-center justify-center mb-10 group-hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-primary group-hover:text-white">hub</span>
                </div>
                <div className="font-label text-[10px] tech-tag tracking-widest mb-4">PORTAL_COLLAB</div>
                <h3 className="font-headline text-2xl mb-6 text-on-surface">Collaborator Portal</h3>
                <p className="font-serif-body text-sm text-on-surface-variant leading-relaxed mb-10">
                  Shared workspaces for multi-university research projects and collaborative 3D annotation sessions.
                </p>
              </div>
              <div className="flex items-center gap-2 font-label text-[10px] text-outline">
                24 ACTIVE INSTITUTIONS
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. Cinematic Student Section (Limitless Discovery) */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center bg-[#06080A] overflow-hidden border-t border-outline-variant/10">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1, opacity: 0.6 }}
            whileInView={{ scale: 1.02, opacity: 0.85 }}
            viewport={{ once: false }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            alt="Student in Lab"
            className="w-full h-full object-cover md:object-center object-center mix-blend-luminosity"
            src="/stitch-images/girl.png"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080A] via-transparent to-[#06080A]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#06080A] via-transparent to-[#06080A]"></div>
          <div className="absolute inset-0 bg-[#06080A]/10 backdrop-brightness-95"></div>
        </div>
        <div className="container mx-auto px-8 relative z-10 text-center max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="font-label tech-tag text-xs tracking-[0.4em] uppercase mb-6 opacity-80">
              Empowering Next-Gen Innovators
            </div>
            <h2 className="font-headline text-5xl md:text-7xl lg:text-8xl text-on-surface mb-8 italic leading-none">
              Limitless Discovery.
            </h2>
            <p className="font-serif-body text-xl md:text-2xl text-on-surface-variant leading-relaxed opacity-90">
              Witnessing the spark of comprehension when theory meets interactive spatial reality.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
