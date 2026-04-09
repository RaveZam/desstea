interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className={`flex items-center gap-2 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-[#6B4F3A]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
