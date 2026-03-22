export type StorageObjectRef = {
  bucket: string;
  key: string;
  contentType?: string;
};

export interface ObjectStorageGateway {
  putObject(ref: StorageObjectRef, body: string | Uint8Array): Promise<void>;
  getSignedUrl(ref: StorageObjectRef, expiresInSeconds: number): Promise<string>;
}

