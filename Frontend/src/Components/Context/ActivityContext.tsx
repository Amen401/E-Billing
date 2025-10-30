// contexts/ActivityContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type ActivityType = 
  | 'CUSTOMER_REGISTERED'
  | 'METER_READING_SUBMITTED'
  | 'COMPLAINT_RESOLVED'
  | 'METER_INSTALLED'
  | 'COMPLAINT_FOLLOW_UP'
  | 'COMPLAINT_CREATED'
  | 'METER_READING_VERIFIED';

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  activity: string;
  customer: string;
  status: 'Completed' | 'Pending' | 'Resolved';
  metadata?: Record<string, any>;
}

interface ActivityState {
  activities: Activity[];
}

type ActivityAction =
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY_STATUS'; payload: { id: string; status: Activity['status'] } }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] };

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivityStatus: (id: string, status: Activity['status']) => void;
  getActivitiesByCustomer: (customerName: string) => Activity[];
  getActivitiesByType: (type: ActivityType) => Activity[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Reducer function
const activityReducer = (state: ActivityState, action: ActivityAction): ActivityState => {
  switch (action.type) {
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities],
      };
    case 'UPDATE_ACTIVITY_STATUS':
      return {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id
            ? { ...activity, status: action.payload.status }
            : activity
        ),
      };
    case 'SET_ACTIVITIES':
      return {
        ...state,
        activities: action.payload,
      };
    default:
      return state;
  }
};

// Initial state with some sample data
const initialState: ActivityState = {
  activities: [
    {
      id: '1',
      type: 'CUSTOMER_REGISTERED',
      date: '2024-07-28',
      activity: 'Customer John Doe registered',
      customer: 'John Doe',
      status: 'Completed',
    },
    {
      id: '2',
      type: 'METER_READING_SUBMITTED',
      date: '2024-07-28',
      activity: 'Meter reading submitted for Jane Smith',
      customer: 'Jane Smith',
      status: 'Pending',
    },
    {
      id: '3',
      type: 'COMPLAINT_RESOLVED',
      date: '2024-07-27',
      activity: 'Complaint ID 12345 resolved',
      customer: 'Robert Johnson',
      status: 'Resolved',
    },
    {
      id: '4',
      type: 'METER_INSTALLED',
      date: '2024-07-26',
      activity: 'New meter installed at 123 Main St.',
      customer: 'Alice Williams',
      status: 'Completed',
    },
    {
      id: '5',
      type: 'COMPLAINT_FOLLOW_UP',
      date: '2024-07-25',
      activity: 'Follow-up on complaint CC 67890',
      customer: 'Michael Brown',
      status: 'Pending',
    },
  ],
};

// Provider component
export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(activityReducer, initialState);

  const addActivity = (activityData: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
  };

  const updateActivityStatus = (id: string, status: Activity['status']) => {
    dispatch({ type: 'UPDATE_ACTIVITY_STATUS', payload: { id, status } });
  };

  const getActivitiesByCustomer = (customerName: string) => {
    return state.activities.filter(activity => 
      activity.customer.toLowerCase().includes(customerName.toLowerCase())
    );
  };

  const getActivitiesByType = (type: ActivityType) => {
    return state.activities.filter(activity => activity.type === type);
  };

  return (
    <ActivityContext.Provider
      value={{
        activities: state.activities,
        addActivity,
        updateActivityStatus,
        getActivitiesByCustomer,
        getActivitiesByType,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

// Custom hook to use the activity context
export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};