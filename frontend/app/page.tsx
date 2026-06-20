// app/page.tsx — public landing page
// Authenticated users are redirected to /dashboard by middleware

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Import modular sections
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import TrustBar from "@/components/TrustBar";
import WhyWeExist from "@/components/WhyWeExist";
import ProcessTimeline from "@/components/ProcessTimeline";
import FeatureShowcase from "@/components/FeatureShowcase";
import UseCases from "@/components/UseCases";
import WorkspacePreview from "@/components/WorkspacePreview";
import SearchDemo from "@/components/SearchDemo";
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

        {/* SECTION: SOCIAL PROOF */}
        <SocialProof />

        {/* SECTION 2: TRUST BAR */}
        <TrustBar />

        {/* SECTION: WHY WE EXIST */}
        <WhyWeExist />

        {/* SECTION 3: HOW IT WORKS */}
        <ProcessTimeline />

        {/* SECTION 4: FEATURE SHOWCASE */}
        <FeatureShowcase />

        {/* SECTION 5: USE CASES (Integrated stats) */}
        <UseCases />

        {/* SECTION: INSIDE THE WORKSPACE */}
        <WorkspacePreview />

        {/* SECTION 6: SEARCH DEMO */}
        <SearchDemo />

        {/* SECTION 8: FINAL CTA */}
        <CTA />
      </main>

      {/* Footer Sitemap */}
      <Footer />
    </div>
  );
}
