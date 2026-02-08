interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
}

export function DateTimePicker({ label, value, onChange, required = false }: DateTimePickerProps) {
  // Convert ISO string to datetime-local input format
  const toLocalDateTime = (isoString?: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Convert datetime-local input to ISO string
  const fromLocalDateTime = (localString: string): string => {
    if (!localString) return '';
    const date = new Date(localString);
    return date.toISOString();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value ? fromLocalDateTime(value) : '');
  };

  return (
    <div>
      <label htmlFor={label.toLowerCase().replace(/\s+/g, '-')} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="datetime-local"
        id={label.toLowerCase().replace(/\s+/g, '-')}
        value={toLocalDateTime(value) || ''}
        onChange={handleChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
