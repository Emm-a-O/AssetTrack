import React, { useState } from 'react';
import { useAssetTrack } from '../../context/AssetTrackContext';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile } = useAssetTrack();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [title, setTitle] = useState(currentUser.title || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const result = await updateProfile({ name, phone, title, avatar });
    setBusy(false);
    if (!result.success) {
      setError(result.error || 'Your profile could not be saved.');
      return;
    }
    setSuccess('Your profile has been updated.');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update the details other AssetTrack members see for your account.</p>
      </div>

      <form onSubmit={saveProfile} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-4">
          <img
            src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Profile preview"
            className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'; }}
          />
          <div>
            <p className="text-sm font-semibold text-slate-800">Profile picture</p>
            <p className="mt-1 text-xs text-slate-500">Paste a public image link below.</p>
          </div>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Display name
          <input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Email address
          <input disabled value={currentUser.email} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-500" />
          <span className="mt-1 block text-xs font-normal text-slate-500">Contact an administrator if your email address needs to change.</span>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Phone number
          <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="Optional" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Job title or responsibility
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="Optional" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Picture link
          <input type="url" value={avatar} onChange={(event) => setAvatar(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" placeholder="https://example.com/photo.jpg" />
        </label>

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          Portal access: <span className="font-semibold">{currentUser.portal === 'household' ? 'Household' : 'Organisation'}</span>
          <span className="mx-2 text-slate-300">·</span>
          Role: <span className="font-semibold">{currentUser.role}</span>
        </div>

        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
        <button disabled={busy} type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
};
