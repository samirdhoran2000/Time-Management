import React from 'react';
import TimePicker from './TimePicker';

/**
 * Common Form Field component for TrackerForm
 * Supports: text, number, date, select, time
 */
const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    required = false,
    disabled = false,
    options = [],
    min,
    max,
    step,
    className = '',
    fullWidth = false,
}) => {
    const isSelect = type === 'select';
    const isTime = type === 'time';

    const baseInputClasses = "peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors";
    const disabledClasses = disabled ? "cursor-not-allowed opacity-50" : "";
    const dateClasses = type === 'date' ? "[color-scheme:dark]" : "";

    const renderField = () => {
        if (isSelect) {
            return (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={`${baseInputClasses} ${disabledClasses} appearance-none`}
                >
                    <option value="" disabled>{placeholder || `Select ${label}`}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (isTime) {
            return (
                <div className="py-1">
                    <TimePicker
                        value={value}
                        onChange={(newVal) => onChange({ target: { name, value: newVal } })}
                        disabled={disabled}
                        label={label}
                    />
                </div>
            );
        }

        return (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder || label}
                disabled={disabled}
                required={required}
                min={min}
                max={max}
                step={step}
                className={`${baseInputClasses} ${disabledClasses} ${dateClasses}`}
            />
        );
    };

    return (
        <div className={`relative ${fullWidth ? 'sm:col-span-2' : ''} ${className}`}>
            {renderField()}

            <label className={`absolute left-1 px-1 bg-zinc-900 text-[10px] font-medium transition-all ${isTime ? '-top-2.5 text-indigo-500' : 'text-zinc-500 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-placeholder-shown:left-0 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-focus:-top-2.5 peer-focus:left-1 peer-focus:text-[10px] peer-focus:text-indigo-500 peer-focus:bg-zinc-900 peer-focus:px-1 -top-2.5'}`}>
                {label}
            </label>
        </div>
    );
};

export default FormField;
