import React from 'react';
import { Plus, Trash2, Box } from 'lucide-react';
import { ClassDefinition } from '../types';

interface ClassEditorProps {
  classes: ClassDefinition[];
  onChange: (classes: ClassDefinition[]) => void;
}

export const ClassEditor: React.FC<ClassEditorProps> = ({ classes, onChange }) => {
  const addClass = () => {
    onChange([
      ...classes,
      {
        name: '',
        responsibility: '',
        attributes: [],
      },
    ]);
  };

  const updateClass = (index: number, updated: Partial<ClassDefinition>) => {
    const next = [...classes];
    next[index] = { ...next[index], ...updated };
    onChange(next);
  };

  const removeClass = (index: number) => {
    onChange(classes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
            <Box className="h-4 w-4 text-[#475569]" />
            Domain Classes & Entities ({classes.length})
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Identify domain entities, define their core responsibilities, and declare attributes.
          </p>
        </div>
        <button
          type="button"
          onClick={addClass}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#CBD5E1] rounded-lg bg-[#F8FAFC]">
          <Box className="h-7 w-7 text-[#94A3B8] mx-auto mb-1.5" />
          <p className="text-xs font-medium text-[#475569]">No classes defined yet</p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Click "Add Class" above or use a preset to populate entities.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-[#E2E8F0] bg-white space-y-2.5 focus-within:border-[#CBD5E1] transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-mono text-[#475569] bg-[#F1F5F9] px-2 py-1 rounded border border-[#E2E8F0]">
                    class
                  </span>
                  <input
                    type="text"
                    placeholder="ClassName (e.g. ParkingLot)"
                    value={cls.name}
                    onChange={(e) => updateClass(idx, { name: e.target.value })}
                    className="font-mono text-xs font-semibold bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none flex-1 max-w-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeClass(idx)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
                  title="Delete Class"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Single Responsibility / Role
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe what this class is responsible for..."
                  value={cls.responsibility}
                  onChange={(e) => updateClass(idx, { responsibility: e.target.value })}
                  className="w-full text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md p-2 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Key Attributes (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. id: string, floors: ParkingFloor[]"
                  value={cls.attributes.join(', ')}
                  onChange={(e) =>
                    updateClass(idx, {
                      attributes: e.target.value
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
