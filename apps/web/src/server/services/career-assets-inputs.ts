import type { CareerProfile } from "@careeros/domain";
import type {
  CreateCareerDocumentInput,
  CreateCareerExperienceInput,
  CreateCareerProjectInput,
  UpdateCareerDocumentInput,
  UpdateCareerExperienceInput,
  UpdateCareerProfileInput,
  UpdateCareerProjectInput
} from "../repositories/types";

export type ApiErrorBody = {
  error: string;
  code: string;
  details?: Record<string, unknown>;
};

export class InputValidationError extends Error {
  readonly status = 400;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "InputValidationError";
    this.code = code;
    this.details = details;
  }
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CAREER_DOCUMENT_TYPES = ["resume", "cover_letter", "portfolio", "note"] as const;
const CAREER_DOCUMENT_SOURCES = ["manual", "upload", "notion", "linkedin", "github"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function asTrimmedString(value: unknown) {
  return String(value ?? "").trim();
}

function parseOptionalText(value: unknown) {
  const normalized = asTrimmedString(value);
  return normalized || undefined;
}

function parseNullableText(value: unknown) {
  const normalized = asTrimmedString(value);
  return normalized || null;
}

function parseStringArray(value: unknown, field: string) {
  if (Array.isArray(value)) {
    if (!value.every((item) => typeof item === "string")) {
      throw new InputValidationError("invalid_string_array", `${field}는 문자열 배열이어야 한다.`, {
        field
      });
    }

    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string" || value === undefined || value === null) {
    return asTrimmedString(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  throw new InputValidationError("invalid_string_array", `${field}는 문자열 배열 또는 CSV 문자열이어야 한다.`, {
    field
  });
}

function parseRequiredText(value: unknown, field: string) {
  const normalized = asTrimmedString(value);

  if (!normalized) {
    throw new InputValidationError("missing_required_field", `${field}이 필요하다.`, {
      field
    });
  }

  return normalized;
}

function parseEnumValue<T extends readonly string[]>(value: unknown, field: string, allowed: T): T[number] {
  const normalized = parseRequiredText(value, field);

  if (!allowed.includes(normalized)) {
    throw new InputValidationError("invalid_enum_value", `${field} 값이 유효하지 않다.`, {
      field,
      value: normalized,
      allowed: [...allowed]
    });
  }

  return normalized;
}

function parseNullableNonNegativeNumber(value: unknown, field: string) {
  const normalized = asTrimmedString(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new InputValidationError("invalid_number", `${field}는 숫자여야 한다.`, {
      field,
      value
    });
  }

  if (parsed < 0) {
    throw new InputValidationError("negative_number", `${field}는 0 이상이어야 한다.`, {
      field,
      value: parsed
    });
  }

  return parsed;
}

function assertValidDateOnly(value: string, field: string) {
  if (!DATE_ONLY_PATTERN.test(value)) {
    throw new InputValidationError("invalid_date", `${field}는 YYYY-MM-DD 형식이어야 한다.`, {
      field,
      value
    });
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new InputValidationError("invalid_date", `${field}는 유효한 날짜여야 한다.`, {
      field,
      value
    });
  }
}

function parseRequiredDateOnly(value: unknown, field: string) {
  const normalized = parseRequiredText(value, field);
  assertValidDateOnly(normalized, field);
  return normalized;
}

function parseOptionalDateOnly(value: unknown, field: string) {
  const normalized = asTrimmedString(value);

  if (!normalized) {
    return undefined;
  }

  assertValidDateOnly(normalized, field);
  return normalized;
}

function parseFormDataText(formData: FormData, key: string) {
  return formData.get(key);
}

export function isInputValidationError(error: unknown): error is InputValidationError {
  return error instanceof InputValidationError;
}

export function toApiErrorBody(error: InputValidationError): ApiErrorBody {
  return {
    error: error.message,
    code: error.code,
    ...(error.details ? { details: error.details } : {})
  };
}

export function createApiErrorBody(
  error: string,
  code: string,
  details?: Record<string, unknown>
): ApiErrorBody {
  return {
    error,
    code,
    ...(details ? { details } : {})
  };
}

export function mergeCareerProfileUpdate(current: CareerProfile, input: UpdateCareerProfileInput) {
  return {
    headline: input.headline === undefined ? current.headline : input.headline ?? undefined,
    bio: input.bio === undefined ? current.bio : input.bio ?? undefined,
    yearsExperience:
      input.yearsExperience === undefined ? current.yearsExperience : input.yearsExperience ?? undefined,
    targetRoles: input.targetRoles === undefined ? current.targetRoles : input.targetRoles
  };
}

export function assertCareerExperienceDates(startDate: string, endDate?: string) {
  assertValidDateOnly(startDate, "startDate");

  if (endDate !== undefined) {
    assertValidDateOnly(endDate, "endDate");
  }

  if (endDate && endDate < startDate) {
    throw new InputValidationError(
      "invalid_date_range",
      "endDate는 startDate보다 이전일 수 없다.",
      { startDate, endDate }
    );
  }
}

export function toUtcDateOnly(startDate: string) {
  assertValidDateOnly(startDate, "date");
  return new Date(`${startDate}T00:00:00.000Z`);
}

export function formatDateOnly(value?: string | Date | null) {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    if (DATE_ONLY_PATTERN.test(value)) {
      return value;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new InputValidationError("invalid_date", "date는 유효한 날짜여야 한다.", { value });
    }

    return parsed.toISOString().slice(0, 10);
  }

  if (Number.isNaN(value.getTime())) {
    throw new InputValidationError("invalid_date", "date는 유효한 날짜여야 한다.");
  }

  return value.toISOString().slice(0, 10);
}

export function parseCareerProfilePatch(input: unknown): UpdateCareerProfileInput {
  if (!isRecord(input)) {
    throw new InputValidationError("invalid_payload", "profile payload는 object여야 한다.");
  }

  const patch: UpdateCareerProfileInput = {};

  if (hasOwn(input, "headline")) {
    patch.headline = parseNullableText(input.headline);
  }

  if (hasOwn(input, "bio")) {
    patch.bio = parseNullableText(input.bio);
  }

  if (hasOwn(input, "yearsExperience")) {
    patch.yearsExperience = parseNullableNonNegativeNumber(input.yearsExperience, "yearsExperience");
  }

  if (hasOwn(input, "targetRoles")) {
    patch.targetRoles = parseStringArray(input.targetRoles, "targetRoles");
  }

  return patch;
}

export function parseCareerProfilePatchFormData(formData: FormData): UpdateCareerProfileInput {
  return {
    headline: parseNullableText(parseFormDataText(formData, "headline")),
    bio: parseNullableText(parseFormDataText(formData, "bio")),
    yearsExperience: parseNullableNonNegativeNumber(
      parseFormDataText(formData, "yearsExperience"),
      "yearsExperience"
    ),
    targetRoles: parseStringArray(parseFormDataText(formData, "targetRoles"), "targetRoles")
  };
}

export function parseCareerExperienceCreate(input: unknown): CreateCareerExperienceInput {
  if (!isRecord(input)) {
    throw new InputValidationError("invalid_payload", "career experience payload는 object여야 한다.");
  }

  const parsed = {
    company: parseRequiredText(input.company, "company"),
    role: parseRequiredText(input.role, "role"),
    startDate: parseRequiredDateOnly(input.startDate, "startDate"),
    endDate: parseOptionalDateOnly(input.endDate, "endDate"),
    description: parseOptionalText(input.description),
    achievements: parseStringArray(input.achievements, "achievements")
  };

  assertCareerExperienceDates(parsed.startDate, parsed.endDate);
  return parsed;
}

export function parseCareerExperienceCreateFormData(formData: FormData): CreateCareerExperienceInput {
  const parsed = {
    company: parseRequiredText(parseFormDataText(formData, "company"), "company"),
    role: parseRequiredText(parseFormDataText(formData, "role"), "role"),
    startDate: parseRequiredDateOnly(parseFormDataText(formData, "startDate"), "startDate"),
    endDate: parseOptionalDateOnly(parseFormDataText(formData, "endDate"), "endDate"),
    description: parseOptionalText(parseFormDataText(formData, "description")),
    achievements: parseStringArray(parseFormDataText(formData, "achievements"), "achievements")
  };

  assertCareerExperienceDates(parsed.startDate, parsed.endDate);
  return parsed;
}

export function parseCareerExperienceUpdate(
  id: string,
  input: unknown
): UpdateCareerExperienceInput {
  const normalizedId = parseRequiredText(id, "id");
  return {
    id: normalizedId,
    ...parseCareerExperienceCreate(input)
  };
}

export function parseCareerExperienceUpdateFormData(formData: FormData): UpdateCareerExperienceInput {
  const id = parseRequiredText(parseFormDataText(formData, "id"), "id");
  return {
    id,
    ...parseCareerExperienceCreateFormData(formData)
  };
}

export function parseCareerProjectCreate(input: unknown): CreateCareerProjectInput {
  if (!isRecord(input)) {
    throw new InputValidationError("invalid_payload", "career project payload는 object여야 한다.");
  }

  return {
    name: parseRequiredText(input.name, "name"),
    role: parseOptionalText(input.role),
    description: parseOptionalText(input.description),
    outcomes: parseStringArray(input.outcomes, "outcomes"),
    technologies: parseStringArray(input.technologies, "technologies")
  };
}

export function parseCareerProjectCreateFormData(formData: FormData): CreateCareerProjectInput {
  return {
    name: parseRequiredText(parseFormDataText(formData, "name"), "name"),
    role: parseOptionalText(parseFormDataText(formData, "role")),
    description: parseOptionalText(parseFormDataText(formData, "description")),
    outcomes: parseStringArray(parseFormDataText(formData, "outcomes"), "outcomes"),
    technologies: parseStringArray(parseFormDataText(formData, "technologies"), "technologies")
  };
}

export function parseCareerProjectUpdate(id: string, input: unknown): UpdateCareerProjectInput {
  const normalizedId = parseRequiredText(id, "id");
  return {
    id: normalizedId,
    ...parseCareerProjectCreate(input)
  };
}

export function parseCareerProjectUpdateFormData(formData: FormData): UpdateCareerProjectInput {
  const id = parseRequiredText(parseFormDataText(formData, "id"), "id");
  return {
    id,
    ...parseCareerProjectCreateFormData(formData)
  };
}

function parseStructuredObject(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") {
    return {};
  }

  if (isRecord(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) {
      return {};
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(normalized);
    } catch {
      throw new InputValidationError("invalid_json", `${field}는 JSON object여야 한다.`, {
        field
      });
    }

    if (isRecord(parsed)) {
      return parsed;
    }
  }

  throw new InputValidationError("invalid_json_object", `${field}는 JSON object여야 한다.`, {
    field
  });
}

function parseOptionalPositiveInteger(value: unknown, field: string) {
  const normalized = asTrimmedString(value);

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new InputValidationError("invalid_positive_integer", `${field}는 1 이상의 정수여야 한다.`, {
      field,
      value
    });
  }

  return parsed;
}

