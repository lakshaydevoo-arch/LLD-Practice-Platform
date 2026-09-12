import React from 'react';
import { Plus, Trash2, GitFork, ArrowRight } from 'lucide-react';
import { Relationship, RelationshipType } from '../types';

interface RelationshipEditorProps {
  relationships: Relationship[];
  availableEntities: string[];
  onChange: (relationships: Relationship[]) => void;
}

const RELATIONSHIP_OPTIONS: { type: RelationshipType; label: string; desc: string }[] = [
  { type: 'COMPOSITION', label: 'Composition (Owns)', desc: 'Strong lifecycle binding (e.g. Floor owns Spots)' },
  { type: 'AGGREGATION', label: 'Aggregation (Has-a)', desc: 'Weak containment (e.g. Lot has Gates)' },
  { type: 'ASSOCIATION', label: 'Association (Uses)', desc: 'Peer reference (e.g. Ticket refers to Spot)' },
  { type: 'INHERITANCE', label: 'Inheritance (Is-a)', desc: 'Generalization / Polymorphism (e.g. Car is a Vehicle)' },
  { type: 'DEPENDENCY', label: 'Dependency', desc: 'Transient use or parameter dependency' },
];

export const RelationshipEditor: React.FC<RelationshipEditorProps> = ({
  relationships,
  availableEntities,
  onChange,
}) => {
  const addRelationship = () => {
    const defaultFrom = availableEntities[0] || '';
    const defaultTo = availableEntities[1] || availableEntities[0] || '';
    onChange([
      ...relationships,
      {
        fromEntity: defaultFrom,
        type: 'COMPOSITION',
        toEntity: defaultTo,
      },
    ]);
  };

  const updateRelationship = (index: number, updated: Partial<Relationship>) => {
    const next = [...relationships];
    next[index] = { ...next[index], ...updated };
    onChange(next);
  };

  const removeRelationship = (index: number) => {
    onChange(relationships.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
            <GitFork className="h-4 w-4 text-[#475569]" />
            Entity Relationships ({relationships.length})
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Model associations, containment, and inheritance between your defined entities.
          </p>
        </div>
        <button
          type="button"
          onClick={addRelationship}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Relationship
        </button>
      </div>

      {relationships.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#CBD5E1] rounded-lg bg-[#F8FAFC]">
          <GitFork className="h-7 w-7 text-[#94A3B8] mx-auto mb-1.5" />
          <p className="text-xs font-medium text-[#475569]">No relationships defined yet</p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Link entities using composition, aggregation, or inheritance.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {relationships.map((rel, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-[#E2E8F0] bg-white flex flex-col sm:flex-row items-start sm:items-center gap-2.5 justify-between"
            >
              <div className="flex flex-1 items-center flex-wrap gap-2 w-full">
                {/* From Entity */}
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] text-[#64748B] font-medium mb-1">
                    From Entity
                  </label>
                  {availableEntities.length > 0 ? (
                    <select
                      value={rel.fromEntity}
                      onChange={(e) => updateRelationship(idx, { fromEntity: e.target.value })}
                      className="w-full font-mono text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] focus:outline-none"
                    >
                      <option value="" disabled>Select entity</option>
                      {availableEntities.map((ent, i) => (
                        <option key={i} value={ent}>{ent}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="From Class"
                      value={rel.fromEntity}
                      onChange={(e) => updateRelationship(idx, { fromEntity: e.target.value })}
                      className="w-full font-mono text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] focus:outline-none"
                    />
                  )}
                </div>

                {/* Relationship Type */}
                <div className="flex-1 min-w-[170px]">
                  <label className="block text-[11px] text-[#64748B] font-medium mb-1">
                    Relationship Type
                  </label>
                  <select
                    value={rel.type}
                    onChange={(e) =>
                      updateRelationship(idx, { type: e.target.value as RelationshipType })
                    }
                    className="w-full text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] focus:outline-none"
                  >
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt.type} value={opt.type}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden sm:flex items-center text-[#94A3B8] pt-4">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>

                {/* To Entity */}
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] text-[#64748B] font-medium mb-1">
                    To Entity
                  </label>
                  {availableEntities.length > 0 ? (
                    <select
                      value={rel.toEntity}
                      onChange={(e) => updateRelationship(idx, { toEntity: e.target.value })}
                      className="w-full font-mono text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] focus:outline-none"
                    >
                      <option value="" disabled>Select entity</option>
                      {availableEntities.map((ent, i) => (
                        <option key={i} value={ent}>{ent}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="To Class"
                      value={rel.toEntity}
                      onChange={(e) => updateRelationship(idx, { toEntity: e.target.value })}
                      className="w-full font-mono text-xs bg-white border border-[#CBD5E1] focus:border-[#2563EB] rounded-md px-2.5 py-1.5 text-[#0F172A] focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeRelationship(idx)}
                className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors sm:self-end mb-0.5"
                title="Delete Relationship"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
