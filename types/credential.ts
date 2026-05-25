export interface Credential {
  id: string;
  user_id: string;
  service: string;
  label: string;
  created_at: string;
  // encrypted_token is intentionally omitted from the frontend type
  // to ensure it never accidentally leaks to the client.
}

export interface CreateCredentialInput {
  service: string;
  label: string;
  token: string;
}
