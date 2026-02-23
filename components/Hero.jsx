import { motion } from 'framer-motion';
import { ArrowDown, Scale, ShieldCheck } from 'lucide-react';

const fadeUp = {
   hidden: { opacity: 0, y: 20 },
   visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
   }),
};

export default function Hero() {
   const scrollToUpload = () => {
      const el = document.getElementById('upload');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
   };

   return (
      <section className="relative overflow-hidden bg-background pb-20 pt-24 md:pb-28 md:pt-32">
         {/* Subtle grid background */}
         <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
               backgroundImage:
                  'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
               backgroundSize: '4rem 4rem',
            }}
         />

         <div className="relative mx-auto max-w-4xl px-6 text-center">
            {/* Badge */}
            <motion.div
               custom={0}
               variants={fadeUp}
               initial="hidden"
               animate="visible"
            >
               <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  Supreme Court Ruling — February 20, 2026
               </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
               custom={1}
               variants={fadeUp}
               initial="hidden"
               animate="visible"
               className="mt-8 text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl"
            >
               Are You Eligible for
               <br />
               IEEPA Tariff Refunds?
            </motion.h1>

            {/* Subheadline */}
            <motion.p
               custom={2}
               variants={fadeUp}
               initial="hidden"
               animate="visible"
               className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
               On February 20, 2026, the Supreme Court ruled in{' '}
               <em>Learning Resources, Inc. v. Trump</em> that tariffs imposed
               under the International Emergency Economic Powers Act were
               unconstitutional. Importers who paid these tariffs may now be
               entitled to refunds.
            </motion.p>

            {/* Key facts */}
            <motion.div
               custom={3}
               variants={fadeUp}
               initial="hidden"
               animate="visible"
               className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2"
            >
               <div className="rounded-lg border border-border bg-muted/50 px-5 py-4">
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                     $175B+
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                     In potential refunds
                  </p>
               </div>
               <div className="rounded-lg border border-border bg-muted/50 px-5 py-4">
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                     301,000+
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                     Importers affected
                  </p>
               </div>
            </motion.div>

            {/* HTS codes */}
            <motion.div
               custom={4}
               variants={fadeUp}
               initial="hidden"
               animate="visible"
               className="mt-8 flex flex-wrap items-center justify-center gap-2"
            >
               <ShieldCheck className="h-4 w-4 text-muted-foreground" />
               <span className="text-sm text-muted-foreground">
                  HTS codes declared unlawful:
               </span>
               {['9903.01.20', '9903.01.24', '9903.01.25'].map((code) => (
                  <span
                     key={code}
                     className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-sm tabular-nums text-foreground"
                  >
                     {code}
                  </span>
               ))}
            </motion.div>

            {/* CTA */}
            <motion.div
               custom={5}
               variants={fadeUp}
               initial="hidden"
               animate="visible"
               className="mt-12"
            >
               <button
                  onClick={scrollToUpload}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
               >
                  Check Your Eligibility
                  <ArrowDown className="h-4 w-4" />
               </button>
               <p className="mt-3 text-sm text-muted-foreground">
                  Upload your CBP entry summary PDF — takes 30 seconds
               </p>
            </motion.div>
         </div>
      </section>
   );
}
