import { Scale } from 'lucide-react';

export default function Footer() {
   return (
      <footer className="border-t border-border bg-muted/30 py-12">
         <div className="mx-auto max-w-4xl px-6">
            <div className="flex flex-col items-center text-center">
               <Scale className="h-5 w-5 text-muted-foreground" />

               <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  This tool provides estimates only and does not constitute
                  legal advice. Consult a licensed customs broker or trade
                  attorney for formal refund claims. Results are based on
                  automated PDF analysis and may not capture all duty line
                  items.
               </p>

               <p className="mt-3 text-sm text-muted-foreground">
                  Not affiliated with U.S. Customs and Border Protection or any
                  government agency.
               </p>

               <div className="mt-6 h-px w-16 bg-border" />

               <p className="mt-6 text-xs text-muted-foreground">
                  Based on the Supreme Court ruling in{' '}
                  <em>Learning Resources, Inc. v. Trump</em>, decided February
                  20, 2026.
               </p>

               <p className="mt-2 text-xs text-muted-foreground">
                  &copy; {new Date().getFullYear()} Tariff Refunds Helper. All
                  rights reserved.
               </p>
            </div>
         </div>
      </footer>
   );
}
