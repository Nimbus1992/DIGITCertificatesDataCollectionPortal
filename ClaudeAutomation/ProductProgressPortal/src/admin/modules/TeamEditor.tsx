import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import type { TeamMember, TeamRole, TeamEngagement } from '../../types';

const EMPTY: TeamMember = { name: '', role: 'Engineers', engagement: 'Internal', photoUrl: '', utilization: 100 };
const ROLES: TeamRole[] = ['Product Manager', 'Architect', 'Project Manager', 'Engineers', 'DevOps'];

const ROLE_COLORS: Record<TeamRole, string> = {
  'Product Manager': 'bg-amber-100 text-amber-800',
  'Architect':       'bg-purple-100 text-purple-800',
  'Project Manager': 'bg-blue-100 text-blue-800',
  'Engineers':       'bg-red-100 text-red-800',
  'DevOps':          'bg-teal-100 text-teal-800',
};

export function TeamEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<TeamMember>(EMPTY);

  const rows = data.team ?? [];
  const totalMembers = rows.length;

  function openAdd() { setForm(EMPTY); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setModal({ open: true, idx }); }
  function handleSave() {
    const member = { ...form, utilization: Number(form.utilization) };
    if (modal.idx === null) set('team', [...rows, member]);
    else { const n = [...rows]; n[modal.idx] = member; set('team', n); }
    setModal({ open: false, idx: null });
  }
  const upd = <K extends keyof TeamMember>(k: K, v: TeamMember[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Team</h2>
          <p className="text-gray-500 text-sm">{totalMembers} members</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Member</button>
      </div>

      {rows.length === 0 ? <Empty label="team members" onAdd={openAdd} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Photo', 'Name', 'Role', 'Engagement', 'Utilization', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((member, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {member.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role]}`}>{member.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${member.engagement === 'External' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {member.engagement}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${(member.utilization ?? 100) >= 80 ? 'bg-green-500' : (member.utilization ?? 100) >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${member.utilization ?? 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{member.utilization ?? 100}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => openEdit(idx)} onDelete={() => set('team', rows.filter((_, i) => i !== idx))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Team Member' : 'Edit Team Member'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave}>
          <Field label="Name"><Input value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Full name" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role">
              <Select value={form.role} onChange={e => upd('role', e.target.value as TeamRole)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Engagement">
              <Select value={form.engagement} onChange={e => upd('engagement', e.target.value as TeamEngagement)}>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </Select>
            </Field>
            <Field label="Utilization %" hint="% of time spent on this product">
              <Input
                type="number"
                min={0}
                max={100}
                value={form.utilization ?? 100}
                onChange={e => upd('utilization', Math.min(100, Math.max(0, Number(e.target.value))))}
              />
            </Field>
          </div>
          <Field label="Photo URL" hint="Direct link to a profile photo (optional)">
            <Input value={form.photoUrl} onChange={e => upd('photoUrl', e.target.value)} placeholder="https://..." />
          </Field>
          {form.photoUrl && (
            <div className="flex items-center gap-3 mt-1">
              <img src={form.photoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" onError={e => (e.currentTarget.style.display = 'none')} />
              <span className="text-xs text-gray-500">Photo preview</span>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
