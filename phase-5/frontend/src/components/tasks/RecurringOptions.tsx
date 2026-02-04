import { RecurringRule } from '@/types';

interface RecurringOptionsProps {
  value: string;
  onChange: (rule: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
}

export function RecurringOptions({ value, onChange, endDate, onEndDateChange }: RecurringOptionsProps) {
  const rules: { value: RecurringRule; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="recurring-rule" className="block text-sm font-medium text-gray-700 mb-1">
          Recurring (optional)
        </label>
        <select
          id="recurring-rule"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No recurrence</option>
          {rules.map((rule) => (
            <option key={rule.value} value={rule.value}>
              {rule.label}
            </option>
          ))}
        </select>
      </div>

      {value && (
        <div>
          <label htmlFor="recurring-end-date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date (optional)
          </label>
          <input
            type="date"
            id="recurring-end-date"
            value={endDate ? endDate.split('T')[0] : ''}
            onChange={(e) => onEndDateChange(e.target.value || '')}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to repeat indefinitely
          </p>
        </div>
      )}
    </div>
  );
}
