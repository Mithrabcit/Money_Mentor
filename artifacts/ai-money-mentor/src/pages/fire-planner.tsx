import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCalculateFirePlan } from "@workspace/api-client-react";
import { formatINR, formatCompactINR } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from "recharts";
import { Target, TrendingUp, Plus, Trash2, ShieldCheck, Flame, CheckSquare } from "lucide-react";

const fireFormSchema = z.object({
  age: z.coerce.number().min(18),
  monthlyIncome: z.coerce.number().min(0),
  monthlyExpenses: z.coerce.number().min(0),
  dependents: z.coerce.number().min(0),
  currentSavings: z.coerce.number().min(0),
  currentInvestments: z.coerce.number().min(0),
  emiAmount: z.coerce.number().min(0),
  targetRetirementAge: z.coerce.number().min(30).max(80),
  expectedInflation: z.coerce.number().min(0).max(20),
  expectedReturnRate: z.coerce.number().min(0).max(30),
  riskProfile: z.enum(["conservative", "moderate", "aggressive"]),
  goals: z.array(z.object({
    name: z.string().min(1),
    targetAmount: z.coerce.number().min(0),
    targetYear: z.coerce.number().min(2025),
    currentSavings: z.coerce.number().min(0)
  }))
});

type FireFormData = z.infer<typeof fireFormSchema>;

