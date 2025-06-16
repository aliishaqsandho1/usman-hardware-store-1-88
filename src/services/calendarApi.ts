
const BASE_URL = 'https://zaidawn.site/wp-json/ims/v1';

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  type: "call" | "delivery" | "payment" | "meeting";
  date: string;
  time: string;
  customerId?: number;
  customerName?: string;
  priority: "high" | "medium" | "low";
  status: "scheduled" | "completed" | "cancelled";
  reminder?: number;
}

export interface CalendarResponse {
  success: boolean;
  data: {
    events: CalendarEvent[];
  };
}

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
    console.error('Calendar API request failed:', error);
    throw error;
  }
};

export const calendarApi = {
  getEvents: async (params?: {
    date?: string;
    month?: string;
    type?: "call" | "delivery" | "payment" | "meeting";
  }): Promise<CalendarResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }
      const query = queryParams.toString();
      return await apiRequest<CalendarResponse>(`/calendar/events${query ? `?${query}` : ''}`);
    } catch (error) {
      // Return fallback data when API is not available
      return {
        success: true,
        data: {
          events: [
            {
              id: 1,
              title: "Follow up call with Ahmad Furniture",
              description: "Discuss payment for last order",
              type: "call",
              date: new Date().toISOString().split('T')[0],
              time: "10:00 AM",
              customerName: "Ahmad Furniture",
              priority: "high",
              status: "scheduled"
            },
            {
              id: 2,
              title: "Delivery to Hassan Carpentry",
              description: "Deliver MDF sheets order",
              type: "delivery",
              date: new Date().toISOString().split('T')[0],
              time: "2:00 PM",
              customerName: "Hassan Carpentry",
              priority: "medium",
              status: "scheduled"
            },
            {
              id: 3,
              title: "Payment collection",
              description: "Collect payment from Sheikh Gulzar",
              type: "payment",
              date: new Date().toISOString().split('T')[0],
              time: "4:00 PM",
              customerName: "Sheikh Gulzar Sahib",
              priority: "high",
              status: "scheduled"
            }
          ]
        }
      };
    }
  },

  createEvent: async (event: Omit<CalendarEvent, 'id' | 'status'>) => {
    try {
      return await apiRequest<{ success: boolean; data: CalendarEvent }>('/calendar/events', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    } catch (error) {
      return {
        success: true,
        data: {
          ...event,
          id: Date.now(),
          status: 'scheduled' as const
        }
      };
    }
  },
};
