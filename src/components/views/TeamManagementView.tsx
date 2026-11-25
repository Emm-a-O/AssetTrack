import React, { useEffect, useState } from 'react';
import { MailPlus, ShieldCheck, UsersRound } from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import type { EnvironmentMode, UserRole } from '../../types';

const assignableRoles: UserRole[] = [
  'Asset Manager',
  'Department Manager',
  'Staff Member',
  'Auditor',
  'Organisation Administrator',
];

export const TeamManagementView: React.FC = () => {
  const { currentUser, users, departments, inviteUser, updateUserPortal } = useAssetTrack();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [role, setRole] = useState<UserRole>('Staff Member');
  const [portal, setPortal] = useState<EnvironmentMode>('organisation');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [portalError, setPortalError] = useState('');
  const [updatingPortalId, setUpdatingPortalId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const household = portal === 'household';
  const visibleRoles = household ? ['Staff Member' as UserRole] : assignableRoles;

  useEffect(() => {
    if (household) setRole('Staff Member');
  }, [household]);

  const canManage = currentUser.role === 'Organisation Administrator' || currentUser.role === 'Platform Administrator';

  const submitInvitation = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const result = await inviteUser({
      name: name.trim(),
      email: email.trim(),
      role: household ? 'Staff Member' : role,
      portal,
      title: title.trim() || undefined,
      departmentId: departmentId || undefined,
    });
    setBusy(false);
    if (!result.success) {
      setError(result.error || 'The invitation could not be sent.');
      return;
    }
    setSuccess(`Invitation sent to ${email.trim()}. They can set their password from the email link.`);
    setName('');
    setEmail('');
    setTitle('');
    setDepartmentId('');
    setRole('Staff Member');
  };

  const changePortal = async (userId: string, nextPortal: EnvironmentMode) => {
    setPortalError('');
    setUpdatingPortalId(userId);
    const result = await updateUserPortal(userId, nextPortal);
    setUpdatingPortalId(null);
    if (!result.success) setPortalError(result.error || 'The portal assignment could not be updated.');
  };

  if (!canManage) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Only an administrator can manage team accounts.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-blue-700">
          <UsersRound className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Account access</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{household ? 'Household members' : 'Officials & team'}</h1>
        <p className="mt-1 text-sm text-slate-500">Invite people individually. Each person signs in with their own account and asset entries are attributed to them.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MailPlus className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Invite a person</h2>
          </div>
          <form onSubmit={submitInvitation} className="space-y-3.5">
            <label className="block text-xs font-semibold text-slate-700">
              Full name
              <input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="Name" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Email address
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="person@example.com" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Portal access
              <select value={portal} onChange={(event) => setPortal(event.target.value as EnvironmentMode)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal">
                <option value="organisation">Organisation</option>
                <option value="household">Household</option>
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Account role
              <select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal">
                {visibleRoles.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            {!household && (
              <>
                <label className="block text-xs font-semibold text-slate-700">
                  Official title (optional)
                  <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="e.g. Head of Department" />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Department (optional)
                  <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal">
                    <option value="">No department assigned</option>
                    {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                  </select>
                </label>
              </>
            )}
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
            {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{success}</p>}
            <button disabled={busy} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              <MailPlus className="h-4 w-4" /> {busy ? 'Sending invitation…' : 'Send invitation'}
            </button>
          </form>
          <p className="mt-4 text-[11px] leading-5 text-slate-500">The person receives an email link to choose a password. Never share a password between officials or household members.</p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Registered accounts</h2>
              <p className="mt-1 text-xs text-slate-500">{users.length} {users.length === 1 ? 'person' : 'people'}</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          {portalError && <p role="alert" className="border-b border-rose-100 bg-rose-50 p-3 text-xs text-rose-700">{portalError}</p>}
          {users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No accounts yet. Send an invitation to add your first person.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.map((user) => (
                <li key={user.id} className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                    {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    {user.title && <p className="truncate text-[11px] text-slate-400">{user.title}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-center text-[10px] font-semibold text-slate-600">{user.role}</span>
                    {user.id === currentUser.id ? (
                      <span className="text-[10px] font-medium text-slate-500">{user.portal === 'household' ? 'Household portal' : 'Organisation portal'}</span>
                    ) : (
                      <select
                        aria-label={`Portal access for ${user.name}`}
                        value={user.portal}
                        disabled={updatingPortalId === user.id || (user.role !== 'Staff Member' && user.portal !== 'organisation')}
                        onChange={(event) => {
                          const nextPortal = event.target.value as EnvironmentMode;
                          if (nextPortal === 'household' && user.role !== 'Staff Member') {
                            setPortalError('Only Staff Member accounts can be assigned to the Household portal.');
                            return;
                          }
                          if (window.confirm(`Change ${user.name}'s portal to ${nextPortal === 'household' ? 'Household' : 'Organisation'}? This changes which assets their account can access.`)) {
                            void changePortal(user.id, nextPortal);
                          }
                        }}
                        className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-medium text-slate-600 disabled:opacity-60"
                      >
                        <option value="organisation">Organisation</option>
                        <option value="household">Household</option>
                      </select>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
