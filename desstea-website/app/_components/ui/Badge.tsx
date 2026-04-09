type BadgeVariant =
  | "pending"
  | "completed"
  | "cancelled"
  | "refunded"
  | "active"
  | "inactive"
  | "maintenance"
  | "super_admin"
  | "branch_manager"
  | "staff"
  | "Coffee"
  | "Foods"
  | "Combos"
  | "default";

const variantStyles: Record<BadgeVariant, string> = {
  pending: "bg-orange-100 text-orange-700",
  completed: "bg-[#F2EBE5] text-[#6B4F3A]",
  cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-red-100 text-red-600",
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  maintenance: "bg-amber-100 text-amber-700",
  super_admin: "bg-purple-100 text-purple-700",
  branch_manager: "bg-blue-100 text-blue-700",
  staff: "bg-gray-100 text-gray-600",
  Coffee: "bg-[#F2EBE5] text-[#6B4F3A]",
  Foods: "bg-green-100 text-green-700",
  Combos: "bg-orange-100 text-orange-700",
  default: "bg-gray-100 text-gray-600",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
