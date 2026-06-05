

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { annualPlanApi } from '../lib/api';
import type { AnnualPlan } from '../types';
import { format, parseISO, isSameDay } from 'date-fns'; // Import parseISO and isSameDay
import { ArrowLeft, Calendar as CalendarIcon, User } from 'lucide-react';

// Import the default CSS for the calendar
import 'react-calendar/dist/Calendar.css';

interface CalendarViewProps {
  onBack: () => void;
}

export default function CalendarView({ onBack }: CalendarViewProps) {
  const [plans, setPlans] = useState<AnnualPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [plansForSelectedDate, setPlansForSelectedDate] = useState<AnnualPlan[]>([]);

  // Memoize the plan dates for performance
  const planDates = React.useMemo(() => {
    return plans.map(plan => parseISO(plan.plan_date));
  }, [plans]);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const data = await annualPlanApi.getAll();
        setPlans(data);
      } catch (error) {
        console.error('Error loading plans:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  // Updated function to check if a specific date has any plans
  const hasPlans = (date: Date): boolean => {
    return planDates.some(planDate => isSameDay(planDate, date));
  };

  // Function to render a marker on dates that have plans
  const renderTileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month' && hasPlans(date)) {
      return <div className="h-2 w-2 bg-blue-500 rounded-full mx-auto mt-1"></div>;
    }
    return null;
  };

  // Updated function to handle clicking on a day
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const relevantPlans = plans.filter(plan => isSameDay(parseISO(plan.plan_date), date));
    setPlansForSelectedDate(relevantPlans);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={onBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-6 w-6 mr-3 text-blue-600" />
            Plans Calendar View
          </h1>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="lg:flex lg:space-x-8">
              <div className="flex-grow">
                <Calendar
                  onClickDay={handleDayClick}
                  tileContent={renderTileContent}
                  className="w-full border-none"
                />
              </div>
              <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
                <div className="bg-gray-50 p-4 rounded-lg h-full border">
                  <h2 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">
                    {selectedDate ? `Plans for ${format(selectedDate, 'do MMMM, yyyy')}` : 'Select a date'}
                  </h2>
                  {selectedDate ? (
                    plansForSelectedDate.length > 0 ? (
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {plansForSelectedDate.map(plan => (
                          <div key={plan.id} className="bg-white p-3 rounded-md border shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-gray-900 flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                {plan.employee.full_name}
                              </div>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyles(plan.status)}`}>
                                {plan.status_display}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Code: {plan.employee.employee_code}</p>
                            <p className="text-sm text-gray-500">Supervisor: {plan.supervisor_name}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center mt-4">No plans scheduled for this day.</p>
                    )
                  ) : (
                    <p className="text-gray-500 text-center mt-4">Click on a day with a blue marker to see plans.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}