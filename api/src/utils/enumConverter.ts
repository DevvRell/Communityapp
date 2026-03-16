/**
 * Utility functions to convert between UI format (lowercase with hyphens)
 * and Prisma enum format (UPPERCASE with underscores)
 */

export const convertStatusToEnum = (status: string): 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' => {
  const statusMap: Record<string, 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'> = {
    'pending': 'PENDING',
    'in-progress': 'IN_PROGRESS',
    'in_progress': 'IN_PROGRESS',
    'resolved': 'RESOLVED',
  };
  
  return statusMap[status.toLowerCase()] || 'PENDING';
};

export const convertStatusFromEnum = (status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'pending',
    'IN_PROGRESS': 'in-progress',
    'RESOLVED': 'resolved',
  };
  
  return statusMap[status] || 'pending';
};

export const convertPriorityToEnum = (priority: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
  const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH',
  };
  
  return priorityMap[priority.toLowerCase()] || 'MEDIUM';
};

export const convertPriorityFromEnum = (priority: 'LOW' | 'MEDIUM' | 'HIGH'): string => {
  const priorityMap: Record<string, string> = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high',
  };
  
  return priorityMap[priority] || 'medium';
};
