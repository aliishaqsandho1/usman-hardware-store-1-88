
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Users, Clock, Phone, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { calendarApi, CalendarEvent } from "@/services/calendarApi";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['calendar-events', selectedDate.toISOString().split('T')[0]],
    queryFn: () => calendarApi.getEvents({ 
      date: selectedDate.toISOString().split('T')[0] 
    }),
  });

  const events = eventsData?.data.events || [];

  const upcomingTasks = [
    { task: "Reorder Heavy Duty Hinges", dueDate: "Tomorrow", priority: "high" },
    { task: "Prepare quotation for new customer", dueDate: "Dec 2", priority: "medium" },
    { task: "Monthly inventory check", dueDate: "Dec 5", priority: "low" }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="h-4 w-4 text-blue-600" />;
      case "delivery": return <Users className="h-4 w-4 text-blue-600" />;
      case "payment": return <DollarSign className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-6 space-y-6 min-h-screen bg-slate-50">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-600">Manage your schedule and appointments</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Today's Schedule - {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No events scheduled for today
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                          {getEventIcon(event.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{event.title}</h3>
                          <p className="text-sm text-slate-600">{event.customerName || 'No customer assigned'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{event.time}</span>
                          </div>
                          {event.description && (
                            <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`mt-1 ${getPriorityColor(event.priority)}`}>
                          {event.priority} priority
                        </Badge>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tasks */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded border">
                    <p className="font-medium text-sm text-slate-900">{task.task}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">Due: {task.dueDate}</span>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Events</span>
                <span className="font-medium">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Pending Calls</span>
                <span className="font-medium text-red-600">
                  {events.filter(e => e.type === 'call' && e.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Deliveries</span>
                <span className="font-medium text-blue-600">
                  {events.filter(e => e.type === 'delivery').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Collections</span>
                <span className="font-medium text-green-600">
                  {events.filter(e => e.type === 'payment').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
