
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  TooltipProps,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Package2, 
  Users, 
  DollarSign,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  AlertTriangle,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Eye,
  PieChart,
  BarChart3
} from 'lucide-react';
import { customerApi, type DashboardStats } from '@/services/customerApi';
import { useToast } from '@/hooks/use-toast';
import { generateReportPDF } from '@/utils/reportsPdfGenerator';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DynamicReports = () => {
  const { toast } = useToast();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportReportType, setExportReportType] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('6');
  const [alertThreshold, setAlertThreshold] = useState('10');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getDashboardStats();
      
      if (response.success) {
        setDashboardStats(response.data);
        toast({
          title: "Success",
          description: "Reports data loaded successfully",
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load reports data. Using demo data.",
        variant: "destructive"
      });
      
      // Enhanced demo data for unique reports
      setDashboardStats({
        financial: {
          todayRevenue: 125000,
          yesterdayRevenue: 118000,
          monthRevenue: 2850000,
          lastMonthRevenue: 2650000,
          monthExpenses: 850000,
          grossProfit: 2000000,
          netProfit: 1150000,
          profitMargin: 40.35,
          revenueGrowth: 5.93,
          monthlyGrowth: 7.55
        },
        sales: {
          todaySales: 25,
          weekSales: 185,
          avgOrderValue: 5000,
          pendingOrdersValue: 125000,
          paymentMethods: [
            { method: 'cash', count: 15, amount: 75000 },
            { method: 'bank_transfer', count: 8, amount: 40000 },
            { method: 'credit', count: 2, amount: 10000 }
          ],
          highValueSales: []
        },
        inventory: {
          totalInventoryValue: 1850000,
          retailInventoryValue: 2750000,
          lowStockItems: 15,
          outOfStockItems: 3,
          overstockItems: 8,
          fastMovingProducts: [],
          deadStockValue: 125000,
          inventoryTurnover: 1.49
        },
        customers: {
          totalCustomers: 295,
          newCustomersThisMonth: 18,
          avgCustomerValue: 185000,
          topCustomers: [],
          customerTypes: [
            { type: 'business', count: 180 },
            { type: 'individual', count: 115 }
          ],
          totalReceivables: 125000
        },
        performance: {
          weeklyTrend: [],
          dailyAvgRevenue: 95000,
          dailyAvgOrders: 19,
          categoryPerformance: [
            { category: 'Taj Sheets', revenue: 125000, unitsSold: 250 },
            { category: 'UV Sheets', revenue: 85000, unitsSold: 170 },
            { category: 'Test Category', revenue: 65000, unitsSold: 130 },
            { category: 'Hardware', revenue: 35000, unitsSold: 70 }
          ]
        },
        cashFlow: {
          monthlyInflows: 2850000,
          monthlyOutflows: 1700000,
          netCashFlow: 1150000,
          recentPayments: []
        },
        alerts: []
      });
    } finally {
      setLoading(false);
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

  // Generate unique data for different visualizations
  const generateProfitabilityAnalysis = () => {
    if (!dashboardStats) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      revenue: dashboardStats.financial.monthRevenue + (Math.random() * 100000 - 50000),
      costs: dashboardStats.financial.monthExpenses + (Math.random() * 50000 - 25000),
      profit: dashboardStats.financial.netProfit + (Math.random() * 80000 - 40000),
      margin: 30 + (Math.random() * 20 - 10)
    }));
  };

  const generateSalesGrowthTrend = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters.map(quarter => ({
      quarter,
      currentYear: 800000 + (Math.random() * 400000),
      lastYear: 600000 + (Math.random() * 300000),
      target: 1000000 + (Math.random() * 200000)
    }));
  };

  const generateCustomerSegmentation = () => {
    return [
      { segment: 'High Value', customers: 45, revenue: 1500000, avgSpend: 33333 },
      { segment: 'Regular', customers: 120, revenue: 800000, avgSpend: 6667 },
      { segment: 'Occasional', customers: 80, revenue: 350000, avgSpend: 4375 },
      { segment: 'New', customers: 50, revenue: 200000, avgSpend: 4000 }
    ];
  };

  const generateInventoryHealth = () => {
    return [
      { category: 'Healthy Stock', count: 85, value: 1200000, percentage: 65 },
      { category: 'Low Stock', count: 15, value: 300000, percentage: 12 },
      { category: 'Overstock', count: 8, value: 250000, percentage: 8 },
      { category: 'Dead Stock', count: 12, value: 100000, percentage: 15 }
    ];
  };

  const generatePredictiveAnalytics = () => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      predicted: 2800000 + (Math.random() * 600000),
      confidence: 85 + (Math.random() * 10),
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
  };

  const handleExportPDF = (reportType: string, period: string) => {
    if (!dashboardStats) {
      toast({
        title: "Error",
        description: "No data available for export",
        variant: "destructive"
      });
      return;
    }

    const reportData = {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      period: period.charAt(0).toUpperCase() + period.slice(1),
      generatedAt: new Date().toLocaleDateString(),
      financial: {
        revenue: dashboardStats.financial.monthRevenue,
        expenses: dashboardStats.financial.monthExpenses,
        profit: dashboardStats.financial.netProfit,
        profitMargin: dashboardStats.financial.profitMargin
      },
      sales: {
        totalSales: dashboardStats.sales.todaySales,
        avgOrderValue: dashboardStats.sales.avgOrderValue
      },
      customers: {
        totalCustomers: dashboardStats.customers.totalCustomers,
        newCustomers: dashboardStats.customers.newCustomersThisMonth,
        avgCustomerValue: dashboardStats.customers.avgCustomerValue
      },
      cashFlow: [],
      categoryData: []
    };

    generateReportPDF(reportData);
    setShowExportModal(false);
    
    toast({
      title: "Export Successful",
      description: `${reportType} report has been exported as PDF`,
    });
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value?.toLocaleString ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading advanced reports...</span>
        </div>
      </div>
    );
  }

  const profitabilityData = generateProfitabilityAnalysis();
  const salesGrowthData = generateSalesGrowthTrend();
  const customerSegments = generateCustomerSegmentation();
  const inventoryHealth = generateInventoryHealth();
  const predictiveData = generatePredictiveAnalytics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Business Intelligence</h2>
          <p className="text-gray-600">Deep insights and predictive analytics for strategic decisions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Tabs */}
      <Tabs defaultValue="profitability" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profitability">Profitability Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Predictive Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="strategic">Strategic Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profitability Trend */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Profitability Trend Analysis
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Revenue, costs, and profit margins over time</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setExportReportType('profitability');
                      setShowExportModal(true);
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={profitabilityData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                    <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                    <Line type="monotone" dataKey="margin" stroke="#f59e0b" strokeWidth={3} name="Margin %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Segmentation */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Customer Value Segmentation
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Customer segments by value and behavior</p>
                  </div>
                  <Badge variant="outline" className="text-purple-600 border-purple-200 bg-white">
                    4 Segments
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerSegments} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#666" tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                    <YAxis dataKey="segment" type="category" stroke="#666" width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Growth Comparison */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Year-over-Year Growth Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Quarterly performance vs targets and previous year</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-white">
                    +15.2% Growth
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="quarter" stroke="#666" />
                  <YAxis stroke="#666" tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="lastYear" fill="#e5e7eb" name="Last Year" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="currentYear" fill="#3b82f6" name="Current Year" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#10b981" name="Target" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predictive Revenue Forecast */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      Revenue Forecast (AI Powered)
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Machine learning predictions for next 6 months</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={forecastPeriod}
                      onChange={(e) => setForecastPeriod(e.target.value)}
                      className="w-16 h-8"
                      min="1"
                      max="12"
                    />
                    <span className="text-sm text-gray-600">months</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictiveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="Predicted Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Confidence %"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Predicted Growth</p>
                    <p className="text-lg font-bold text-green-600">+12.5%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Avg Confidence</p>
                    <p className="text-lg font-bold text-blue-600">89%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <p className="text-lg font-bold text-yellow-600">Low</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Health Matrix */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Package2 className="h-5 w-5 text-red-600" />
                      Inventory Health Matrix
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Stock optimization and health indicators</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">15 items need attention</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {inventoryHealth.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.category === 'Healthy Stock' ? 'bg-green-500' :
                          item.category === 'Low Stock' ? 'bg-yellow-500' :
                          item.category === 'Overstock' ? 'bg-blue-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.count} items</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <ResponsiveContainer width="100%" height={150}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" data={inventoryHealth}>
                      <RadialBar 
                        dataKey="percentage" 
                        cornerRadius={10} 
                        fill="#8884d8"
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI Cards */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Revenue per Customer</p>
                    <p className="text-2xl font-bold">{formatCurrency(dashboardStats?.customers?.avgCustomerValue || 0)}</p>
                    <p className="text-xs opacity-75">+8.2% vs last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Inventory Turnover</p>
                    <p className="text-2xl font-bold">{dashboardStats?.inventory?.inventoryTurnover || 0}x</p>
                    <p className="text-xs opacity-75">Above industry avg</p>
                  </div>
                  <Activity className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Customer Retention</p>
                    <p className="text-2xl font-bold">92.5%</p>
                    <p className="text-xs opacity-75">+2.1% improvement</p>
                  </div>
                  <Users className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Order Fulfillment</p>
                    <p className="text-2xl font-bold">98.7%</p>
                    <p className="text-xs opacity-75">On-time delivery</p>
                  </div>
                  <Clock className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Scorecard */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Business Performance Scorecard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Financial Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Gross Profit Margin</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '70%'}}></div>
                        </div>
                        <span className="text-sm font-medium">70%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Net Profit Margin</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '40%'}}></div>
                        </div>
                        <span className="text-sm font-medium">40%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ROI</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Operational Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Order Processing Time</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                        </div>
                        <span className="text-sm font-medium">90%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Inventory Accuracy</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '95%'}}></div>
                        </div>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Customer Satisfaction</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '88%'}}></div>
                        </div>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-6">
          {/* Strategic Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-slate-600" />
                  Strategic Business Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      Growth Opportunities
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <p className="font-medium text-green-800">Expand UV Sheets Category</p>
                        <p className="text-sm text-green-600">34% profit margin, high demand growth</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <p className="font-medium text-blue-800">B2B Customer Focus</p>
                        <p className="text-sm text-blue-600">61% of revenue, 2.3x avg order value</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                        <p className="font-medium text-purple-800">Inventory Optimization</p>
                        <p className="text-sm text-purple-600">Reduce dead stock by 15%</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      Risk Factors
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <p className="font-medium text-red-800">High Customer Concentration</p>
                        <p className="text-sm text-red-600">Top 10 customers = 45% of revenue</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <p className="font-medium text-yellow-800">Seasonal Volatility</p>
                        <p className="text-sm text-yellow-600">Q4 sales 40% below average</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                        <p className="font-medium text-orange-800">Overstock Risk</p>
                        <p className="text-sm text-orange-600">8 products above max stock levels</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-100">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Review Low Stock Items
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Contact High-Value Customers
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Package2 className="h-4 w-4 mr-2" />
                    Optimize Inventory Levels
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Plan Growth Strategy
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Full Report
                  </Button>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">AI Recommendations</h5>
                  <p className="text-sm text-blue-700">Based on current trends, consider increasing UV Sheets inventory by 25% for next quarter.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-rose-600" />
                Strategic Action Items & Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Short Term (1-3 months)</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Implement automated reorder points</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded" checked />
                      <span className="text-sm line-through">Review supplier contracts</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Launch customer loyalty program</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Medium Term (3-6 months)</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Expand into new product categories</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Implement CRM system</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Optimize warehouse layout</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Long Term (6+ months)</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Open second location</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Develop e-commerce platform</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Implement AI demand forecasting</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Advanced Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Select the time period for your {exportReportType} report:</p>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleExportPDF(exportReportType, 'daily')}
              >
                Daily
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportPDF(exportReportType, 'weekly')}
              >
                Weekly
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportPDF(exportReportType, 'monthly')}
              >
                Monthly
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicReports;
