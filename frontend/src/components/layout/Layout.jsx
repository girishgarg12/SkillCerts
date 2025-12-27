import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AuroraBackground } from '../ui/AuroraBackground';
import { BackgroundBeams } from '../ui/BackgroundBeams';
import { FloatingNav } from '../ui/FloatingNavbar';

export const Layout = () => {
  return (
    <AuroraBackground className="h-full min-h-screen !fixed inset-0 z-0 pointer-events-none">
      <BackgroundBeams className="opacity-40" />
      <div className="relative z-10 w-full h-full min-h-screen flex flex-col text-white overflow-y-auto pointer-events-auto">
        <Navbar />
        <FloatingNav navItems={[
            { name: "Home", link: "/" },
            { name: "Courses", link: "/courses" },
            { name: "About", link: "/about" }, 
        ]} />
        <main className="flex-1 pt-20">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuroraBackground>
  );
};
