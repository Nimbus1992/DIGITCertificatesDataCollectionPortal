import type { PlatformRole } from "@/contexts/OnboardingContext";

export interface MockCredential {
  email: string;
  tempPassword: string;
  role: PlatformRole;
  name: string;
  hint: string;
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  {
    email: "tahera@gov.in",
    tempPassword: "Temp@1234",
    role: "super_admin",
    name: "Tahera Ahmed",
    hint: "Full platform access. Runs the onboarding flow.",
  },
  {
    email: "joanna@gov.in",
    tempPassword: "Temp@1234",
    role: "admin",
    name: "Joanna Lee",
    hint: "Platform-wide access. Cannot manage Admin accounts.",
  },
  {
    email: "meera@gov.in",
    tempPassword: "Temp@1234",
    role: "service_owner",
    name: "Meera Iyer",
    hint: "Sees only their assigned service. Guided setup on first login.",
  },
];
