import { motion } from 'framer-motion';
import { Upload, Search, ClipboardCheck } from 'lucide-react';

const steps = [
   {
      number: '1',
      icon: Upload,
      title: 'Upload Your Entry Summary',
      description:
         'Upload your CBP 7501 entry summary PDF. Your file is processed securely and never stored.',
   },
   {
      number: '2',
      icon: Search,
      title: 'We Scan for IEEPA Codes',
      description:
         'We check for HTS codes 9903.01.20, 9903.01.24, and 9903.01.25 — the tariffs struck down by the Court.',
   },
   {
      number: '3',
      icon: ClipboardCheck,
      title: 'See Your Refund Eligibility',
      description:
         'Get your potential refund amount instantly, along with a breakdown of every eligible line item.',
   },
];

export default function HowItWorks() {
   return (
      <section className="bg-muted/50 py-20">
         <div className="mx-auto max-w-5xl px-6">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="text-center"
            >
               <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  How It Works
               </h2>
               <p className="mt-3 text-muted-foreground">
                  Three simple steps to check your refund eligibility.
               </p>
            </motion.div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
               {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                     <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ delay: i * 0.12, duration: 0.45 }}
                        className="relative rounded-lg border border-border bg-background p-6"
                     >
                        {/* Step number */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold tabular-nums text-foreground">
                           {step.number}
                        </div>

                        <Icon className="mt-5 h-8 w-8 text-muted-foreground" />

                        <h3 className="mt-4 text-base font-semibold text-foreground">
                           {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                           {step.description}
                        </p>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </section>
   );
}
