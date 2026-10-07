'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  badge?: string;
  desc?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  dropUp?: boolean;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md';
}

export default function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Seçiniz...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  dropUp = false,
  theme = 'light',
  size = 'md',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const SelectedIcon = selectedOption?.icon;

  const heightClass = size === 'sm' ? 'h-7 px-2 text-xs' : 'h-8 sm:h-9 px-2.5 text-xs';

  return (
    <div ref={dropdownRef} className={`relative text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full ${heightClass} rounded-xl border font-semibold flex items-center justify-between gap-1.5 transition-all cursor-pointer shadow-2xs select-none ${
          isOpen
            ? 'ring-2 ring-sky-500 border-sky-500'
            : isDark
            ? 'bg-[#14161f] border-[#343a4a] text-slate-200 hover:border-slate-500'
            : 'bg-white border-stone-300 text-stone-800 hover:border-stone-400'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {SelectedIcon && <SelectedIcon className="h-3.5 w-3.5 shrink-0 text-sky-500" />}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] px-1 py-0.2 rounded font-bold bg-sky-500/10 text-sky-500 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute left-0 ${
              dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            } min-w-full w-max max-w-[280px] max-h-60 overflow-y-auto rounded-xl border shadow-xl z-50 p-1 select-none ${
              isDark ? 'bg-[#1e222d] border-[#333a4c]' : 'bg-white border-slate-200'
            } ${menuClassName}`}
          >
            <div className="space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white font-bold'
                        : isDark
                        ? 'text-slate-300 hover:bg-[#282d3c] hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {Icon && (
                        <Icon
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isSelected ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                      )}
                      <div className="truncate">
                        <div>{opt.label}</div>
                        {opt.desc && (
                          <div
                            className={`text-[10px] ${
                              isSelected ? 'text-sky-100' : 'text-slate-400'
                            }`}
                          >
                            {opt.desc}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
