import React, { useState } from 'react';
import { Pencil, Plus, Shield, Trash2, UserRound, X } from 'lucide-react';
import { AppUser, ManagedUserInput, UserRole } from '../types/auth';

interface UserManagementViewProps {
  users: AppUser[];
  currentUser: AppUser;
  error: string;
  onAddUser: (input: ManagedUserInput) => Promise<AppUser>;
  onUpdateUser: (id: string, input: ManagedUserInput) => Promise<AppUser>;
  onDeleteUser: (userId: string) => Promise<void>;
}

interface UserFormState {
  username: string;
  password: string;
  role: UserRole;
}

const EMPTY_FORM: UserFormState = { username: '', password: '', role: 'user' };

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  error: loadError,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startAdd = () => {
    setEditingUserId(null);
    setIsCreating(true);
    setForm(EMPTY_FORM);
    setError('');
  };

  const startEdit = (user: AppUser) => {
    setEditingUserId(user.id);
    setIsCreating(false);
    setForm({ username: user.username, password: '', role: user.role });
    setError('');
  };

  const closeForm = () => {
    setEditingUserId(null);
    setIsCreating(false);
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = form.username.trim();
    const duplicate = users.some(
      (user) => user.id !== editingUserId && user.username.toLocaleLowerCase() === username.toLocaleLowerCase(),
    );

    if (duplicate) {
      setError('यो प्रयोगकर्ता नाम पहिल्यै प्रयोगमा छ।');
      return;
    }

    if (!editingUserId && !form.password) {
      setError('नयाँ प्रयोगकर्ताका लागि पासवर्ड आवश्यक छ।');
      return;
    }

    if (form.password && form.password.length < 8) {
      setError('पासवर्ड कम्तीमा ८ अक्षरको हुनुपर्छ।');
      return;
    }

    const existingUser = users.find((user) => user.id === editingUserId);
    if (existingUser?.role === 'admin' && form.role !== 'admin'
      && users.filter((user) => user.role === 'admin').length === 1) {
      setError('अन्तिम admin खाताको भूमिका परिवर्तन गर्न मिल्दैन।');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const input: ManagedUserInput = { username, role: form.role };
      if (form.password) input.password = form.password;
      if (existingUser) {
        await onUpdateUser(existingUser.id, input);
      } else {
        await onAddUser(input);
      }
      closeForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'परिवर्तन सुरक्षित गर्न सकिएन।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user: AppUser) => {
    if (user.id === currentUser.id) {
      setError('हाल लगइन भएको खातालाई मेटाउन मिल्दैन।');
      return;
    }

    if (user.role === 'admin' && users.filter((account) => account.role === 'admin').length === 1) {
      setError('अन्तिम admin खातालाई मेटाउन मिल्दैन।');
      return;
    }

    if (window.confirm(`"${user.username}" प्रयोगकर्तालाई मेटाउने हो?`)) {
      setError('');
      try {
        await onDeleteUser(user.id);
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'प्रयोगकर्ता मेटाउन सकिएन।');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">प्रयोगकर्ता व्यवस्थापन</h1>
          <p className="mt-1 text-sm text-slate-600">प्रणालीका खाताहरू र तिनको पहुँच भूमिका व्यवस्थापन गर्नुहोस्।</p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          नयाँ युजर थप्नुहोस्
        </button>
      </div>

      {loadError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>
      )}

      {error && !editingUserId && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {isCreating && editingUserId === null && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">नयाँ युजर खाता</h2>
            <button type="button" onClick={closeForm} className="rounded-md p-1 text-slate-500 hover:bg-white" aria-label="फाराम बन्द गर्नुहोस्">
              <X className="h-4 w-4" />
            </button>
          </div>
          <UserFormFields form={form} setForm={setForm} error={error} editing={false} />
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={closeForm} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">रद्द गर्नुहोस्</button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{isSaving ? 'सुरक्षित हुँदैछ...' : 'खाता थप्नुहोस्'}</button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          कुल प्रयोगकर्ता: {users.length}
        </div>
        <div className="divide-y divide-slate-100">
          {users.map((user) => (
            <div key={user.id} className="p-4">
              {editingUserId === user.id ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">प्रयोगकर्ता सम्पादन</h2>
                    <button type="button" onClick={closeForm} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="सम्पादन बन्द गर्नुहोस्">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <UserFormFields form={form} setForm={setForm} error={error} editing />
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={closeForm} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">रद्द गर्नुहोस्</button>
                    <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{isSaving ? 'सुरक्षित हुँदैछ...' : 'परिवर्तन सुरक्षित गर्नुहोस्'}</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      {user.role === 'admin' ? <Shield className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{user.username}</div>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                      {user.id === currentUser.id && <span className="ml-2 text-xs text-slate-500">हाल लगइन</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEdit(user)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Pencil className="h-3.5 w-3.5" />
                      सम्पादन
                    </button>
                    <button type="button" onClick={() => handleDelete(user)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                      मेटाउनुहोस्
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      <p className="text-xs leading-relaxed text-slate-500">
        प्रयोगकर्ता विवरण र password Supabase Auth बाट सुरक्षित रूपमा व्यवस्थापन हुन्छ।
      </p>
    </div>
  );
};

interface UserFormFieldsProps {
  form: UserFormState;
  setForm: React.Dispatch<React.SetStateAction<UserFormState>>;
  error: string;
  editing: boolean;
}

const UserFormFields: React.FC<UserFormFieldsProps> = ({ form, setForm, error, editing }) => (
  <>
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm font-medium text-slate-700">
        प्रयोगकर्ता नाम
        <input
          value={form.username}
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          autoComplete="off"
          required
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        {editing ? 'नयाँ पासवर्ड (वैकल्पिक)' : 'पासवर्ड'}
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          autoComplete="new-password"
          required={!editing}
          minLength={8}
          placeholder={editing ? 'परिवर्तन नगर्न खाली छोड्नुहोस्' : ''}
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        पहुँच भूमिका
        <select
          value={form.role}
          onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="user">User — सामान्य पहुँच</option>
          <option value="admin">Admin — प्रयोगकर्ता व्यवस्थापनसहित</option>
        </select>
      </label>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </>
);
