import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Globe, CreditCard } from 'lucide-react';

import heroRobot from '@/assets/hero-robot (1).jpg';
import Navbar from '@/Components/common/NavBar';
import Footer from '@/Components/common/Footer';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: 'Upload Meter Photo',
      description: 'Snap a picture of your meter, and our AI instantly reads and processes the data, eliminating manual entry errors.',
    },
    {
      icon: Globe,
      title: 'AI-Powered Insights',
      description: 'Unlock detailed analytics and personalized recommendations to optimize energy usage and identify cost-saving opportunities.',
    },
    {
      icon: CreditCard,
      title: 'Pay Online Securely',
      description: 'Enjoy peace of mind with secure, convenient online payment options and automated billing reminders.',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Login & Upload Meter',
      description: 'Securely log into your PowerPulse account and easily upload a photo of your electricity meter.',
    },
    {
      number: 2,
      title: 'AI Calculates & Analyzes',
      description: 'Our advanced AI immediately processes your meter reading, calculates your bill, and generates usage insights.',
    },
    {
      number: 3,
      title: 'View, Pay & Optimize',
      description: 'Access your detailed bill, make secure payments online, and apply insights to optimize future energy consumption.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Smart, AI-Powered Electricity Billing
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Gain unparalleled control and understanding of your energy consumption with PowerPulse. 
              Our intelligent platform provides accurate, real-time billing insights, helping you save money and 
              reduce your environmental footprint effortlessly.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/login?role=customer')}
              >
                Customer Login
              </Button>
              <Button 
                size="lg"
                onClick={() => navigate('/login?role=officer')}
              >
                Register Now
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
              <img 
                src={heroRobot} 
                alt="AI Robot Assistant" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How PowerPulse Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
