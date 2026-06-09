import { Link } from "wouter";
import { ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { formatINR } from "@/lib/format";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-2xl p-8 lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Your Wealth, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Optimized by AI</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Get actionable insights on your mutual funds, track your FIRE journey, and monitor your overall financial health in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/money-health">
              <div className="px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer">
                Check Money Health
              </div>
            </Link>
            <Link href="/portfolio">
              <div className="px-6 py-3 rounded-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 transition-all cursor-pointer">
                Upload Portfolio
              </div>
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-32 w-48 h-48 bg-accent/20 rounded-full blur-[60px]" />
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Money Health Summary */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:border-primary/30 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display font-bold text-lg">Money Health</h3>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ActivityIcon />
            </div>
          </div>
          <div className="flex items-end gap-4 mb-2">
            <div className="text-5xl font-display font-bold text-foreground">78<span className="text-xl text-muted-foreground">/100</span></div>
            <div className="mb-2 px-2.5 py-1 bg-green-500/10 text-green-500 rounded-md text-sm font-medium border border-green-500/20">
              Grade B
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Your financial foundation is strong, but tax optimization needs work.</p>
          <Link href="/money-health">
            <div className="flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer group-hover:translate-x-1 duration-200">
              Improve Score <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* FIRE Progress Summary */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:border-primary/30 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display font-bold text-lg">FIRE Progress</h3>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <TargetIcon />
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Target Corpus</div>
              <div className="text-2xl font-bold text-foreground">{formatINR(35000000)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Years to FIRE</div>
              <div className="text-2xl font-bold text-foreground">15 <span className="text-base font-normal text-muted-foreground">years</span></div>
            </div>
          </div>
          <Link href="/fire-planner">
            <div className="flex items-center text-sm font-semibold text-accent hover:text-accent/80 transition-colors cursor-pointer group-hover:translate-x-1 duration-200">
              Adjust Plan <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg hover:border-primary/30 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-display font-bold text-lg">Portfolio X-Ray</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <PieChartIcon />
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current Value</div>
              <div className="text-2xl font-bold text-foreground">{formatINR(2540000)}</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Returns (XIRR)</div>
                <div className="text-lg font-bold text-green-500 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" /> 14.2%
                </div>
              </div>
            </div>
          </div>
          <Link href="/portfolio">
            <div className="flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer group-hover:translate-x-1 duration-200">
              Analyze Funds <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Alerts & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg">
          <h3 className="font-display font-bold text-lg mb-6 flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-destructive" />
            Attention Needed
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
              <div>
                <h4 className="font-semibold text-destructive mb-1">High Expense Ratio Drag</h4>
                <p className="text-sm text-muted-foreground">2 of your active mutual funds have an expense ratio above 1.5%. Consider switching to direct plans.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
              <AlertTriangle className="w-6 h-6 text-accent shrink-0" />
              <div>
                <h4 className="font-semibold text-accent mb-1">Emergency Fund Gap</h4>
                <p className="text-sm text-muted-foreground">Your current liquid savings cover only 2 months of expenses. Target is 6 months.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg">
          <h3 className="font-display font-bold text-lg mb-6 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-primary" />
            Recommended Next Steps
          </h3>
          <div className="space-y-3">
            {[
              "Increase monthly SIP by ₹5,000 to stay on track for FIRE.",
              "Maximize 80C limit by investing ₹30,000 more in ELSS.",
              "Review fund overlap between 'HDFC Mid-Cap' and 'Axis Midcap'.",
              "Update health insurance cover to at least ₹10 Lakhs."
            ].map((action, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mt-0.5 w-5 h-5 rounded-full border border-primary flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p className="text-sm text-foreground">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple local icons for specific card colors
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const PieChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
