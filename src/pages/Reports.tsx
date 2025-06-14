
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Target, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GEMINI_API_KEY = "AIzaSyDscgxHRLCy4suVBigT1g_pXMnE7tH_Ejw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface AIInsight {
  type: 'insight' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

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
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const generateAIInsights = async (customPrompt?: string) => {
    if (!enhancedStats?.data) return;

    setIsGeneratingInsights(true);
    try {
      const businessData = enhancedStats.data;
      
      const prompt = customPrompt || `
You are a business intelligence analyst providing insights for an inventory management system. Analyze the following business data and provide actionable insights, recommendations, and alerts.

Business Data:
- Financial: Revenue today: Rs.${businessData.financial?.todayRevenue || 0}, Month: Rs.${businessData.financial?.monthRevenue || 0}, Profit Margin: ${businessData.financial?.profitMargin || 0}%, Revenue Growth: ${businessData.financial?.revenueGrowth || 0}%
- Sales: Today: ${businessData.sales?.todaySales || 0}, Week: ${businessData.sales?.weekSales || 0}, Avg Order Value: Rs.${businessData.sales?.avgOrderValue || 0}
- Inventory: Total Value: Rs.${businessData.inventory?.totalInventoryValue || 0}, Low Stock Items: ${businessData.inventory?.lowStockItems || 0}, Dead Stock Value: Rs.${businessData.inventory?.deadStockValue || 0}, Turnover: ${businessData.inventory?.inventoryTurnover || 0}
- Customers: Total: ${businessData.customers?.totalCustomers || 0}, New This Month: ${businessData.customers?.newCustomersThisMonth || 0}
- Cash Flow: Net: Rs.${businessData.cashFlow?.netCashFlow || 0}, Inflows: Rs.${businessData.cashFlow?.monthlyInflows || 0}, Outflows: Rs.${businessData.cashFlow?.monthlyOutflows || 0}

Provide exactly 6-8 insights in this JSON format:
[
  {
    "type": "insight|recommendation|alert|opportunity",
    "title": "Brief title",
    "content": "Detailed actionable insight in 2-3 sentences",
    "priority": "high|medium|low",
    "category": "Financial|Sales|Inventory|Customer|Operations"
  }
]

Focus on:
1. Critical business issues that need immediate attention
2. Growth opportunities based on trends
3. Cost optimization recommendations
4. Inventory management insights
5. Customer behavior patterns
6. Cash flow management
7. Performance improvements

Make insights specific, actionable, and valuable for business decision-making. Use currency in Pakistani Rupees (Rs.).
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
          // Extract JSON from the response
          const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const insights = JSON.parse(jsonMatch[0]);
            setAiInsights(insights);
          } else {
            // Fallback: parse the response as plain text and create insights
            const lines = aiResponse.split('\n').filter(line => line.trim());
            const fallbackInsights = lines.slice(0, 6).map((line, index) => ({
              type: index % 2 === 0 ? 'insight' : 'recommendation',
              title: `Business Insight ${index + 1}`,
              content: line.trim(),
              priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
              category: ['Financial', 'Sales', 'Inventory', 'Customer', 'Operations'][index % 5]
            }));
            setAiInsights(fallbackInsights);
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          throw new Error('Invalid AI response format');
        }
      }

      toast({
        title: "AI Insights Generated",
        description: "Fresh business insights have been generated based on your latest data.",
      });

    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Generate insights on component mount and when data changes
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insight': return 'text-blue-600';
      case 'recommendation': return 'text-purple-600';
      case 'alert': return 'text-red-600';
      case 'opportunity': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              AI Business Intelligence
            </h1>
            <p className="text-slate-600">AI-powered insights and recommendations for your business</p>
          </div>
        </div>
        <Button 
          onClick={() => generateAIInsights()}
          disabled={isGeneratingInsights}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGeneratingInsights ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {isGeneratingInsights ? 'Generating...' : 'Refresh Insights'}
        </Button>
      </div>

      {/* Custom Query Section */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Ask AI About Your Business
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Ask specific questions about your business performance, trends, or get recommendations..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomQuery()}
              className="flex-1"
            />
            <Button 
              onClick={handleCustomQuery}
              disabled={isGeneratingInsights || !customQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ask AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Grid */}
      {statsLoading || isGeneratingInsights ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiInsights.map((insight, index) => (
            <Card key={index} className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-blue-50 ${getTypeColor(insight.type)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                        {insight.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                          {insight.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500 capitalize">
                          {insight.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {insight.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!statsLoading && !isGeneratingInsights && aiInsights.length === 0 && (
        <Card className="text-center py-16">
          <CardContent>
            <Brain className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No AI Insights Available
            </h3>
            <p className="text-slate-600 mb-6">
              Click "Refresh Insights" to generate AI-powered business intelligence.
            </p>
            <Button 
              onClick={() => generateAIInsights()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-slate-500 py-4">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          Powered by advanced AI technology for intelligent business insights
        </p>
      </div>
    </div>
  );
};

export default Reports;
