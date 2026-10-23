import { Session } from '@supabase/supabase-js';
import { AppUser, ManagedUserInput, UserRole } from '../types/auth';
import { TrackedProject } from '../types/procurement';
import { Database, Json, supabase, usernameToEmail } from './supabase';

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase सेटअप भएको छैन।');
  return supabase;
};

const requireData = <T,>(data: T | null, error: { message: string } | null): T => {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error('Supabase बाट अपेक्षित विवरण प्राप्त भएन।');
  return data;
};

export const signInWithUsername = async (username: string, password: string): Promise<AppUser> => {
  const client = requireSupabase();
  const login = username.trim();
  const { data, error } = await client.auth.signInWithPassword({
    email: login.includes('@') ? login.toLocaleLowerCase() : usernameToEmail(login),
    password,
  });
  const authUser = requireData(data.user, error);
  return getAppUser(authUser.id);
};

export const signUpWithEmail = async (
  username: string,
  email: string,
  password: string,
): Promise<AppUser | null> => {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { username: username.trim().toLocaleLowerCase() },
      emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
    },
  });
  if (error) throw new Error(error.message);
  return data.session && data.user ? getAppUser(data.user.id) : null;
};

export const getAppUser = async (userId: string): Promise<AppUser> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('user_profiles')
    .select('id, username, role, created_at')
    .eq('id', userId)
    .single();
  const profile = requireData(data, error);
  return {
    id: profile.id,
    username: profile.username,
    role: profile.role,
    createdAt: profile.created_at,
  };
};

export const restoreSessionUser = async (): Promise<AppUser | null> => {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw new Error(error.message);
  const session: Session | null = data.session;
  return session ? getAppUser(session.user.id) : null;
};

export const signOut = async (): Promise<void> => {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw new Error(error.message);
};

type ProjectRow = Database['public']['Tables']['procurement_projects']['Row'];

const readChecklistStatus = (value: Json): Record<string, boolean> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('आयोजनाको checklist विवरणको ढाँचा अमान्य छ।');
  }
  const status: Record<string, boolean> = {};
  for (const [id, checked] of Object.entries(value)) {
    if (typeof checked !== 'boolean') {
      throw new Error('आयोजनाको checklist विवरणको ढाँचा अमान्य छ।');
    }
    status[id] = checked;
  }
  return status;
};

const fromProjectRow = (row: ProjectRow): TrackedProject => ({
  id: row.id,
  title: row.title,
  officeName: row.office_name,
  procurementType: row.procurement_type,
  methodId: row.method_id,
  estimatedAmount: Number(row.estimated_amount),
  currentStageId: row.current_stage_id,
  progressPercent: row.progress_percent,
  budgetSource: row.budget_source,
  startDate: row.start_date,
  targetCompletionDate: row.target_completion_date,
  contractorName: row.contractor_name ?? undefined,
  contractAmount: row.contract_amount === null ? undefined : Number(row.contract_amount),
  checklistStatus: readChecklistStatus(row.checklist_status),
  notes: row.notes ?? undefined,
});

const toProjectRow = (project: TrackedProject) => ({
  id: project.id,
  title: project.title,
  office_name: project.officeName,
  procurement_type: project.procurementType,
  method_id: project.methodId,
  estimated_amount: project.estimatedAmount,
  current_stage_id: project.currentStageId,
  progress_percent: project.progressPercent,
  budget_source: project.budgetSource,
  start_date: project.startDate,
  target_completion_date: project.targetCompletionDate,
  contractor_name: project.contractorName ?? null,
  contract_amount: project.contractAmount ?? null,
  checklist_status: project.checklistStatus,
  notes: project.notes ?? null,
});

export const listProjects = async (): Promise<TrackedProject[]> => {
  const { data, error } = await requireSupabase()
    .from('procurement_projects')
    .select('*')
    .order('created_at', { ascending: false });
  return requireData(data, error).map(fromProjectRow);
};

export const createProject = async (
  project: TrackedProject,
  ownerId: string,
): Promise<TrackedProject> => {
  const { data, error } = await requireSupabase()
    .from('procurement_projects')
    .insert({ ...toProjectRow(project), owner_id: ownerId })
    .select('*')
    .single();
  return fromProjectRow(requireData(data, error));
};

export const updateProject = async (project: TrackedProject): Promise<TrackedProject> => {
  const { data, error } = await requireSupabase()
    .from('procurement_projects')
    .update(toProjectRow(project))
    .eq('id', project.id)
    .select('*')
    .single();
  return fromProjectRow(requireData(data, error));
};

interface UserFunctionResponse {
  users?: Array<{ id: string; username: string; role: UserRole; created_at: string }>;
  user?: { id: string; username: string; role: UserRole; created_at: string };
}

const invokeUserFunction = async (body: Record<string, unknown>): Promise<UserFunctionResponse> => {
  const { data, error } = await requireSupabase().functions.invoke('manage-users', { body });
  if (error) {
    const response = error.context;
    if (response instanceof Response) {
      const responseBody: unknown = await response.json();
      if (responseBody && typeof responseBody === 'object' && 'error' in responseBody
        && typeof responseBody.error === 'string') {
        throw new Error(responseBody.error);
      }
    }
    throw new Error(error.message);
  }
  if (!data || typeof data !== 'object') throw new Error('User management response अमान्य छ।');
  return data as UserFunctionResponse;
};

const mapUser = (user: NonNullable<UserFunctionResponse['user']>): AppUser => ({
  id: user.id,
  username: user.username,
  role: user.role,
  createdAt: user.created_at,
});

export const listManagedUsers = async (): Promise<AppUser[]> => {
  const response = await invokeUserFunction({ action: 'list' });
  if (!response.users) throw new Error('प्रयोगकर्ता सूची प्राप्त भएन।');
  return response.users.map(mapUser);
};

export const createManagedUser = async (input: ManagedUserInput): Promise<AppUser> => {
  const response = await invokeUserFunction({ action: 'create', ...input });
  if (!response.user) throw new Error('नयाँ प्रयोगकर्ता विवरण प्राप्त भएन।');
  return mapUser(response.user);
};

export const updateManagedUser = async (id: string, input: ManagedUserInput): Promise<AppUser> => {
  const response = await invokeUserFunction({ action: 'update', id, ...input });
  if (!response.user) throw new Error('परिवर्तित प्रयोगकर्ता विवरण प्राप्त भएन।');
  return mapUser(response.user);
};

export const deleteManagedUser = async (id: string): Promise<void> => {
  await invokeUserFunction({ action: 'delete', id });
};
