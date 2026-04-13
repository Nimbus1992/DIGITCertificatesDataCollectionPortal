export interface GuidanceEntry {
  helperText: string;
  reassurance?: string;
}

export const onboardingGuidance: Record<string, GuidanceEntry> = {
  welcome: {
    helperText: "We'll guide you through a few quick questions to get your first service up and running. It only takes a couple of minutes.",
  },
  orgName: {
    helperText: "This helps us tailor templates and settings for your organization.",
    reassurance: "You can update this anytime from your settings.",
  },
  country: {
    helperText: "We'll use this to show relevant templates and compliance settings for your region.",
    reassurance: "You can change your region later if needed.",
  },
  department: {
    helperText: "This helps us suggest the most relevant service templates for your team.",
    reassurance: "You can manage departments later from settings.",
  },
  language: {
    helperText: "This will be your default language for forms and communications.",
    reassurance: "You can add more languages later.",
  },
  personalization: {
    helperText: "Make this platform feel like your own. Add your logo and pick your colors.",
    reassurance: "These are completely optional. You can always set them up from your settings.",
  },
  templateSelection: {
    helperText: "Templates include pre-configured forms and workflows to help you get started faster.",
    reassurance: "You can fully customize them later or create your own from scratch.",
  },
  serviceName: {
    helperText: "Give your service a clear name that citizens will recognize.",
    reassurance: "You can rename this anytime from your service settings.",
  },
  approvalLevels: {
    helperText: "How many levels of approval does this service need before a permit is issued?",
    reassurance: "This creates a default workflow. You can modify approval steps anytime.",
  },
  autoSetup: {
    helperText: "We're setting everything up for you. This will just take a moment.",
  },
  deploymentSetup: {
    helperText: "This helps us configure where and how your service will be available.",
    reassurance: "You can expand availability anytime from your service settings.",
  },
  addUsers: {
    helperText: "Invite team members who will manage this service. Each person gets a specific role.",
    reassurance: "Team members will receive an email invitation. You can manage roles later.",
  },
  authSetup: {
    helperText: "Choose how your team will sign in to the platform.",
    reassurance: "Email login is enabled by default. You can add more options anytime.",
  },
  goLive: {
    helperText: "You're almost there! Review everything and launch when you're ready.",
    reassurance: "You can go live once required steps are complete. Additional settings can be configured anytime.",
  },
};
