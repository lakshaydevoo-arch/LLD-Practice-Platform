import React from 'react';
import { Layers } from 'lucide-react';

interface PatternSelectorProps {
  selectedPatterns: string[];
  onChange: (patterns: string[]) => void;
}

const COMMON_PATTERNS = [
  { name: 'Strategy', desc: 'Pluggable algorithms (pricing, dispatch, split)' },
  { name: 'Factory', desc: 'Encapsulates object creation polymorphism' },
  { name: 'State', desc: 'Encapsulates state-dependent behavior' },
  { name: 'Observer', desc: 'Event publish-subscribe for state updates' },
  { name: 'Decorator', desc: 'Dynamic behavior wrapping (condiments, logging)' },
  { name: 'Composite', desc: 'Tree hierarchies (individual vs group balances)' },
  { name: 'Singleton', desc: 'Single coordinated instance (use with caution)' },
  { name: 'Builder', desc: 'Multi-step complex object construction' },
  { name: 'None / Plain OOP', desc: 'Standard composition & polymorphism' },
];

export const PatternSelector: React.FC<PatternSelectorProps> = ({
  selectedPatterns,
  onChange,
}) => {
  const togglePattern = (name: string) => {
    if (selectedPatterns.includes(name)) {
      onChange(selectedPatterns.filter((p) => p !== name));
    } else {
      onChange([...selectedPatterns, name]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="pb-3 border-b border-[#E2E8F0]">
        <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#475569]" />
          Design Patterns Leveraged
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          Select design patterns intentionally employed in your solution architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {COMMON_PATTERNS.map((pattern) => {
          const isSelected = selectedPatterns.includes(pattern.name);
          return (
            <button
              key={pattern.name}
              type="button"
              onClick={() => togglePattern(pattern.name)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] text-[#0F172A]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isSelected ? 'text-[#1D4ED8]' : 'text-[#0F172A]'}`}>
                  {pattern.name}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSelected ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                  }`}
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1 leading-snug">{pattern.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
