import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyWeExist from "@/components/WhyWeExist";
import ProcessTimeline from "@/components/ProcessTimeline";
import FeatureShowcase from "@/components/FeatureShowcase";
import UseCases from "@/components/UseCases";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col antialiased">
      <Navbar />

      <main className="flex-1">
        <Hero />

        <WhyWeExist />

        <ProcessTimeline />

        <FeatureShowcase />

        <UseCases />

        <CTA />
      </main>

      <Footer />
    </div>
  );
}
