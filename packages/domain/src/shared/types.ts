export type UUID = string;
export type ISODateString = string;
export type TimestampString = string;

export type JsonObject = Record<string, unknown>;
export type JsonArray = Array<unknown>;
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

export type LocalizedText = {
  locale: string;
  text: string;
};

export type AuditStamp = {
  createdAt: TimestampString;
  updatedAt: TimestampString;
};

export type EntityRef = {
  id: UUID;
};

