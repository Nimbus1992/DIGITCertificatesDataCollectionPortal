export const PRODUCTS = [
  {
    slug: 'lnp',
    name: 'License, Permits & Certificates',
    description: 'End-to-end SaaS platform for issuing and managing business licenses, permits, and certificates for urban local bodies.',
    color: 'blue',
    comingSoon: false,
  },
  {
    slug: 'hcm',
    name: 'Health Campaign Management',
    description: 'Campaign planning and execution platform for public health initiatives including vaccinations and community health drives.',
    color: 'green',
    comingSoon: false,
  },
  {
    slug: 'cms',
    name: 'Complaint Management System',
    description: 'Citizen grievance tracking and resolution platform enabling transparent complaint lifecycle management for government bodies.',
    color: 'orange',
    comingSoon: false,
  },
  {
    slug: 'payments',
    name: 'Payments',
    description: 'Unified payment gateway and reconciliation platform for government-to-citizen and government-to-business transactions.',
    color: 'purple',
    comingSoon: false,
  },
  {
    slug: 'studio',
    name: 'DIGIT Studio',
    description: 'Low-code configuration studio for designing and deploying DIGIT platform modules without engineering effort.',
    color: 'gray',
    comingSoon: true,
  },
] as const;

export type ProductSlug = typeof PRODUCTS[number]['slug'];

export const PRODUCT_COLORS: Record<string, { border: string; bg: string; text: string; button: string; badge: string }> = {
  blue:   { border: 'border-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   button: 'bg-blue-600 hover:bg-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  green:  { border: 'border-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  button: 'bg-green-600 hover:bg-green-700',  badge: 'bg-green-100 text-green-700' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', button: 'bg-orange-600 hover:bg-orange-700', badge: 'bg-orange-100 text-orange-700' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', button: 'bg-purple-600 hover:bg-purple-700', badge: 'bg-purple-100 text-purple-700' },
  gray:   { border: 'border-gray-300',   bg: 'bg-gray-50',   text: 'text-gray-500',   button: 'bg-gray-400',                      badge: 'bg-gray-100 text-gray-500' },
};
