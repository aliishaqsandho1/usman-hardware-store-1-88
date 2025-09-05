import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2,
  VolumeX,
  Zap,
  Brain,
  Stars,
  Wand2,
  Circle,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GEMINI_API_KEY = "AIzaSyDscgxHRLCy4suVBigT1g_pXMnE7tH_Ejw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface EnhancedStats {
  financial: {
    todayRevenue: number;
    monthRevenue: number;
    profitMargin: number;
    revenueGrowth: number;
    netProfit: number;
    grossProfit: number;
    monthExpenses: number;
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

const Reports = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your advanced AI business assistant. I have real-time access to all your business data including sales, inventory, finances, and customer insights. Ask me anything about your business performance, get predictive analytics, or receive strategic recommendations.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatAIResponse = (text: string) => {
    // Clean the text first - remove extra asterisks and clean up formatting
    let cleanText = text.replace(/\*{3,}/g, '**'); // Replace 3+ asterisks with 2
    cleanText = cleanText.replace(/\*{2}\s*\*{2}/g, '**'); // Remove empty bold tags
    
    // Split text into paragraphs
    const paragraphs = cleanText.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Skip empty paragraphs
      if (!paragraph.trim()) return null;
      
      // Check if it's a header (starts with ** and ends with **)
      if (paragraph.match(/^\*\*[^*]+\*\*$/)) {
        const headerText = paragraph.replace(/^\*\*|\*\*$/g, '').trim();
        return (
          <h3 key={index} className="text-lg font-semibold text-cyan-400 mb-3 mt-4 first:mt-0 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-cyan-400" />
            {headerText}
          </h3>
        );
      }
      
      // Check if it's a list item (starts with * or -)
      if (paragraph.match(/^[\*\-]\s/)) {
        const listItems = paragraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="space-y-2 mb-4 ml-4">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-300 flex items-start">
                <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>{item.replace(/^[\*\-]\s/, '').trim()}</span>
              </li>
            ))}
          </ul>
        );
      }
      
      // Check if it's a numbered list
      if (paragraph.match(/^\d+\./)) {
        const listItems = paragraph.split('\n').filter(item => item.trim());
        return (
          <ol key={index} className="space-y-2 mb-4 ml-4">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-300 flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium mr-3 flex-shrink-0 mt-0.5">
                  {itemIndex + 1}
                </span>
                <span>{item.replace(/^\d+\.\s?/, '').trim()}</span>
              </li>
            ))}
          </ol>
        );
      }
      
      // Regular paragraph with inline formatting
      if (paragraph.trim()) {
        // Format bold text (**text**) - be more careful with replacement
        let formattedText = paragraph.replace(/\*\*([^*]+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
        
        return (
          <p 
            key={index} 
            className="text-gray-300 leading-relaxed mb-3"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  const generateBusinessContext = (businessData: EnhancedStats) => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
BUSINESS CONTEXT & CURRENT DATA (as of ${currentDate}):

FINANCIAL OVERVIEW:
- Today's Revenue: ${formatCurrency(businessData.financial?.todayRevenue || 0)}
- Monthly Revenue: ${formatCurrency(businessData.financial?.monthRevenue || 0)}
- Net Profit: ${formatCurrency(businessData.financial?.netProfit || 0)}
- Gross Profit: ${formatCurrency(businessData.financial?.grossProfit || 0)}
- Monthly Expenses: ${formatCurrency(businessData.financial?.monthExpenses || 0)}
- Profit Margin: ${businessData.financial?.profitMargin || 0}%
- Revenue Growth: ${businessData.financial?.revenueGrowth || 0}%

SALES PERFORMANCE:
- Today's Sales: ${businessData.sales?.todaySales || 0} orders
- Weekly Sales: ${businessData.sales?.weekSales || 0} orders
- Average Order Value: ${formatCurrency(businessData.sales?.avgOrderValue || 0)}
- Recent High-Value Sales: ${businessData.sales?.highValueSales?.slice(0, 3).map(s => `${formatCurrency(s.amount)} from ${s.customer}`).join(', ') || 'No recent high-value sales'}

INVENTORY STATUS:
- Total Inventory Value: ${formatCurrency(businessData.inventory?.totalInventoryValue || 0)}
- Low Stock Items: ${businessData.inventory?.lowStockItems || 0} products need attention
- Dead Stock Value: ${formatCurrency(businessData.inventory?.deadStockValue || 0)}
- Inventory Turnover: ${businessData.inventory?.inventoryTurnover || 0}
- Top Selling Products: ${businessData.inventory?.fastMovingProducts?.slice(0, 3).map(p => `${p.name} (${p.sold} sold, ${p.remaining} remaining)`).join(', ') || 'No fast-moving products data'}

CUSTOMER INSIGHTS:
- Total Customers: ${businessData.customers?.totalCustomers || 0}
- New Customers This Month: ${businessData.customers?.newCustomersThisMonth || 0}
- Average Customer Value: ${formatCurrency(businessData.customers?.avgCustomerValue || 0)}
- Outstanding Receivables: ${formatCurrency(businessData.customers?.totalReceivables || 0)}

CASH FLOW:
- Net Cash Flow: ${formatCurrency(businessData.cashFlow?.netCashFlow || 0)}
- Monthly Inflows: ${formatCurrency(businessData.cashFlow?.monthlyInflows || 0)}
- Monthly Outflows: ${formatCurrency(businessData.cashFlow?.monthlyOutflows || 0)}

ALERTS & CRITICAL ISSUES:
${businessData.alerts?.map(alert => `- ${alert.title}: ${alert.message}`).join('\n') || 'No critical alerts'}

BUSINESS TYPE: This appears to be a manufacturing/trading business dealing with wood products, sheets, and building materials based on the product names (MDF, HDX, KMI, ZRK series products).

RESPONSE FORMAT REQUIREMENTS:
- Please format your response using proper headings with ** for main sections
- Use bullet points (*) for lists and recommendations
- Use numbered lists (1., 2., 3.) for step-by-step instructions
- Keep responses well-structured and easy to read
- Use bold text (**text**) for important numbers or key points
- Provide helpful, actionable insights and recommendations based on this current business data
- Keep responses conversational and easy to understand for business owners
- Use Pakistani Rupees (PKR) for all currency references
`;
  };

  const sendMessageToGemini = async (userMessage: string) => {
    if (!enhancedStats?.data) {
      throw new Error('Business data not available');
    }

    const businessContext = generateBusinessContext(enhancedStats.data);
    
    const prompt = `${businessContext}

USER QUESTION: ${userMessage}

Please provide a helpful, well-formatted response based on the current business data above. Use the formatting guidelines specified in the context to make your response clear and professional.`;

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
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response at the moment. Please try again.';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToGemini(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble accessing the information right now. Please check your connection and try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input functionality would be implemented here
    toast({
      title: "Voice Input",
      description: isListening ? "Voice input stopped" : "Voice input started",
    });
  };

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking);
    // Text-to-speech functionality would be implemented here
    toast({
      title: "Voice Output",
      description: isSpeaking ? "Speech stopped" : "Speech started",
    });
  };

  if (statsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-cyan-200 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
          </div>
          <p className="text-xl text-cyan-300 font-medium">Initializing AI Assistant...</p>
          <p className="text-sm text-gray-400 mt-2">Loading business intelligence data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-cyan-500/20 bg-black/20 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <Circle className="h-3 w-3 text-white fill-current" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Nexus AI
                </h1>
                <p className="text-cyan-300 font-medium">Advanced Business Intelligence Assistant</p>
                <p className="text-xs text-gray-400">Powered by Gemini 2.0 Flash</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">Online</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                <Zap className="w-3 h-3 text-blue-300" />
                <span className="text-blue-300 text-sm font-medium">Real-time Data</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSpeech}
                className={`relative text-white hover:bg-white/10 border border-cyan-400/30 ${isSpeaking ? 'bg-cyan-500/20' : ''}`}
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isSpeaking && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                className={`relative text-white hover:bg-white/10 border border-purple-400/30 ${isListening ? 'bg-purple-500/20' : ''}`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isListening && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden relative z-10">
        <ScrollArea className="h-full">
          <div className="max-w-5xl mx-auto p-6 space-y-8 pb-32">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-6 ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {message.type === 'ai' && (
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
                
                <Card className={`max-w-3xl ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-cyan-400/30 backdrop-blur-xl' 
                    : 'bg-black/40 border-gray-700/50 backdrop-blur-xl'
                } shadow-2xl`}>
                  <CardContent className="p-6">
                    {message.type === 'user' ? (
                      <p className="text-white leading-relaxed font-medium">
                        {message.content}
                      </p>
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        {formatAIResponse(message.content)}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <p className={`text-xs ${
                        message.type === 'user' ? 'text-cyan-200' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-400/10 h-6 px-2">
                            <Play className="h-3 w-3 mr-1" />
                            <span className="text-xs">Speak</span>
                          </Button>
                          <Stars className="h-4 w-4 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {message.type === 'user' && (
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-6 justify-start animate-fade-in">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center animate-pulse">
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  </div>
                </div>
                <Card className="bg-black/40 border-gray-700/50 backdrop-blur-xl shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-cyan-300 text-sm font-medium">AI is analyzing your data...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-cyan-500/20 bg-black/20 backdrop-blur-xl shadow-2xl">
        <div className="max-w-5xl mx-auto p-6">
          {/* Quick Action Chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[
              "Show me today's sales performance",
              "What are my top selling products?",
              "Analyze cash flow trends",
              "Revenue forecast for next month",
              "Customer satisfaction insights"
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => setInputMessage(suggestion)}
                className="text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/30 rounded-full whitespace-nowrap text-xs"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask me anything about your business performance, trends, or get strategic insights..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="h-14 text-base bg-black/40 border-cyan-400/30 focus:border-cyan-400 focus:ring-cyan-400/20 text-white placeholder-gray-400 rounded-2xl pr-12 backdrop-blur-xl"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:bg-cyan-400/10 rounded-xl ${isListening ? 'bg-cyan-400/20' : ''}`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
      `}</style>
    </div>
  );
};

export default Reports;
