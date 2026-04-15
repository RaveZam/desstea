import type { User, UserRole } from "../../../_types";

export const mockUsers: User[] = [
  // Super Admins
  {
    id: "usr-1",
    name: "Rafael Guzman",
    email: "rafael@desstea.com",
    role: "super_admin",
    assignedBranchId: null,
    status: "active",
    lastLogin: "2026-04-09T07:45:00",
    avatarInitials: "RG",
  },
  {
    id: "usr-2",
    name: "Patricia Lim",
    email: "patricia@desstea.com",
    role: "super_admin",
    assignedBranchId: null,
    status: "active",
    lastLogin: "2026-04-08T18:30:00",
    avatarInitials: "PL",
  },
  // Branch Managers
  {
    id: "usr-3",
    name: "Sarah Chen",
    email: "sarah@desstea.com",
    role: "branch_manager",
    assignedBranchId: "br-1",
    status: "active",
    lastLogin: "2026-04-09T08:00:00",
    avatarInitials: "SC",
  },
  {
    id: "usr-4",
    name: "Marco Villanueva",
    email: "marco@desstea.com",
    role: "branch_manager",
    assignedBranchId: "br-2",
    status: "active",
    lastLogin: "2026-04-09T09:15:00",
    avatarInitials: "MV",
  },
  {
    id: "usr-5",
    name: "Jenny Santos",
    email: "jenny@desstea.com",
    role: "branch_manager",
    assignedBranchId: "br-3",
    status: "active",
    lastLogin: "2026-04-08T17:50:00",
    avatarInitials: "JS",
  },
  {
    id: "usr-6",
    name: "Roberto Cruz",
    email: "roberto@desstea.com",
    role: "branch_manager",
    assignedBranchId: "br-4",
    status: "active",
    lastLogin: "2026-04-09T08:30:00",
    avatarInitials: "RC",
  },
];

export const roleOptions: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "All Roles" },
  { value: "super_admin", label: "Admin Account" },
  { value: "branch_manager", label: "Branch Account" },
];
