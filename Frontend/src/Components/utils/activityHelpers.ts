import type { ActivityType } from "../Context/ActivityContext";


export const generateActivityMessage = (
  type: ActivityType,
  customerName: string,
  metadata?: Record<string, any>
): string => {
  switch (type) {
    case 'CUSTOMER_REGISTERED':
      return `Customer ${customerName} registered`;
    case 'METER_READING_SUBMITTED':
      return `Meter reading submitted for ${customerName}`;
    case 'COMPLAINT_RESOLVED':
      return `Complaint ${metadata?.complaintId || ''} resolved for ${customerName}`;
    case 'METER_INSTALLED':
      return `New meter installed at ${metadata?.address || ''} for ${customerName}`;
    case 'COMPLAINT_FOLLOW_UP':
      return `Follow-up on complaint ${metadata?.complaintId || ''} for ${customerName}`;
    case 'COMPLAINT_CREATED':
      return `New complaint ${metadata?.complaintId || ''} created by ${customerName}`;
    case 'METER_READING_VERIFIED':
      return `Meter reading verified for ${customerName}`;
    default:
      return `Activity performed for ${customerName}`;
  }
};

export const getDefaultStatus = (type: ActivityType): 'Completed' | 'Pending' | 'Resolved' => {
  switch (type) {
    case 'CUSTOMER_REGISTERED':
    case 'COMPLAINT_RESOLVED':
    case 'METER_INSTALLED':
    case 'METER_READING_VERIFIED':
      return 'Completed';
    case 'METER_READING_SUBMITTED':
    case 'COMPLAINT_FOLLOW_UP':
    case 'COMPLAINT_CREATED':
      return 'Pending';
    default:
      return 'Pending';
  }
};