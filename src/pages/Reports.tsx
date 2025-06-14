
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Target, Sparkles, RefreshCw, DollarSign, Package, Users, BarChart3, Activity, Zap, Eye, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GEMINI_API_KEY = "AIzaSyDscgxHRLCy4suVBigT1g_pXMnE7tH_Ejw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface AIInsight {
  type: 'insight' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact?: string;
  actionable?: boolean;
}

interface EnhancedStats {
  financial: {
    todayRevenue: number;
    monthRevenue: number;
    profitMargin: number;
    revenueGrowth: number;
    netProfit: number;
    grossProfit: number;
  };
  sales: {
    todaySales: number;
    weekSales: number;
    avgOrderValue: number;
    highValueSales: Array<{
      orderNumber: string;
      amount: number;
      customer: string;
      date: string;
    }>;
  };
  inventory: {
    totalInventoryValue: number;
    lowStockItems: number;
    deadStockValue: number;
    inventoryTurnover: number;
    fastMovingProducts: Array<{
      name: string;
      sold: number;
      remaining: number;
    }>;
  };
  customers: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    avgCustomerValue: number;
    totalReceivables: number;
  };
  cashFlow: {
    netCashFlow: number;
    monthlyInflows: number;
    monthlyOutflows: number;
  };
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    action: string;
  }>;
}

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-blue-200 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Generating AI Insights
        </h3>
        <p className="text-gray-600 mb-4">
          Our AI is analyzing your business data to provide intelligent insights and recommendations.
        </p>
        <div className="space-y-2">
          <Progress value={75} className="w-full" />
          <p className="text-sm text-gray-500">Processing business metrics...</p>
        </div>
      </div>
    </div>
  </div>
);

