
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Plus, ArrowUp, ArrowDown, Calendar, TrendingUp, TrendingDown, CreditCard, DollarSign, Users, FileText, Package, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { financeApi, type FinanceOverview, type AccountsReceivable, type Expense } from "@/services/financeApi";

type AccountsPayable = {
  id: number;
  supplierName: string;
  amount: number;
  contactPerson: string;
  phone: string;
  email: string;
  pendingOrders: number;
};

type CashFlowEntry = {
  type: "inflow" | "outflow";
  amount: number;
  reference: string;
  description: string;
  date: string;
};

const Finance = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [receivables, setReceivables] = useState<AccountsReceivable[]>([]);
  const [payables, setPayables] = useState<AccountsPayable[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    fetchFinanceData();
    // eslint-disable-next-line
  }, [period]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);

      // Fetch overview
      const overviewResponse = await financeApi.getOverview(period);
      if (overviewResponse.success) setOverview(overviewResponse.data);

      // Fetch receivables
      const receivablesResponse = await financeApi.getAccountsReceivable({ limit: 10 });
      if (receivablesResponse.success) setReceivables(receivablesResponse.data.receivables);

      // Fetch payables
      const payablesRaw = await fetch(`https://zaidawn.site/wp-json/ims/v1/finance/accounts-payable?limit=10`).then(r => r.json());
      if (payablesRaw.success) setPayables(payablesRaw.data.payables);
      else setPayables([]);

      // Fetch cash flow
      const cfRaw = await fetch(`https://zaidawn.site/wp-json/ims/v1/finance/cash-flow?period=${period}`).then(r => r.json());
      if (cfRaw.success) setCashFlow(cfRaw.data.cashFlow);
      else setCashFlow([]);

      // Fetch expenses
      const expensesResponse = await financeApi.getExpenses({ limit: 10 });
      if (expensesResponse.success) setExpenses(expensesResponse.data.expenses);

    } catch (error) {
      console.error("Error fetching finance data:", error);
      toast({
        title: "Error",
        description: "Failed to load finance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (paymentData: any) => {
    try {
      const res = await fetch("https://zaidawn.site/wp-json/ims/v1/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: Number(paymentData.customerId),
          amount: Number(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          reference: paymentData.reference,
          notes: paymentData.notes
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast({
          title: "Payment Recorded",
          description: result.message || "Payment was recorded successfully.",
        });
        setIsPaymentDialogOpen(false);
        fetchFinanceData(); // Refresh all panels
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to record payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Could not connect to API. Failed to record payment.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-3 items-center text-lg text-gray-500">
            <RefreshCw className="animate-spin" />
            Loading finance data...
          </div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">No finance data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Finance</h1>
            <p className="text-slate-600">Financial overview and management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="ml-2" onClick={fetchFinanceData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <PaymentDialog onSubmit={handleRecordPayment} onClose={() => setIsPaymentDialogOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-5">
        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-green-700">Rs. {overview.revenue.total.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{overview.revenue.growth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Cash Revenue</p>
                <p className="text-lg font-bold text-blue-700">Rs. {overview.revenue.cash.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-indigo-500" />
              <div>
                <p className="text-sm text-gray-600">Credit Revenue</p>
                <p className="text-lg font-bold text-indigo-700">Rs. {overview.revenue.credit.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-lg font-bold text-red-700">Rs. {overview.expenses.total.toLocaleString()}</p>
                <p className="text-xs text-red-600">+{overview.expenses.growth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-lg font-bold text-purple-700">Rs. {overview.profit.net.toLocaleString()}</p>
                <p className="text-xs text-purple-700">{overview.profit.margin}% margin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-cyan-500" />
              <div>
                <p className="text-sm text-gray-600">Cash Flow</p>
                <p className="text-lg font-bold text-cyan-700">Rs. {overview.cashFlow.net.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pt-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Accounts Receivable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-bold text-lg text-blue-700">Rs. {overview.accountsReceivable.toLocaleString()}</p>
              <div className="divide-y divide-gray-200">
                {receivables.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-gray-900">{rec.customerName}</div>
                      <div className="text-xs text-gray-500">Invoice {rec.invoiceNumber} | Due {rec.dueDate}</div>
                      {rec.daysOverdue > 0 && (
                        <Badge variant="destructive" className="mt-1">
                          {rec.daysOverdue} days overdue
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-blue-700 font-semibold">Rs. {rec.balance.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">Paid: Rs. {rec.paidAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Accounts Payable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-bold text-lg text-orange-700">Rs. {overview.accountsPayable.toLocaleString()}</p>
              <div className="divide-y divide-gray-200">
                {payables.map((pay) => (
                  <div key={pay.id} className="flex justify-between py-2 items-center">
                    <div>
                      <div className="font-medium text-gray-900">{pay.supplierName}</div>
                      <div className="text-xs text-gray-500">{pay.contactPerson && `Contact: ${pay.contactPerson}`}</div>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-orange-700 font-semibold">Rs. {pay.amount.toLocaleString()}</span>
                      {pay.pendingOrders > 0 && (
                        <span className="text-xs text-gray-500">{pay.pendingOrders} open orders</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-red-500" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-bold text-lg text-red-700">Rs. {overview.expenses.total.toLocaleString()}</p>
              <div className="divide-y divide-gray-200">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex flex-col py-2">
                    <span className="font-medium text-gray-900">{exp.description}</span>
                    <div className="text-xs text-gray-500">
                      {exp.category} | {exp.date} | {exp.paymentMethod.replace("_", " ")}
                    </div>
                    <span className="text-red-700 font-semibold">Rs. {exp.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-600" />
              Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-bold text-lg text-cyan-700">Rs. {overview.cashFlow.net.toLocaleString()}</p>
              <div className="divide-y divide-gray-200 max-h-40 overflow-auto">
                {cashFlow.map((cf, idx) => (
                  <div key={idx} className="flex flex-col py-2">
                    <div className="flex items-center gap-1">
                      {cf.type === "inflow" ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{cf.description}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={`font-bold ${cf.type === "inflow" ? "text-green-700" : "text-red-700"}`}>
                        Rs. {cf.amount.toLocaleString()}
                      </span>
                      <span className="text-gray-500">{cf.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PaymentDialog = ({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    amount: "",
    paymentMethod: "",
    reference: "",
    notes: ""
  });

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle className="text-green-600">Record Payment</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit({
            ...formData,
            customerId: Number(formData.customerId),
            amount: Number(formData.amount)
          });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerId">Customer ID</Label>
            <Input
              id="customerId"
              type="number"
              value={formData.customerId}
              onChange={e => setFormData({ ...formData, customerId: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (Rs.)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={value => setFormData({ ...formData, paymentMethod: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="reference">Reference</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={e => setFormData({ ...formData, reference: e.target.value })}
            placeholder="(Leave blank to auto generate)"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Optional notes about the payment"
            rows={2}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={!formData.customerId || !formData.amount || !formData.paymentMethod}
          >
            Record Payment
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default Finance;

