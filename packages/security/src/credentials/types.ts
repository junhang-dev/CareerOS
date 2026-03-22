export type SecretAccessScope =
  | "external-account-token"
  | "session-cookie"
  | "integration-api-key"
  | "agent-token";

export type SecretCredentialRecord = {
  id: string;
  scope: SecretAccessScope;
  ownerRef: string;
  secretReference: string;
  lastValidatedAt?: string;
  status: "active" | "revoked" | "expired";
};

export interface CredentialService {
  getSecret(recordId: string): Promise<string | null>;
  rotateSecret(recordId: string, secretValue: string): Promise<void>;
}

