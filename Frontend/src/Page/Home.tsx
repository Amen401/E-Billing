import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Globe, CreditCard } from "lucide-react";

import heroRobot from "@/assets/hero-robot (1).jpg";
import Navbar from "@/Components/common/NavBar";
import Footer from "@/Components/common/Footer";
import ScrollToHash from "./ScrollToHash";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: "Upload Meter Photo",
      description:
        "Simply snap a photo of your meter. Our AI reads it instantly with high accuracy.",
    },
    {
      icon: Globe,
      title: "AI-Powered Insights",
      description:
        "Visualize your energy usage and receive smart recommendations to reduce costs.",
    },
    {
      icon: CreditCard,
      title: "Secure Online Payments",
      description:
        "Pay your electricity bills safely online with automated reminders.",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Login & Upload",
      description:
        "Access your account securely and upload a photo of your meter.",
    },
    {
      number: 2,
      title: "AI Processing",
      description:
        "Our AI calculates usage, generates bills, and analyzes consumption.",
    },
    {
      number: 3,
      title: "Pay & Optimize",
      description:
        "Pay online and apply insights to lower your future bills.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ScrollToHash />
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-28 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Smart{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Electricity Billing
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              PowerPulse helps you understand, manage, and optimize your
              electricity usage with intelligent AI insights and seamless
              billing.
            </p>

            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="px-10 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 blur-3xl rounded-full" />
            <img
              src={heroRobot}
              alt="AI Assistant"
              className="relative rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { value: "99.8%", label: "Reading Accuracy" },
            { value: "24/7", label: "AI Availability" },
            { value: "100%", label: "Secure Payments" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-4xl font-bold text-primary">
                {stat.value}
              </h3>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="container mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Powerful Features
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border backdrop-blur bg-card/70 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
            >
              <CardContent className="p-10 text-center">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="about" className="bg-muted py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-20">
            How PowerPulse Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl hover:bg-background transition"
              >
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-90" />
        <div className="relative container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-lg mb-10 opacity-90">
            Join thousands of users managing electricity smarter with
            PowerPulse.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="px-12 shadow-xl"
            onClick={() => navigate("/login")}
          >
            Start Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