const StatsCard = ({ title, value, icon: Icon, trend, color, subtitle }: {
  title: string;
  value: string | number;
  icon: any;
  trend?: number;
  color: string;
  subtitle?: string;
}) => (
  <Card className={`border-0 shadow-lg bg-gradient-to-br ${color}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="text-white">
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
          {trend !== undefined && (
            <div className="flex items-center mt-1">
              {trend >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              <span className="text-xs">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <Icon className="h-8 w-8 text-white opacity-80" />
      </div>
    </CardContent>
  </Card>
);

const Reports = () => {
  const { toast } = useToast();
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [customQuery, setCustomQuery] = useState("");

  // Fetch enhanced stats from the API
  const { data: enhancedStats, isLoading: statsLoading } = useQuery({
    queryKey: ['enhanced-stats'],
    queryFn: async () => {
      const response = await fetch('https://zaidawn.site/wp-json/ims/v1/dashboard/enhanced-stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const generateAIInsights = async (customPrompt?: string) => {
    if (!enhancedStats?.data) return;

    setIsGeneratingInsights(true);
    try {
      const businessData: EnhancedStats = enhancedStats.data;
      
      const prompt = customPrompt || `
You are an expert business analyst providing actionable insights for a growing business. Analyze this comprehensive business data and provide strategic recommendations.

Current Business Performance:
💰 Financial Health:
- Today's Revenue: Rs.${businessData.financial?.todayRevenue || 0}
- Monthly Revenue: Rs.${businessData.financial?.monthRevenue || 0}
- Net Profit: Rs.${businessData.financial?.netProfit || 0}
- Profit Margin: ${businessData.financial?.profitMargin || 0}%
- Revenue Growth: ${businessData.financial?.revenueGrowth || 0}%

📊 Sales Performance:
- Today's Sales: ${businessData.sales?.todaySales || 0}
- Weekly Sales: ${businessData.sales?.weekSales || 0}
- Average Order Value: Rs.${businessData.sales?.avgOrderValue || 0}
- Top Sales: ${businessData.sales?.highValueSales?.slice(0, 3).map(s => `Rs.${s.amount} (${s.customer})`).join(', ') || 'No recent high-value sales'}

📦 Inventory Status:
- Total Inventory Value: Rs.${businessData.inventory?.totalInventoryValue || 0}
- Low Stock Items: ${businessData.inventory?.lowStockItems || 0}
- Dead Stock Value: Rs.${businessData.inventory?.deadStockValue || 0}
- Inventory Turnover: ${businessData.inventory?.inventoryTurnover || 0}
- Fast Moving: ${businessData.inventory?.fastMovingProducts?.slice(0, 3).map(p => `${p.name} (${p.sold} sold)`).join(', ') || 'No data'}

👥 Customer Insights:
- Total Customers: ${businessData.customers?.totalCustomers || 0}
- New This Month: ${businessData.customers?.newCustomersThisMonth || 0}
- Average Customer Value: Rs.${businessData.customers?.avgCustomerValue || 0}
- Outstanding Receivables: Rs.${businessData.customers?.totalReceivables || 0}

💸 Cash Flow:
- Net Cash Flow: Rs.${businessData.cashFlow?.netCashFlow || 0}
- Monthly Inflows: Rs.${businessData.cashFlow?.monthlyInflows || 0}
- Monthly Outflows: Rs.${businessData.cashFlow?.monthlyOutflows || 0}

🚨 Active Alerts: ${businessData.alerts?.length || 0} critical items need attention

Provide exactly 6-8 actionable insights in this JSON format:
[
  {
    "type": "insight|recommendation|alert|opportunity",
    "title": "Brief, impactful title",
    "content": "Detailed, actionable insight with specific numbers and recommendations",
    "priority": "high|medium|low",
    "category": "Financial|Sales|Inventory|Customer|Operations",
    "impact": "Potential impact description",
    "actionable": true
  }
]

Focus on:
1. Critical issues requiring immediate attention
2. Revenue optimization opportunities  
3. Cost reduction strategies
4. Customer retention and growth
5. Inventory optimization
6. Cash flow improvements
7. Strategic growth initiatives

Make each insight specific, actionable, and valuable for decision-making. Use Pakistani Rupees (Rs.) for currency.
`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI insights');
      }

      const result = await response.json();
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiResponse) {
        try {
          const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const insights = JSON.parse(jsonMatch[0]);
            setAiInsights(insights);
          } else {
            // Fallback parsing
            const lines = aiResponse.split('\n').filter(line => line.trim());
            const fallbackInsights = lines.slice(0, 6).map((line, index) => ({
              type: ['insight', 'recommendation', 'alert', 'opportunity'][index % 4],
              title: `Business Intelligence ${index + 1}`,
              content: line.trim(),
              priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
              category: ['Financial', 'Sales', 'Inventory', 'Customer', 'Operations'][index % 5],
              impact: 'Significant business impact expected',
              actionable: true
            }));
            setAiInsights(fallbackInsights);
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          throw new Error('Invalid AI response format');
        }
      }

      toast({
        title: "Insights Generated Successfully",
        description: "Your business intelligence report is ready with actionable recommendations.",
      });

    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  useEffect(() => {
    if (enhancedStats?.data && aiInsights.length === 0) {
      generateAIInsights();
    }
  }, [enhancedStats]);

  const handleCustomQuery = async () => {
    if (!customQuery.trim()) return;
    await generateAIInsights(customQuery);
    setCustomQuery("");
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Brain className="h-5 w-5" />;
      case 'recommendation': return <Lightbulb className="h-5 w-5" />;
      case 'alert': return <AlertTriangle className="h-5 w-5" />;
      case 'opportunity': return <Target className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insight': return 'from-blue-500 to-blue-600';
      case 'recommendation': return 'from-purple-500 to-purple-600';
      case 'alert': return 'from-red-500 to-red-600';
      case 'opportunity': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (statsLoading) {
    return <LoadingOverlay />;
  }

  return (
    <>
      {isGeneratingInsights && <LoadingOverlay />}
      
      <div className="flex-1 p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Brain className="h-10 w-10 text-blue-600" />
                Business Intelligence Hub
              </h1>
              <p className="text-slate-600 text-lg">AI-powered insights and strategic recommendations</p>
            </div>
          </div>
          <Button 
            onClick={() => generateAIInsights()}
            disabled={isGeneratingInsights}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            size="lg"
          >
            {isGeneratingInsights ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 mr-2" />
            )}
            {isGeneratingInsights ? 'Generating...' : 'Refresh Insights'}
          </Button>
        </div>

        {/* Business Metrics Overview */}
        {enhancedStats?.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Monthly Revenue"
              value={formatCurrency(enhancedStats.data.financial.monthRevenue)}
              icon={DollarSign}
              trend={enhancedStats.data.financial.revenueGrowth}
              color="from-emerald-500 to-emerald-600"
              subtitle={`Profit: ${formatCurrency(enhancedStats.data.financial.netProfit)}`}
            />
            <StatsCard
              title="Weekly Sales"
              value={enhancedStats.data.sales.weekSales}
              icon={BarChart3}
              color="from-blue-500 to-blue-600"
              subtitle={`Avg Order: ${formatCurrency(enhancedStats.data.sales.avgOrderValue)}`}
            />
            <StatsCard
              title="Inventory Value"
              value={formatCurrency(enhancedStats.data.inventory.totalInventoryValue)}
              icon={Package}
              color="from-purple-500 to-purple-600"
              subtitle={`${enhancedStats.data.inventory.lowStockItems} items low stock`}
            />
            <StatsCard
              title="Total Customers"
              value={enhancedStats.data.customers.totalCustomers}
              icon={Users}
              color="from-orange-500 to-orange-600"
              subtitle={`${enhancedStats.data.customers.newCustomersThisMonth} new this month`}
            />
          </div>
        )}

        {/* Custom Query Section */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-indigo-800 flex items-center gap-3">
              <Brain className="h-6 w-6" />
              Ask Our Business AI Anything
            </CardTitle>
            <p className="text-indigo-600">Get personalized insights about your business performance</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Ask about revenue trends, inventory optimization, customer insights, or any business question..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomQuery()}
                className="flex-1 h-12 text-lg"
              />
              <Button 
                onClick={handleCustomQuery}
                disabled={isGeneratingInsights || !customQuery.trim()}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-8"
                size="lg"
              >
                <Zap className="h-5 w-5 mr-2" />
                Ask AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="h-6 w-6 text-blue-600" />
              Strategic Business Insights
            </h2>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {aiInsights.length} Active Insights
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiInsights.map((insight, index) => (
              <Card key={index} className="h-full hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${getTypeColor(insight.type)}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${getTypeColor(insight.type)} text-white shadow-lg`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                          {insight.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(insight.priority)} variant="default">
                            {insight.priority.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500 font-medium">
                            {insight.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    {insight.content}
                  </p>
                  
                  {insight.impact && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">Expected Impact</span>
                      </div>
                      <p className="text-sm text-blue-800">{insight.impact}</p>
                    </div>
                  )}
                  
                  {insight.actionable && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Actionable Recommendation</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {!isGeneratingInsights && aiInsights.length === 0 && (
          <Card className="text-center py-16 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent>
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Ready to Generate Insights
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    Click the button below to generate AI-powered business intelligence and strategic recommendations.
                  </p>
                </div>
                <Button 
                  onClick={() => generateAIInsights()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Business Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" />
            Powered by advanced AI technology for intelligent business decisions
          </p>
        </div>
      </div>
    </>
  );
};

export default Reports;
