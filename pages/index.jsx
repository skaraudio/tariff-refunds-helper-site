import Head from 'next/head';
import Hero from '@/components/Hero';
import StatsCounter from '@/components/StatsCounter';
import HowItWorks from '@/components/HowItWorks';
import FileUpload from '@/components/FileUpload';
import TariffCodesInfo from '@/components/TariffCodesInfo';
import Footer from '@/components/Footer';

export default function HomePage() {
   return (
      <>
         <Head>
            <title>
               IEEPA Tariff Refund Checker — Are You Eligible After the Supreme
               Court Ruling?
            </title>
            <meta
               name="description"
               content="Check if you're eligible for IEEPA tariff refunds after the Feb 20, 2026 Supreme Court ruling. Upload your CBP entry summary PDF to see your potential refund amount instantly."
            />
            <meta
               name="viewport"
               content="width=device-width, initial-scale=1"
            />
            <link rel="icon" href="/favicon.ico" />

            {/* Open Graph */}
            <meta
               property="og:title"
               content="IEEPA Tariff Refund Checker — Are You Eligible?"
            />
            <meta
               property="og:description"
               content="The Supreme Court struck down IEEPA tariffs on Feb 20, 2026. Over $175B in refunds may be available to 301,000+ importers. Check your eligibility now."
            />
            <meta property="og:type" content="website" />
            <meta
               property="og:image"
               content="/og-image.png"
            />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta
               name="twitter:title"
               content="IEEPA Tariff Refund Checker"
            />
            <meta
               name="twitter:description"
               content="Check if you're eligible for IEEPA tariff refunds after the Supreme Court ruling."
            />
         </Head>

         <main className="min-h-screen bg-background">
            <Hero />
            <StatsCounter />
            <HowItWorks />
            <FileUpload />
            <TariffCodesInfo />
         </main>

         <Footer />
      </>
   );
}
