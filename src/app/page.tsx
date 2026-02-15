import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { WeAdvised } from "@/components/sections/WeAdvised";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhatWeUse } from "@/components/sections/WhatWeUse";
import { WhatYouGet } from "@/components/sections/WhatYouGet";
import { LeadMagnet } from "@/components/sections/LeadMagnet";
import { WhoItsFor } from "@/components/sections/WhoItsFor";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WeAdvised />
        <HowItWorks />
        <WhatWeUse />
        <WhatYouGet />
        <LeadMagnet />
        <WhoItsFor />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
