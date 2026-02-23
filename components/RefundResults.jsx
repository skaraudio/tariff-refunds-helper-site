import { motion } from 'framer-motion';
import { CheckCircle, Info, ArrowRight } from 'lucide-react';

function formatUSD(amount) {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
   }).format(amount);
}

export default function RefundResults({ results }) {
   const {
      isEligible,
      totalRefundAmount,
      lineItems = [],
      entryNumber,
      htsCodesFound = [],
   } = results;

   if (!isEligible) {
      return (
         <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-border bg-muted/50 p-8 text-center"
         >
            <Info className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">
               No IEEPA Tariff Codes Found
            </h3>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
               We did not find HTS codes 9903.01.20, 9903.01.24, or 9903.01.25
               in this entry summary. This entry does not appear to include
               tariffs affected by the Supreme Court ruling.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
               If you believe this is incorrect, please consult a licensed
               customs broker for manual review.
            </p>
         </motion.div>
      );
   }

   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.98 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.3 }}
         className="space-y-6"
      >
         {/* Success banner */}
         <div className="rounded-lg border border-success/30 bg-success/5 px-6 py-5">
            <div className="flex items-start gap-4">
               <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-success" />
               <div>
                  <h3 className="text-lg font-semibold text-foreground">
                     You May Be Eligible for a Refund
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                     {entryNumber && (
                        <span>
                           Entry{' '}
                           <span className="font-mono tabular-nums">
                              {entryNumber}
                           </span>{' '}
                           contains{' '}
                        </span>
                     )}
                     {!entryNumber && <span>This entry contains </span>}
                     IEEPA tariff codes that were declared unconstitutional.
                  </p>
                  <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">
                     {formatUSD(totalRefundAmount)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                     Estimated refund amount
                  </p>
               </div>
            </div>
         </div>

         {/* HTS codes found */}
         {htsCodesFound.length > 0 && (
            <div className="flex flex-wrap gap-2">
               <span className="text-sm text-muted-foreground">
                  Codes found:
               </span>
               {htsCodesFound.map((code) => (
                  <span
                     key={code}
                     className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-sm tabular-nums text-foreground"
                  >
                     {code}
                  </span>
               ))}
            </div>
         )}

         {/* Line items table */}
         {lineItems.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border">
               <table className="w-full text-left text-sm">
                  <thead>
                     <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 font-semibold text-foreground">
                           HTS Code
                        </th>
                        <th className="px-4 py-3 font-semibold text-foreground">
                           Description
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                           Duty Amount
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {lineItems.map((item, i) => (
                        <tr
                           key={i}
                           className="border-b border-border last:border-b-0"
                        >
                           <td className="px-4 py-3 font-mono tabular-nums text-foreground">
                              {item.htsCode}
                           </td>
                           <td className="px-4 py-3 text-muted-foreground">
                              {item.description}
                           </td>
                           <td className="px-4 py-3 text-right tabular-nums text-foreground">
                              {formatUSD(item.dutyAmount)}
                           </td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot>
                     <tr className="bg-muted/50">
                        <td
                           colSpan={2}
                           className="px-4 py-3 font-semibold text-foreground"
                        >
                           Total
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                           {formatUSD(totalRefundAmount)}
                        </td>
                     </tr>
                  </tfoot>
               </table>
            </div>
         )}

         {/* Next steps */}
         <div className="rounded-lg border border-border bg-background p-6">
            <h4 className="font-semibold text-foreground">
               What to Do Next
            </h4>
            <ul className="mt-4 space-y-3">
               <li className="flex items-start gap-3">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                     <p className="font-semibold text-foreground">
                        Unliquidated Entries
                     </p>
                     <p className="mt-0.5 text-sm text-muted-foreground">
                        File a Post Summary Correction (PSC) with CBP to remove
                        the IEEPA tariff charges and request a refund of duties
                        paid.
                     </p>
                  </div>
               </li>
               <li className="flex items-start gap-3">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                     <p className="font-semibold text-foreground">
                        Liquidated Entries
                     </p>
                     <p className="mt-0.5 text-sm text-muted-foreground">
                        File a formal protest (CBP Form 19) within 180 days of
                        liquidation, citing the Supreme Court ruling as the
                        basis for your claim.
                     </p>
                  </div>
               </li>
               <li className="flex items-start gap-3">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                     <p className="font-semibold text-foreground">
                        Consult a Professional
                     </p>
                     <p className="mt-0.5 text-sm text-muted-foreground">
                        Work with a licensed customs broker or trade attorney to
                        ensure your refund claim is filed correctly and on time.
                     </p>
                  </div>
               </li>
            </ul>
         </div>
      </motion.div>
   );
}
