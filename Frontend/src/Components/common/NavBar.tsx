import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Zap className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">E-billing</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="/#about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </div>

          <Button onClick={() => navigate('/login')} variant="outline">
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
