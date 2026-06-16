export interface GuidanceEntry {
  helperText: string;
  reassurance?: string;
}

export const onboardingGuidance: Record<string, GuidanceEntry> = {
  welcome: {
    helperText: "We'll guide you through a few quick questions to get your first application up and running. It only takes a couple of minutes.",
  },
  orgName: {
    helperText: "This will appear on all your licenses, documents, and communication with applicants.",
  },
  department: {
    helperText: "This helps us organize your services and define who manages applications.",
  },
  country: {
    helperText: "This helps us configure defaults like currency, phone codes, and formats for your services.",
  },
  currency: {
    helperText: "This will be used for all payments, fee calculations, and invoices.",
  },
  phoneCountryCode: {
    helperText: "This will be used for applicant phone numbers and notifications.",
  },
  language: {
    helperText: "This will be the default language for your applicants and staff. You can change or add more languages later.",
  },
  personalization: {
    helperText: "Make this platform feel like your own. Add your logo and pick your colors.",
    reassurance: "These are completely optional. You can always set them up from your settings.",
  },
  templateSelection: {
    helperText: "Choose a ready-to-use application template to get started quickly.",
    reassurance: "You can fully customize any template after selecting it.",
  },
  serviceName: {
    helperText: "Give your application a clear name that citizens will recognize.",
    reassurance: "You can rename this anytime from your application settings.",
  },
  autoSetup: {
    helperText: "We're setting everything up for you. This will just take a moment.",
  },
  deploymentSetup: {
    helperText: "This helps us configure where and how your application will be available.",
    reassurance: "You can expand availability anytime from your application settings.",
  },
  addUsers: {
    helperText: "Invite team members who will manage this application. Each person gets a specific role.",
    reassurance: "Team members will receive an email invitation. You can manage roles later.",
  },
  authSetup: {
    helperText: "Choose how your team will sign in to the platform.",
    reassurance: "Email login is enabled by default. You can add more options anytime.",
  },
  roleAccess: {
    helperText: "For each role in this application, choose how users get in: sign themselves up, or be added in advance by an admin. Authentication options update based on your choice.",
    reassurance: "You can add or change users and methods anytime after going live.",
  },
  goLive: {
    helperText: "You're almost there! Review everything and launch when you're ready.",
    reassurance: "You can go live once required steps are complete. Additional settings can be configured anytime.",
  },
};
