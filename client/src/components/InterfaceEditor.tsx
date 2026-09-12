import React from 'react';
import { Plus, Trash2, Cpu } from 'lucide-react';
import { InterfaceDefinition } from '../types';

interface InterfaceEditorProps {
  interfaces: InterfaceDefinition[];
  onChange: (interfaces: InterfaceDefinition[]) => void;
}

export const InterfaceEditor: React.FC<InterfaceEditorProps> = ({ interfaces, onChange }) => {
  const addInterface = () => {
    onChange([
      ...interfaces,
      {
        name: '',
        responsibility: '',
        methods: [],
      },
    ]);
  };

  const updateInterface = (index: number, updated: Partial<InterfaceDefinition>) => {
    const next = [...interfaces];
    next[index] = { ...next[index], ...updated };
    onChange(next);
  };

  const removeInterface = (index: number) => {
    onChange(interfaces.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#475569]" />
            Interfaces & Contracts ({interfaces.length})
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Define contract abstractions to decouple high-level policies from concrete implementations.
          </p>
        </div>
        <button
          type="button"
          onClick={addInterface}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Interface
        </button>
      </div>

      {interfaces.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#CBD5E1] rounded-lg bg-[#F8FAFC]">
          <Cpu className="h-7 w-7 text-[#94A3B8] mx-auto mb-1.5" />
          <p className="text-xs font-medium text-[#475569]">No interfaces defined yet</p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Declare contracts such as PricingStrategy or PaymentGateway.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interfaces.map((iface, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-[#E2E8F0] bg-white space-y-2.5 focus-within:border-[#CBD5E1] transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-mono text-[#475569] bg-[#F1F5F9] px-2 py-1 rounded border border-[#E2E8F0]">
                    interface
                  </span>
                  <input
                    type="text"
                    placeholder="InterfaceName (e.g. PricingStrategy)"
                    value={iface.name}
                    onChange={(e) => updateInterface(idx, { name: e.target.value })}
                    className="font-mono text-xs font-semibold bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none flex-1 max-w-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeInterface(idx)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
                  title="Delete Interface"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Contract Purpose / Role
                </label>
                <textarea
                  rows={2}
                  placeholder="Define the role of this interface..."
                  value={iface.responsibility}
                  onChange={(e) => updateInterface(idx, { responsibility: e.target.value })}
                  className="w-full text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md p-2 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Method Signatures (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. calculateFee(ticket: ParkingTicket): Money"
                  value={iface.methods.join(', ')}
                  onChange={(e) =>
                    updateInterface(idx, {
                      methods: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full font-mono text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
