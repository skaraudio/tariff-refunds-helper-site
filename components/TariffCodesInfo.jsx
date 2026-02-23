import {motion} from 'framer-motion';
import {AlertTriangle} from 'lucide-react';

const codes = [
   {
      hts: '9903.01.20',
      name: 'China/HK Fentanyl Emergency — 10%',
      period: 'Feb 4 - Mar 3, 2025',
      description:
         'Initial 10% ad valorem tariff on imports from China and Hong Kong, imposed under IEEPA citing the fentanyl emergency.',
   },
   {
      hts: '9903.01.24',
      name: 'China/HK Fentanyl Emergency — 20%',
      period: 'Mar 4, 2025 onward',
      description:
         'Increased to 20% ad valorem on all imports from China and Hong Kong under the same IEEPA fentanyl emergency authority.',
   },
   {
      hts: '9903.01.25',
      name: 'Reciprocal "Liberation Day" Baseline — 10%',
      period: 'Apr 5, 2025 onward',
      description:
         'Blanket 10% baseline tariff on imports from all countries, imposed under IEEPA as part of the "Liberation Day" reciprocal tariff program.',
   },
   {
      hts: '9903.01.26–99',
      name: 'Country-Specific Reciprocal Tariffs',
      period: 'Apr 9, 2025 onward',
      description:
          'Higher country-specific tariff rates (e.g., 125% on China/HK/Macau under 9903.01.63) imposed under the same IEEPA reciprocal tariff authority.',
   },
];

export default function TariffCodesInfo() {
   return (
      <section className="bg-background py-20">
         <div className="mx-auto max-w-5xl px-6">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="text-center"
            >
               <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  IEEPA Tariff Codes Struck Down
               </h2>
               <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                  The Supreme Court ruled all tariffs in the 9903.01.XX series
                  — imposed under the International Emergency Economic Powers
                  Act — were an unconstitutional exercise of executive power.
               </p>
            </motion.div>

            <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
               {codes.map((code, i) => (
                  <motion.div
                     key={code.hts}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: '-30px' }}
                     transition={{ delay: i * 0.1, duration: 0.45 }}
                     className="rounded-lg border border-border bg-background p-6"
                  >
                     <p className="font-mono text-xl font-semibold tabular-nums text-foreground">
                        {code.hts}
                     </p>
                     <p className="mt-2 font-semibold text-foreground">
                        {code.name}
                     </p>
                     <p className="mt-1 text-sm text-muted-foreground">
                        {code.period}
                     </p>
                     <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {code.description}
                     </p>
                  </motion.div>
               ))}
            </div>

            {/* Disclaimer about what was NOT struck down */}
            <motion.div
               initial={{ opacity: 0, y: 16 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2, duration: 0.45 }}
               className="mt-8 rounded-lg border border-border bg-muted/50 px-6 py-5"
            >
               <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                     <p className="font-semibold text-foreground">
                        What Was Not Struck Down
                     </p>
                     <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Section 301 tariffs (trade-related tariffs on China),
                        Section 232 tariffs (steel and aluminum), and other
                        tariffs imposed under authorities other than IEEPA
                        remain in full effect. This tool only identifies
                        refund-eligible IEEPA tariffs.
                     </p>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>
   );
}
