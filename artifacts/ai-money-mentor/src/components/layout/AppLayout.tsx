import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Activity, 
  Target, 
  PieChart, 
  IndianRupee,
  Menu,
  X,
  Bell,
  UserCircle
} from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Money Health Score", href: "/money-health", icon: Activity },
    { name: "FIRE Planner", href: "/fire-planner", icon: Target },
    { name: "Portfolio X-Ray", href: "/portfolio", icon: PieChart },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary to-emerald-400 p-1.5 rounded-lg text-black">
            <IndianRupee size={20} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            AI Money Mentor
          </span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col p-4 gap-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} className="block">
              <div
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted cursor-pointer transition-colors">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Investor Profile</span>
            <span className="text-xs text-muted-foreground">Pro Member</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-border/50 bg-card/30 backdrop-blur-xl md:flex z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex w-full max-w-xs flex-col bg-card border-r border-border shadow-2xl">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground bg-muted rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
        
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/50 backdrop-blur-md px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Menu size={24} />
            </button>
            <span className="font-display font-bold text-foreground">AI Money Mentor</span>
          </div>
          <div className="hidden md:flex flex-1" />
          <div className="flex items-center gap-4">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border border-background"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 z-10">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
