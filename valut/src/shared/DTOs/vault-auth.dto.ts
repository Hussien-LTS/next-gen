interface VaultInfo {
  id: number;
  name: string;
  url: string;
}

export interface VeevaAuthDTO {
  responseStatus: string;
  sessionId: string;
  userId: number;
  vaultIds: VaultInfo[];
  vaultId: number;
}
