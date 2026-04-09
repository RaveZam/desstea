interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}

export default function FormField({ label, children, className = "", hint }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}
