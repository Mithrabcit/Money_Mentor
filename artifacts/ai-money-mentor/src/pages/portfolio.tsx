import { useState, useRef } from "react";
import { useAnalyzePortfolio } from "@workspace/api-client-react";
import { UploadCloud, FileText, AlertTriangle, TrendingUp, TrendingDown, Info, ArrowRightLeft } from "lucide-react";
import { formatINR, formatCompactINR } from "@/lib/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function PortfolioXRay() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useAnalyzePortfolio();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    mutation.mutate({ data: { file } });
  };

  const handleUseSample = () => {
    mutation.mutate({ data: { useSample: true } });
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Mutual Fund X-Ray</h1>
          <p className="text-muted-foreground mt-1">Upload your CAS statement to uncover hidden risks and overlaps.</p>
        </div>
      </div>

      {/* Upload Section - Hides after success */}
      {!mutation.isSuccess && (
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl max-w-3xl mx-auto mt-12">
          
          <div 
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${file ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50 hover:bg-muted/30'}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" className="hidden" />
            
            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="w-16 h-16 text-primary mb-4" />
                <p className="text-lg font-semibold">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  className="mt-6 px-8 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Analyzing Portfolio..." : "Analyze Now"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <UploadCloud className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Drag & Drop your CAS PDF</h3>
                <p className="text-muted-foreground max-w-sm mb-6">Securely upload your CAMS or KFintech consolidated account statement.</p>
                <div className="px-6 py-2 rounded-lg border border-border/50 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Browse Files
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px bg-border flex-1"></div>
            <span className="text-sm text-muted-foreground font-medium">OR</span>
            <div className="h-px bg-border flex-1"></div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={handleUseSample}
              disabled={mutation.isPending}
              className="text-sm font-medium text-accent hover:text-accent/80 hover:underline"
            >
              Load Sample Portfolio Data instead
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {mutation.isPending && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold mb-2">Deep Analyzing...</h3>
            <p className="text-sm text-center text-muted-foreground">Checking for overlaps, calculating true XIRR, and finding expense drags.</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {mutation.isSuccess && mutation.data && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          
          <div className="flex justify-end mb-4">
             <button 
              onClick={() => { mutation.reset(); setFile(null); }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Upload different file
            </button>
          </div>

          {/* Top Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Invested Value</div>
              <div className="text-2xl font-bold">{formatCompactINR(mutation.data.totalInvestedValue)}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Current Value</div>
              <div className="text-2xl font-bold text-primary">{formatCompactINR(mutation.data.totalCurrentValue)}</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Returns</div>
              <div className="text-xl font-bold flex items-center text-green-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                {formatCompactINR(mutation.data.totalGainLoss)}
                <span className="text-xs ml-2 bg-green-500/20 px-1.5 py-0.5 rounded">+{mutation.data.totalGainLossPercent}%</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="text-xs text-primary mb-1 uppercase tracking-wider font-semibold">Portfolio XIRR</div>
              <div className="text-3xl font-display font-bold text-foreground">{mutation.data.xirr}%</div>
              {mutation.data.xirr > mutation.data.benchmarkReturn ? (
                <div className="text-xs text-green-500 mt-1 flex items-center">+{(mutation.data.xirr - mutation.data.benchmarkReturn).toFixed(1)}% vs Nifty 50</div>
              ) : (
                <div className="text-xs text-destructive mt-1 flex items-center">Underperforming benchmark</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Holdings Table */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-md flex flex-col">
              <div className="p-5 border-b border-border/50">
                <h3 className="font-display font-bold text-lg">Top Holdings</h3>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-5 py-3">Fund Name</th>
                      <th className="px-5 py-3 text-right">Value</th>
                      <th className="px-5 py-3 text-right">Returns</th>
                      <th className="px-5 py-3 text-right">Expense Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mutation.data.holdings.map((h, i) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-muted/10">
                        <td className="px-5 py-4">
                          <div className="font-medium text-foreground">{h.schemeName}</div>
                          <div className="text-xs text-muted-foreground">{h.category} • {h.subCategory}</div>
                        </td>
                        <td className="px-5 py-4 text-right font-medium">{formatINR(h.currentValue)}</td>
                        <td className={`px-5 py-4 text-right font-medium ${h.gainLoss > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {h.gainLoss > 0 ? '+' : ''}{h.gainLossPercent}%
                        </td>
                        <td className={`px-5 py-4 text-right font-medium ${h.expenseRatio > 1.0 ? 'text-accent' : 'text-muted-foreground'}`}>
                          {h.expenseRatio}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Charts & Insights */}
            <div className="space-y-6">
              
              {/* Category Allocation */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-md">
                <h3 className="font-display font-bold text-lg mb-4">Category Allocation</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mutation.data.categoryAllocation}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="percentage"
                        nameKey="category"
                      >
                        {mutation.data.categoryAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                        formatter={(val: number) => `${val}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-y-2 mt-4">
                  {mutation.data.categoryAllocation.map((c, i) => (
                    <div key={i} className="flex items-center text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      <span className="text-muted-foreground truncate" title={c.category}>{c.category}</span>
                      <span className="ml-auto font-medium">{c.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Drag Alert */}
              {mutation.data.expenseDrag > 5000 && (
                <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="p-2 bg-accent/20 rounded-full shrink-0">
                      <TrendingDown className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-accent mb-1">High Expense Drag</h4>
                      <p className="text-sm text-foreground mb-2">You are losing <strong className="text-accent">{formatINR(mutation.data.expenseDrag)}</strong> annually to high expense ratios.</p>
                      <p className="text-xs text-muted-foreground">Switching Regular plans to Direct plans can save you lakhs over the long term.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Overlap & Recommendations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Fund Overlaps */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
              <h3 className="font-display font-bold text-lg mb-1 flex items-center">
                <ArrowRightLeft className="w-5 h-5 mr-2 text-primary" /> Portfolio Overlap
              </h3>
              <p className="text-xs text-muted-foreground mb-6">Funds investing in the exact same underlying stocks.</p>
              
              {mutation.data.fundOverlaps.length > 0 ? (
                <div className="space-y-4">
                  {mutation.data.fundOverlaps.map((overlap, i) => (
                    <div key={i} className="p-4 bg-background rounded-xl border border-border/50">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-1 truncate text-sm font-medium" title={overlap.fund1}>{overlap.fund1.substring(0, 20)}...</div>
                          <div className="shrink-0 px-2 py-1 bg-destructive/10 text-destructive text-xs font-bold rounded border border-destructive/20">
                            {overlap.overlapPercent}% Match
                          </div>
                          <div className="flex-1 truncate text-sm font-medium text-right" title={overlap.fund2}>...{overlap.fund2.substring(overlap.fund2.length - 20)}</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        <Info className="w-3 h-3 inline mr-1" /> They share {overlap.commonStocks} common stocks. Consider consolidating.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground text-sm">Great job! Your funds have minimal overlap.</p>
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
              <h3 className="font-display font-bold text-lg mb-6 flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" /> AI Recommendations
              </h3>
              <ul className="space-y-4">
                {mutation.data.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
