import type { User, UserRole } from "../../../_types";

export const mockUsers: User[] = [
  // Super Admins
  {
    id: "usr-1",
    name: "Rafael Guzman",
    email: "rafael@desstea.com",
    role: "super_admin",
    assignedBranchId: null,
    assignedBranchName: null,
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
    assignedBranchName: null,
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
    assignedBranchName: "Ipil, Echague",
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
    assignedBranchName: "Cabugao, Echague",
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
    assignedBranchName: "Santiago City",
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
    assignedBranchName: "Cauayan City",
    status: "active",
    lastLogin: "2026-04-09T08:30:00",
    avatarInitials: "RC",
  },
];

export const roleOptions: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "All Roles" },
  { value: "super_admin", label: "Super Admin" },
  { value: "branch_manager", label: "Branch Manager" },
];

export const branchOptions = [
  { value: "", label: "No Branch (All)" },
  { value: "br-1", label: "Ipil, Echague" },
  { value: "br-2", label: "Cabugao, Echague" },
  { value: "br-3", label: "Santiago City" },
  { value: "br-4", label: "Cauayan City" },
];
