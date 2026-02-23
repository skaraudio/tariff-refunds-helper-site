import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileText, DollarSign, CheckCircle } from 'lucide-react';

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
   const [display, setDisplay] = useState(0);
   const ref = useRef(null);
   const isInView = useInView(ref, { once: true, margin: '-50px' });
   const prevValue = useRef(0);

   useEffect(() => {
      if (!isInView || value === 0) return;

      const start = prevValue.current;
      const end = value;
      const duration = 1500;
      const startTime = performance.now();

      const animate = (now) => {
         const elapsed = now - startTime;
         const progress = Math.min(elapsed / duration, 1);
         // Ease out cubic
         const eased = 1 - Math.pow(1 - progress, 3);
         const current = start + (end - start) * eased;
         setDisplay(current);

         if (progress < 1) {
            requestAnimationFrame(animate);
         } else {
            prevValue.current = end;
         }
      };

      requestAnimationFrame(animate);
   }, [value, isInView]);

   const formatted =
      decimals > 0
         ? display.toFixed(decimals)
         : Math.round(display).toLocaleString('en-US');

   return (
      <span ref={ref} className="tabular-nums">
         {prefix}
         {formatted}
         {suffix}
      </span>
   );
}

function formatCurrency(amount) {
   if (amount >= 1_000_000_000) {
      return { value: amount / 1_000_000_000, suffix: 'B', decimals: 2, prefix: '$' };
   }
   if (amount >= 1_000_000) {
      return { value: amount / 1_000_000, suffix: 'M', decimals: 1, prefix: '$' };
   }
   return { value: amount, suffix: '', decimals: 0, prefix: '$' };
}

const cards = [
   {
      key: 'total_entries_processed',
      label: 'Entries Analyzed',
      icon: FileText,
      format: (v) => ({ value: v, prefix: '', suffix: '', decimals: 0 }),
   },
   {
      key: 'total_refund_amount',
      label: 'Total Refunds Identified',
      icon: DollarSign,
      format: formatCurrency,
   },
   {
      key: 'eligible_entries',
      label: 'Eligible Entries',
      icon: CheckCircle,
      format: (v) => ({ value: v, prefix: '', suffix: '', decimals: 0 }),
   },
];

export default function StatsCounter() {
   const [stats, setStats] = useState({
      total_entries_processed: 0,
      total_refund_amount: 0,
      eligible_entries: 0,
   });

   const fetchStats = useCallback(async () => {
      try {
         const res = await fetch('/api/stats');
         if (res.ok) {
            const data = await res.json();
            setStats(data);
         }
      } catch {
         // Silently fail — stats are non-critical
      }
   }, []);

   useEffect(() => {
      fetchStats();
      const interval = setInterval(fetchStats, 30_000);
      return () => clearInterval(interval);
   }, [fetchStats]);

   return (
      <section className="bg-muted/50 py-12">
         <div className="mx-auto max-w-4xl px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
               {cards.map((card, i) => {
                  const rawValue = stats[card.key] || 0;
                  const { value, prefix, suffix, decimals } = card.format(rawValue);
                  const Icon = card.icon;

                  return (
                     <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="rounded-lg border border-border bg-background px-6 py-5 text-center"
                     >
                        <Icon className="mx-auto h-5 w-5 text-muted-foreground" />
                        <p className="mt-3 text-3xl font-semibold text-foreground">
                           <AnimatedNumber
                              value={value}
                              prefix={prefix}
                              suffix={suffix}
                              decimals={decimals}
                           />
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                           {card.label}
                        </p>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </section>
   );
}
