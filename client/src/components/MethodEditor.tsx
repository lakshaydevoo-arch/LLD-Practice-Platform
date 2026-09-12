import React from 'react';
import { Plus, Trash2, Terminal } from 'lucide-react';
import { MethodDefinition } from '../types';

interface MethodEditorProps {
  methods: MethodDefinition[];
  availableClasses: string[];
  onChange: (methods: MethodDefinition[]) => void;
}

export const MethodEditor: React.FC<MethodEditorProps> = ({
  methods,
  availableClasses,
  onChange,
}) => {
  const addMethod = () => {
    onChange([
      ...methods,
      {
        name: '',
        ownerClass: availableClasses[0] || '',
        purpose: '',
        inputs: [],
        output: 'void',
      },
    ]);
  };

  const updateMethod = (index: number, updated: Partial<MethodDefinition>) => {
    const next = [...methods];
    next[index] = { ...next[index], ...updated };
    onChange(next);
  };

  const removeMethod = (index: number) => {
    onChange(methods.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[#475569]" />
            Key Methods & Behavior ({methods.length})
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Specify core behavioral methods, their owning classes, and input/output contracts.
          </p>
        </div>
        <button
          type="button"
          onClick={addMethod}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Method
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#CBD5E1] rounded-lg bg-[#F8FAFC]">
          <Terminal className="h-7 w-7 text-[#94A3B8] mx-auto mb-1.5" />
          <p className="text-xs font-medium text-[#475569]">No methods declared yet</p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Declare core algorithm methods (e.g. assignSpot, calculateFee).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((method, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-[#E2E8F0] bg-white space-y-2.5 focus-within:border-[#CBD5E1] transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex-1 flex flex-wrap items-center gap-2 w-full">
                  <span className="text-xs font-mono text-[#475569] bg-[#F1F5F9] px-2 py-1 rounded border border-[#E2E8F0]">
                    fn
                  </span>
                  <input
                    type="text"
                    placeholder="methodName (e.g. calculateFee)"
                    value={method.name}
                    onChange={(e) => updateMethod(idx, { name: e.target.value })}
                    className="font-mono text-xs font-semibold bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none flex-1 min-w-[160px]"
                  />

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#64748B]">Owner:</span>
                    {availableClasses.length > 0 ? (
                      <select
                        value={method.ownerClass}
                        onChange={(e) => updateMethod(idx, { ownerClass: e.target.value })}
                        className="font-mono text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] focus:outline-none"
                      >
                        <option value="" disabled>Select class</option>
                        {availableClasses.map((cls, i) => (
                          <option key={i} value={cls}>{cls}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="OwnerClass"
                        value={method.ownerClass}
                        onChange={(e) => updateMethod(idx, { ownerClass: e.target.value })}
                        className="font-mono text-xs bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-[#0F172A] focus:outline-none w-28"
                      />
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeMethod(idx)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors self-end sm:self-center"
                  title="Delete Method"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[#64748B] font-medium mb-1">
                    Inputs / Parameters (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ticket: ParkingTicket, vehicle: Vehicle"
                    value={method.inputs.join(', ')}
                    onChange={(e) =>
                      updateMethod(idx, {
                        inputs: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full font-mono text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#64748B] font-medium mb-1">
                    Output / Return Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Money, ParkingSpot, void"
                    value={method.output}
                    onChange={(e) => updateMethod(idx, { output: e.target.value })}
                    className="w-full font-mono text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#64748B] font-medium mb-1">
                  Purpose / Behavioral Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computes parking fee by delegating to active pricing strategy."
                  value={method.purpose}
                  onChange={(e) => updateMethod(idx, { purpose: e.target.value })}
                  className="w-full text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
