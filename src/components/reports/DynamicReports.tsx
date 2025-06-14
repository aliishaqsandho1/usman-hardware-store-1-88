
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend,
  TooltipProps
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
  RefreshCw
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
      
      // Fallback to demo data structure matching API
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

  const generateCashFlowData = () => {
    if (!dashboardStats) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      inflow: dashboardStats.cashFlow.monthlyInflows + (Math.random() * 50000 - 25000),
      outflow: dashboardStats.cashFlow.monthlyOutflows + (Math.random() * 30000 - 15000),
      net: dashboardStats.cashFlow.netCashFlow + (Math.random() * 20000 - 10000)
    }));
  };

  const generateCategoryData = () => {
    if (!dashboardStats?.performance.categoryPerformance) return [];
    
    const total = dashboardStats.performance.categoryPerformance.reduce((sum, cat) => sum + cat.revenue, 0);
    
    return dashboardStats.performance.categoryPerformance.map((cat, index) => ({
      name: cat.category,
      value: Math.round((cat.revenue / total) * 100),
      revenue: cat.revenue,
      color: COLORS[index % COLORS.length],
      percentage: Math.round((cat.revenue / total) * 100) // Add percentage property for PDF export
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

    const categoryData = generateCategoryData();
    
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
      cashFlow: generateCashFlowData(),
      categoryData: categoryData.map(cat => ({
        name: cat.name,
        revenue: cat.revenue,
        percentage: cat.percentage
      }))
    };

    generateReportPDF(reportData);
    setShowExportModal(false);
    
    toast({
      title: "Export Successful",
      description: `${reportType} report has been exported as PDF`,
    });
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue,
    bgGradient = "from-blue-500 to-blue-600",
    iconBg = "bg-blue-100",
    iconColor = "text-blue-600"
  }) => (
    <div className={`rounded-lg bg-gradient-to-br ${bgGradient} p-4 text-white shadow-lg h-24`}>
      <div className="flex items-center justify-between h-full">
        <div className="flex-1">
          <p className="text-xs font-medium text-white/90 mb-1">{title}</p>
          <p className="text-lg font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/80">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-1 text-xs text-white/90">
              {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
               trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <div className="bg-white/20 p-2 rounded-full shadow-lg ml-3">
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Revenue: {formatCurrency(data.revenue)}</p>
          <p className="text-sm text-gray-600">Share: {data.value}%</p>
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
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  const cashFlowData = generateCashFlowData();
  const categoryData = generateCategoryData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Reports</h2>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
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
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Compact Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(dashboardStats?.financial?.todayRevenue || 0)}
          subtitle="vs yesterday"
          icon={DollarSign}
          trend={dashboardStats?.financial?.revenueGrowth && dashboardStats.financial.revenueGrowth > 0 ? "up" : "down"}
          trendValue={`${dashboardStats?.financial?.revenueGrowth || 0}%`}
          bgGradient="from-green-500 to-green-600"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        
        <StatCard
          title="Today's Orders"
          value={dashboardStats?.sales?.todaySales || 0}
          subtitle={`Avg: ${formatCurrency(dashboardStats?.sales?.avgOrderValue || 0)}`}
          icon={ShoppingCart}
          trend="up"
          trendValue="+8.3%"
          bgGradient="from-blue-500 to-blue-600"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        
        <StatCard
          title="Low Stock Items"
          value={dashboardStats?.inventory?.lowStockItems || 0}
          subtitle={`Value: ${formatCurrency(75000)}`}
          icon={Package2}
          trend="down"
          trendValue="Requires attention"
          bgGradient="from-red-500 to-red-600"
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        
        <StatCard
          title="Total Customers"
          value={dashboardStats?.customers?.totalCustomers || 0}
          subtitle={`Avg: ${formatCurrency(dashboardStats?.customers?.avgCustomerValue || 0)}`}
          icon={Users}
          trend="up"
          trendValue="+5.2%"
          bgGradient="from-purple-500 to-purple-600"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts Section with proper spacing */}
      <div className="mt-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Cash Flow Analysis */}
              <Card className="col-span-1 shadow-lg border-0">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Cash Flow Analysis
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Monthly inflows vs outflows (PKR)</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-white">
                        Net Positive
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setExportReportType('cash-flow');
                          setShowExportModal(true);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: '#666' }}
                        stroke="#666"
                        axisLine={{ stroke: '#ddd' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#666' }}
                        stroke="#666"
                        axisLine={{ stroke: '#ddd' }}
                        tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                        iconType="circle"
                      />
                      <Bar 
                        dataKey="inflow" 
                        name="Cash Inflow"
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]}
                        opacity={0.9}
                      />
                      <Bar 
                        dataKey="outflow" 
                        name="Cash Outflow"
                        fill="#ef4444" 
                        radius={[4, 4, 0, 0]}
                        opacity={0.9}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Enhanced Sales by Category */}
              <Card className="col-span-1 shadow-lg border-0">
                <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Package2 className="h-5 w-5 text-green-600" />
                        Sales by Category
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Revenue distribution across categories</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-white">
                        {categoryData.length} Categories
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setExportReportType('category-sales');
                          setShowExportModal(true);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Advanced Analytics</CardTitle>
                    <p className="text-sm text-gray-600">Detailed performance metrics and trends</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setExportReportType('analytics');
                      setShowExportModal(true);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center text-gray-500 py-8">Advanced analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Detailed Reports</CardTitle>
                    <p className="text-sm text-gray-600">Generate and export comprehensive reports</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setExportReportType('comprehensive');
                      setShowExportModal(true);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Full Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      setExportReportType('financial');
                      setShowExportModal(true);
                    }}
                  >
                    <DollarSign className="h-6 w-6" />
                    Financial Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      setExportReportType('sales');
                      setShowExportModal(true);
                    }}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    Sales Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      setExportReportType('inventory');
                      setShowExportModal(true);
                    }}
                  >
                    <Package2 className="h-6 w-6" />
                    Inventory Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                <CardTitle>Business Notifications</CardTitle>
                <p className="text-sm text-gray-600">Important alerts and notifications</p>
              </CardHeader>
              <CardContent className="p-6">
                {dashboardStats?.alerts && dashboardStats.alerts.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.alerts.map((alert, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        alert.type === 'critical' ? 'border-red-500 bg-red-50' :
                        alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <h4 className="font-semibold">{alert.title}</h4>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No notifications at this time</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Report</DialogTitle>
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
