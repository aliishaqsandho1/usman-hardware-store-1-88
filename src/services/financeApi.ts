const BASE_URL = 'https://zaidawn.site/wp-json/ims/v1';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Customer balance update types
export interface CustomerBalanceUpdate {
  customerId: number;
  orderId: number;
  amount: number;
  type: 'credit' | 'debit';
  orderNumber: string;
  description: string;
}

export interface CustomerBalance {
  customerId: number;
  currentBalance: number;
  totalPurchases: number;
  creditLimit: number;
}

// Accounts Receivable types
export interface AccountsReceivable {
  id: number;
  customerName: string;
  customerId: number;
  orderNumber: string;
  invoiceNumber: string;
  amount: number;
  balance: number;
  paidAmount: number;
  dueDate: string;
  daysOverdue: number;
  status: 'pending' | 'overdue' | 'paid';
}

// Expense types
export interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
  reference: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit_card';
  createdBy: string;
  createdAt: string;
}

// Finance Overview types
export interface FinanceOverview {
  revenue: {
    total: number;
    cash: number;
    credit: number;
    growth: number;
  };
  expenses: {
    total: number;
    purchases: number;
    operational: number;
    growth: number;
  };
  profit: {
    gross?: number;   // Added for safety (the API sends gross/net)
    net: number;
    margin: number;
  };
  cashFlow: {
    inflow: number;
    outflow: number;
    net: number;
  };
  accountsReceivable: number;  // <-- Added for API alignment
  accountsPayable: number;     // <-- Added for API alignment
}

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Finance API request failed:', error);
    throw error;
  }
};

// Finance API endpoints
export const financeApi = {
  // Customer balance methods
  updateCustomerBalance: (update: CustomerBalanceUpdate) => {
    console.log('Sending customer balance update:', update);
    return apiRequest<ApiResponse<CustomerBalance>>('/customers/update-balance', {
      method: 'POST',
      body: JSON.stringify({
        ...update,
        amount: update.amount
      }),
    });
  },

  getCustomerBalance: (customerId: number) =>
    apiRequest<ApiResponse<CustomerBalance>>(`/customers/${customerId}/balance`),

  syncCustomerBalances: () =>
    apiRequest<ApiResponse<{ updated: number }>>('/customers/sync-balances', {
      method: 'POST',
    }),

  // Finance overview methods
  getOverview: (period?: string) =>
    apiRequest<ApiResponse<FinanceOverview>>(`/finance/overview${period ? `?period=${period}` : ''}`),

  // Accounts receivable methods
  getAccountsReceivable: (params?: {
    status?: 'pending' | 'overdue' | 'paid';
    customerId?: number;
    limit?: number;
    overdue?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<{ 
      receivables: AccountsReceivable[];
      summary: {
        totalReceivables: number;
        overdueAmount: number;
        overdueCount: number;
      };
    }>>(`/finance/accounts-receivable${query ? `?${query}` : ''}`);
  },

  recordPayment: (payment: {
    customerId: number;
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }) =>
    apiRequest<ApiResponse<any>>('/finance/record-payment', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  // Expense methods
  getExpenses: (params?: {
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<{ 
      expenses: Expense[];
      summary: {
        totalExpenses: number;
        categories: Array<{ category: string; amount: number }>;
      };
    }>>(`/finance/expenses${query ? `?${query}` : ''}`);
  },

  createExpense: (expense: {
    category: string;
    description: string;
    amount: number;
    date: string;
    paymentMethod: string;
    reference?: string;
  }) =>
    apiRequest<ApiResponse<Expense>>('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),
};
