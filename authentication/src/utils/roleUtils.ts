import { Role } from '../types/auth.types';
export const getEnumFromString = (role: string): Role | null => {
  switch (role.toLowerCase()) {
    case 'customer':
      return Role.Customer;
    case 'admin':
      return Role.Admin;
    case 'manager':
      return Role.Manager;
    case 'superadmin':
      return Role.SuperAdmin;
    case 'employee':
      return Role.Employee;
    case 'partner':
      return Role.Partner;
    case 'guest':
      return Role.Guest;
    default:
      return null;
  }
};
export const getStringFromEnum = (role: Role): string => {
  switch (role) {
    case Role.Customer:
      return 'Customer';
    case Role.Admin:
      return 'Admin';
    case Role.Manager:
      return 'Manager';
    case Role.SuperAdmin:
      return 'Super Admin';
    case Role.Employee:
      return 'Employee';
    case Role.Partner:
      return 'Partner';
    case Role.Guest:
      return 'Guest';
    default:
      return 'Unknown';
  }
};
export const isAdminRole = (role: Role): boolean => {
  return role === Role.Admin || role === Role.SuperAdmin;
};
export const getRoleLevel = (role: Role): number => {
  switch (role) {
    case Role.Guest:
      return 1;
    case Role.Customer:
      return 2;
    case Role.Employee:
      return 3;
    case Role.Partner:
      return 4;
    case Role.Manager:
      return 5;
    case Role.Admin:
      return 6;
    case Role.SuperAdmin:
      return 7;
    default:
      return 0;
  }
};

