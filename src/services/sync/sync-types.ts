export type SyncStatus = {
  pendingSync?: boolean;
  syncError?: string | null;
  syncedAt?: string | null;
  remoteId?: string;
};

export type SyncResult<T> = {
  data: T | null;
  error: string | null;
  pendingSync: boolean;
};

export type RemoteMutationResult = {
  remoteId?: string;
  syncedAt?: string;
};