export default function FirePlanner() {
  const mutation = useCalculateFirePlan();

  const { register, control, handleSubmit, watch } = useForm<FireFormData>({
    resolver: zodResolver(fireFormSchema),
    defaultValues: {
      age: 32,
      monthlyIncome: 120000,
      monthlyExpenses: 45000,
      dependents: 1,
      currentSavings: 800000,
      currentInvestments: 2500000,
      emiAmount: 15000,
      targetRetirementAge: 50,
      expectedInflation: 6,
      expectedReturnRate: 12,
      riskProfile: "moderate",
      goals: [
        { name: "Child Education", targetAmount: 5000000, targetYear: 2040, currentSavings: 500000 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "goals"
  });

  const onSubmit = (data: FireFormData) => {
    mutation.mutate({ data });
  };

  const riskProfile = watch("riskProfile");

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Flame className="text-accent w-8 h-8" fill="currentColor" />
            FIRE Path Planner
          </h1>
          <p className="text-muted-foreground mt-1">Financial Independence, Retire Early. Map your journey.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border/50 rounded-3xl p-6 shadow-xl space-y-6 sticky top-24">
            
            <div className="space-y-4">
              <h3 className="font-display font-semibold border-b border-border/50 pb-2">Core Parameters</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Current Age</label>
                  <input type="number" {...register("age")} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Retire Age Target</label>
                  <input type="number" {...register("targetRetirementAge")} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Monthly Living Expenses (₹)</label>
                <input type="number" {...register("monthlyExpenses")} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Current Invested Corpus (₹)</label>
                <input type="number" {...register("currentInvestments")} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-display font-semibold border-b border-border/50 pb-2">Assumptions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Inflation (%)</label>
                  <input type="number" step="0.1" {...register("expectedInflation")} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Return Rate (%)</label>
                  <input type="number" step="0.1" {...register("expectedReturnRate")} className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Risk Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  {['conservative', 'moderate', 'aggressive'].map(profile => (
                    <label key={profile} className={`
                      text-center py-2 text-xs rounded-lg border cursor-pointer transition-all
                      ${riskProfile === profile ? 'bg-primary/20 border-primary text-primary font-bold' : 'bg-background border-border text-muted-foreground hover:bg-muted'}
                    `}>
                      <input type="radio" value={profile} {...register("riskProfile")} className="hidden" />
                      {profile.charAt(0).toUpperCase() + profile.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <h3 className="font-display font-semibold">Major Goals</h3>
                <button type="button" onClick={() => append({ name: "New Goal", targetAmount: 1000000, targetYear: 2035, currentSavings: 0 })} className="text-xs text-primary hover:underline flex items-center">
                  <Plus className="w-3 h-3 mr-1" /> Add
                </button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="p-3 bg-background border border-border/50 rounded-xl space-y-3 relative group">
                  <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input {...register(`goals.${index}.name`)} className="w-full bg-transparent text-sm font-semibold border-b border-border/50 pb-1 focus:outline-none focus:border-primary" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Target (₹)</label>
                      <input type="number" {...register(`goals.${index}.targetAmount`)} className="w-full px-2 py-1 text-xs rounded bg-muted border-none outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Year</label>
                      <input type="number" {...register(`goals.${index}.targetYear`)} className="w-full px-2 py-1 text-xs rounded bg-muted border-none outline-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex justify-center items-center"
            >
              {mutation.isPending ? "Crunching Numbers..." : "Generate FIRE Plan"}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8">
          {!mutation.isSuccess ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-card/50 border border-border/50 border-dashed rounded-3xl p-8 text-center">
              <Target className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-xl font-display font-semibold mb-2">Awaiting Parameters</h2>
              <p className="text-muted-foreground max-w-sm">Adjust your inputs on the left and generate your personalized financial independence map.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                  <div className="text-sm font-medium text-primary mb-1">Your FIRE Number</div>
                  <div className="text-3xl font-display font-bold text-foreground">{formatCompactINR(mutation.data.fireNumber)}</div>
                  <p className="text-xs text-muted-foreground mt-2">Corpus needed to retire safely.</p>
                  <Flame className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/10 rotate-12" />
                </div>
                
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Required SIP</div>
                  <div className="text-3xl font-display font-bold text-foreground">{formatINR(mutation.data.totalMonthlySip)}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-xs text-muted-foreground mt-2">To hit FIRE + all goals on time.</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Time to FIRE</div>
                  <div className="text-3xl font-display font-bold text-foreground">{Math.floor(mutation.data.monthsToFire / 12)} <span className="text-base font-normal text-muted-foreground">yrs</span></div>
                  <p className="text-xs text-muted-foreground mt-2">At age {watch("age") + Math.floor(mutation.data.monthsToFire / 12)}.</p>
                </div>
              </div>

              {/* Chart & Allocation row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-lg">
                  <h3 className="font-display font-bold text-lg mb-6">Corpus Projection</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mutation.data.retirementProjections} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="age" stroke="#888" fontSize={12} tickFormatter={(v) => `Age ${v}`} />
                        <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => formatCompactINR(v)} width={60} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                          formatter={(value: number) => [formatINR(value), "Corpus"]}
                          labelFormatter={(label) => `Age: ${label}`}
                        />
                        <ReferenceLine y={mutation.data.fireNumber} label={{ position: 'top', value: 'FIRE Target', fill: '#10B981', fontSize: 12 }} stroke="#10B981" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="corpus" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#10B981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg flex flex-col">
                  <h3 className="font-display font-bold text-lg mb-2">Target Allocation</h3>
                  <p className="text-xs text-muted-foreground mb-4">Based on {watch("riskProfile")} profile.</p>
                  <div className="flex-1 flex flex-col justify-center relative">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Equity', value: mutation.data.assetAllocation.equity, color: '#10B981' },
                              { name: 'Debt', value: mutation.data.assetAllocation.debt, color: '#3B82F6' },
                              { name: 'Gold', value: mutation.data.assetAllocation.gold, color: '#F59E0B' },
                            ]}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                          >
                            {/* Needs Cell children for colors */}
                            <Cell fill="#10B981" />
                            <Cell fill="#3B82F6" />
                            <Cell fill="#F59E0B" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex justify-center gap-4 text-xs mt-2">
                      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-primary mr-1" /> Equity {mutation.data.assetAllocation.equity}%</div>
                      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1" /> Debt {mutation.data.assetAllocation.debt}%</div>
                      <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-accent mr-1" /> Gold {mutation.data.assetAllocation.gold}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals Table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-border/50">
                  <h3 className="font-display font-bold text-lg">Goal-wise SIP Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr>
                        <th className="px-6 py-3">Goal</th>
                        <th className="px-6 py-3">Target Amount</th>
                        <th className="px-6 py-3">Year</th>
                        <th className="px-6 py-3">Required SIP/mo</th>
                        <th className="px-6 py-3">Funding Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mutation.data.sipGoals.map((g, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="px-6 py-4 font-medium text-foreground">{g.goalName}</td>
                          <td className="px-6 py-4">{formatINR(g.targetAmount)}</td>
                          <td className="px-6 py-4">{g.targetYear}</td>
                          <td className="px-6 py-4 font-bold text-primary">{formatINR(g.requiredSip)}</td>
                          <td className="px-6 py-4 text-destructive">{g.fundingGap > 0 ? formatINR(g.fundingGap) : 'On Track'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Checklist */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <h3 className="font-display font-bold text-lg mb-6 flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2 text-primary" /> Action Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mutation.data.actionChecklist.map((task, i) => (
                    <label key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-background/50 cursor-pointer hover:border-primary/50 transition-colors">
                      <input type="checkbox" className="mt-1 w-4 h-4 rounded border-muted text-primary focus:ring-primary bg-background" />
                      <span className="text-sm text-muted-foreground leading-snug">{task}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
