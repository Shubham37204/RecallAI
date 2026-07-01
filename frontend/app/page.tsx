import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Import modular sections
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
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Landing Sections */}
      <main className="flex-1">
        {/* SECTION 1: HERO */}
        <Hero />

        {/* SECTION: WHY WE EXIST */}
        <WhyWeExist />

        {/* SECTION 3: HOW IT WORKS */}
        <ProcessTimeline />

        {/* SECTION 4: FEATURE SHOWCASE */}
        <FeatureShowcase />

        {/* SECTION 5: USE CASES (Integrated stats) */}
        <UseCases />

        {/* SECTION 8: FINAL CTA */}
        <CTA />
      </main>

      {/* Footer Sitemap */}
      <Footer />
    </div>
  );
}