function parseCareerDocumentBase(input: Record<string, unknown>): CreateCareerDocumentInput {
  return {
    docType: parseEnumValue(input.docType, "docType", CAREER_DOCUMENT_TYPES),
    title: parseRequiredText(input.title, "title"),
    sourceType: parseEnumValue(input.sourceType, "sourceType", CAREER_DOCUMENT_SOURCES),
    storagePath: parseOptionalText(input.storagePath),
    parsedText: parseOptionalText(input.parsedText),
    structured: parseStructuredObject(input.structured ?? input.structuredJson, "structured")
  };
}

export function parseCareerDocumentCreate(input: unknown): CreateCareerDocumentInput {
  if (!isRecord(input)) {
    throw new InputValidationError("invalid_payload", "career document payload는 object여야 한다.");
  }

  return parseCareerDocumentBase(input);
}

export function parseCareerDocumentCreateFormData(formData: FormData): CreateCareerDocumentInput {
  return parseCareerDocumentBase({
    docType: parseFormDataText(formData, "docType"),
    title: parseFormDataText(formData, "title"),
    sourceType: parseFormDataText(formData, "sourceType"),
    storagePath: parseFormDataText(formData, "storagePath"),
    parsedText: parseFormDataText(formData, "parsedText"),
    structured: parseFormDataText(formData, "structuredJson")
  });
}

export function parseCareerDocumentUpdate(id: string, input: unknown): UpdateCareerDocumentInput {
  const normalizedId = parseRequiredText(id, "id");

  if (!isRecord(input)) {
    throw new InputValidationError("invalid_payload", "career document payload는 object여야 한다.");
  }

  return {
    id: normalizedId,
    ...parseCareerDocumentBase(input),
    version: parseOptionalPositiveInteger(input.version, "version")
  };
}

export function parseCareerDocumentUpdateFormData(formData: FormData): UpdateCareerDocumentInput {
  const id = parseRequiredText(parseFormDataText(formData, "id"), "id");

  return {
    id,
    ...parseCareerDocumentCreateFormData(formData),
    version: parseOptionalPositiveInteger(parseFormDataText(formData, "version"), "version")
  };
}
