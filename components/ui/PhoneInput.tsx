import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const COUNTRIES = [
  { code: 'US', dial_code: '+1', name: 'United States', flag: '🇺🇸', maxLength: 10 },
  { code: 'IN', dial_code: '+91', name: 'India', flag: '🇮🇳', maxLength: 10 },
  { code: 'GB', dial_code: '+44', name: 'United Kingdom', flag: '🇬🇧', maxLength: 10 },
  { code: 'CA', dial_code: '+1', name: 'Canada', flag: '🇨🇦', maxLength: 10 },
  { code: 'AU', dial_code: '+61', name: 'Australia', flag: '🇦🇺', maxLength: 9 },
  { code: 'DE', dial_code: '+49', name: 'Germany', flag: '🇩🇪', maxLength: 11 },
  { code: 'FR', dial_code: '+33', name: 'France', flag: '🇫🇷', maxLength: 9 },
  { code: 'JP', dial_code: '+81', name: 'Japan', flag: '🇯🇵', maxLength: 10 },
  { code: 'CN', dial_code: '+86', name: 'China', flag: '🇨🇳', maxLength: 11 },
  { code: 'BR', dial_code: '+55', name: 'Brazil', flag: '🇧🇷', maxLength: 11 },
  { code: 'ZA', dial_code: '+27', name: 'South Africa', flag: '🇿🇦', maxLength: 9 },
  { code: 'AE', dial_code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', maxLength: 9 },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, required, disabled }: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse initial value to find country and local number
  const initialCountry = COUNTRIES.find(c => value.startsWith(c.dial_code)) || COUNTRIES[0];
  const initialLocalNumber = value.startsWith(initialCountry.dial_code) 
    ? value.slice(initialCountry.dial_code.length).trim() 
    : value;

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [localNumber, setLocalNumber] = useState(initialLocalNumber);

  useEffect(() => {
    // If external value changes, try to parse it
    if (value && value !== `${selectedCountry.dial_code} ${localNumber}`) {
      const matchedCountry = COUNTRIES.find(c => value.startsWith(c.dial_code));
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setLocalNumber(value.slice(matchedCountry.dial_code.length).trim());
      } else {
        setLocalNumber(value);
      }
    }
  }, [value]);

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setIsOpen(false);
    // Truncate number if it exceeds new max length
    const newNumber = localNumber.slice(0, country.maxLength);
    setLocalNumber(newNumber);
    onChange(`${country.dial_code} ${newNumber}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const rawValue = e.target.value.replace(/\D/g, '');
    const truncatedValue = rawValue.slice(0, selectedCountry.maxLength);
    setLocalNumber(truncatedValue);
    onChange(`${selectedCountry.dial_code} ${truncatedValue}`);
  };

  return (
    <div className="relative flex w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-r-0 border-[var(--color-border)] rounded-l bg-[var(--color-bg-dark)]/5 hover:bg-[var(--color-bg-dark)]/10 transition-colors focus:outline-none disabled:opacity-50"
      >
        <span className="text-base">{selectedCountry.flag}</span>
        <span className="text-[var(--text-small)] font-medium text-[var(--color-text-secondary)] w-10 text-left">
          {selectedCountry.dial_code}
        </span>
        <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-[var(--color-border)] rounded shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleCountrySelect(country)}
              className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-[var(--color-bg-dark)]/5 transition-colors ${selectedCountry.code === country.code ? 'bg-[var(--color-bg-dark)]/5 font-medium' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{country.flag}</span>
                <span className="text-[var(--text-small)]">{country.name}</span>
              </div>
              <span className="text-[var(--text-small)] text-[var(--color-text-muted)]">{country.dial_code}</span>
            </button>
          ))}
        </div>
      )}

      <input
        required={required}
        disabled={disabled}
        type="tel"
        className="flex-1 border border-[var(--color-border)] rounded-r px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] w-full min-w-0 disabled:opacity-50"
        placeholder={`e.g. ${'1'.repeat(selectedCountry.maxLength)}`}
        value={localNumber}
        onChange={handleNumberChange}
        maxLength={selectedCountry.maxLength}
        minLength={selectedCountry.maxLength}
        pattern={`[0-9]{${selectedCountry.maxLength}}`}
        title={`Please enter exactly ${selectedCountry.maxLength} digits`}
      />
    </div>
  );
}
