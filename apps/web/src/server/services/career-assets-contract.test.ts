import assert from "node:assert/strict";
import test from "node:test";
import { getMockDatabase, resetMockDatabase } from "../data/mock-state";
import {
  formatDateOnly,
  parseCareerProfilePatch
} from "./career-assets-inputs";
import { PUT as putCareerProfile } from "../../app/api/career-assets/profile/route";
import { POST as postCareerExperience } from "../../app/api/career-assets/experiences/route";
import {
  DELETE as deleteCareerExperience,
  PUT as putCareerExperience
} from "../../app/api/career-assets/experiences/[experienceId]/route";
import { POST as postCareerProject } from "../../app/api/career-assets/projects/route";
import {
  DELETE as deleteCareerProject,
  PUT as putCareerProject
} from "../../app/api/career-assets/projects/[projectId]/route";
import { POST as postCareerDocument } from "../../app/api/career-assets/route";
import {
  DELETE as deleteCareerDocument,
  PUT as putCareerDocument
} from "../../app/api/career-assets/[documentId]/route";

process.env.CAREEROS_DATA_DRIVER = "memory";

function createJsonRequest(method: string, payload: unknown) {
  return new Request("http://localhost/api/test", {
    method,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

test.beforeEach(() => {
  resetMockDatabase();
});

test("profile partial update keeps unspecified fields", async () => {
  const initialProfile = structuredClone(getMockDatabase().careerProfile);
  const response = await putCareerProfile(createJsonRequest("PUT", { headline: "Updated Headline" }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.headline, "Updated Headline");
  assert.equal(body.bio, initialProfile.bio);
  assert.equal(body.yearsExperience, initialProfile.yearsExperience);
  assert.deepEqual(body.targetRoles, initialProfile.targetRoles);
});

test("profile rejects invalid yearsExperience", async () => {
  const response = await putCareerProfile(
    createJsonRequest("PUT", { yearsExperience: "not-a-number" })
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.code, "invalid_number");
});

test("experience create rejects invalid startDate", async () => {
  const response = await postCareerExperience(
    createJsonRequest("POST", {
      company: "Demo",
      role: "Engineer",
      startDate: "2026-02-30"
    })
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.code, "invalid_date");
});

test("experience create rejects endDate earlier than startDate", async () => {
  const response = await postCareerExperience(
    createJsonRequest("POST", {
      company: "Demo",
      role: "Engineer",
      startDate: "2026-03-10",
      endDate: "2026-03-09"
    })
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.code, "invalid_date_range");
});

test("experience create returns YYYY-MM-DD and update/delete honor 404", async () => {
  const createResponse = await postCareerExperience(
    createJsonRequest("POST", {
      company: "New Co",
      role: "Engineer",
      startDate: "2026-03-10",
      endDate: "2026-03-11",
      achievements: "One, Two"
    })
  );
  const created = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.equal(created.startDate, "2026-03-10");
  assert.equal(created.endDate, "2026-03-11");
  assert.deepEqual(created.achievements, ["One", "Two"]);

  const missingUpdateResponse = await putCareerExperience(
    createJsonRequest("PUT", {
      company: "Missing",
      role: "Engineer",
      startDate: "2026-03-10"
    }),
    {
      params: Promise.resolve({ experienceId: "missing-experience" })
    }
  );
  const missingUpdateBody = await missingUpdateResponse.json();

  assert.equal(missingUpdateResponse.status, 404);
  assert.equal(missingUpdateBody.code, "career_experience_not_found");

  const missingDeleteResponse = await deleteCareerExperience(new Request("http://localhost", { method: "DELETE" }), {
    params: Promise.resolve({ experienceId: "missing-experience" })
  });
  const missingDeleteBody = await missingDeleteResponse.json();

  assert.equal(missingDeleteResponse.status, 404);
  assert.equal(missingDeleteBody.code, "career_experience_not_found");
});

test("project create rejects empty name and update/delete honor 404", async () => {
  const createResponse = await postCareerProject(
    createJsonRequest("POST", {
      name: "   "
    })
  );
  const createBody = await createResponse.json();

  assert.equal(createResponse.status, 400);
  assert.equal(createBody.code, "missing_required_field");

  const missingUpdateResponse = await putCareerProject(
    createJsonRequest("PUT", {
      name: "Missing Project"
    }),
    {
      params: Promise.resolve({ projectId: "missing-project" })
    }
  );
  const missingUpdateBody = await missingUpdateResponse.json();

  assert.equal(missingUpdateResponse.status, 404);
  assert.equal(missingUpdateBody.code, "career_project_not_found");

  const missingDeleteResponse = await deleteCareerProject(new Request("http://localhost", { method: "DELETE" }), {
    params: Promise.resolve({ projectId: "missing-project" })
  });
  const missingDeleteBody = await missingDeleteResponse.json();

  assert.equal(missingDeleteResponse.status, 404);
  assert.equal(missingDeleteBody.code, "career_project_not_found");
});

test("document create validates enum and structured JSON", async () => {
  const invalidTypeResponse = await postCareerDocument(
    createJsonRequest("POST", {
      docType: "memo",
      title: "Resume",
      sourceType: "manual"
    })
  );
  const invalidTypeBody = await invalidTypeResponse.json();

  assert.equal(invalidTypeResponse.status, 400);
  assert.equal(invalidTypeBody.code, "invalid_enum_value");

  const invalidStructuredResponse = await postCareerDocument(
    createJsonRequest("POST", {
      docType: "resume",
      title: "Resume",
      sourceType: "manual",
      structuredJson: "[]"
    })
  );
  const invalidStructuredBody = await invalidStructuredResponse.json();

  assert.equal(invalidStructuredResponse.status, 400);
  assert.equal(invalidStructuredBody.code, "invalid_json_object");
});

test("document create/update/delete share not-found and version contracts", async () => {
  const createResponse = await postCareerDocument(
    createJsonRequest("POST", {
      docType: "resume",
      title: "Resume 2026",
      sourceType: "manual",
      structuredJson: "{\"sections\":[\"summary\"]}"
    })
  );
  const created = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.equal(created.title, "Resume 2026");
  assert.deepEqual(created.structured, { sections: ["summary"] });
  assert.equal(created.version, 1);

  const updateResponse = await putCareerDocument(
    createJsonRequest("PUT", {
      docType: "resume",
      title: "Resume 2026 Q2",
      sourceType: "manual",
      version: 2,
      structured: { sections: ["summary", "experience"] }
    }),
    {
      params: Promise.resolve({ documentId: created.id })
    }
  );
  const updated = await updateResponse.json();

  assert.equal(updateResponse.status, 200);
  assert.equal(updated.title, "Resume 2026 Q2");
  assert.equal(updated.version, 2);
  assert.deepEqual(updated.structured, { sections: ["summary", "experience"] });

  const invalidVersionResponse = await putCareerDocument(
    createJsonRequest("PUT", {
      docType: "resume",
      title: "Resume",
      sourceType: "manual",
      version: 0
    }),
    {
      params: Promise.resolve({ documentId: created.id })
    }
  );
  const invalidVersionBody = await invalidVersionResponse.json();

  assert.equal(invalidVersionResponse.status, 400);
  assert.equal(invalidVersionBody.code, "invalid_positive_integer");

  const missingDeleteResponse = await deleteCareerDocument(new Request("http://localhost", { method: "DELETE" }), {
    params: Promise.resolve({ documentId: "missing-document" })
  });
  const missingDeleteBody = await missingDeleteResponse.json();

  assert.equal(missingDeleteResponse.status, 404);
  assert.equal(missingDeleteBody.code, "career_document_not_found");
});

test("shared helpers normalize profile patch and date formatting", () => {
  const parsedPatch = parseCareerProfilePatch({
    headline: "  Updated  ",
    targetRoles: "Backend Engineer, Platform Engineer",
    yearsExperience: ""
  });

  assert.deepEqual(parsedPatch, {
    headline: "Updated",
    yearsExperience: null,
    targetRoles: ["Backend Engineer", "Platform Engineer"]
  });
  assert.equal(formatDateOnly(new Date("2026-03-10T00:00:00.000Z")), "2026-03-10");
  assert.equal(formatDateOnly("2026-03-11T15:10:00.000Z"), "2026-03-11");
});
