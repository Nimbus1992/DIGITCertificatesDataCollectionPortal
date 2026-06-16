export interface CountryDefault {
  name: string;
  currency: string; // ISO code
  currencySymbol: string;
  phoneCode: string; // e.g., "+91"
}

export const countries: CountryDefault[] = [
  { name: "United States", currency: "USD", currencySymbol: "$", phoneCode: "+1" },
  { name: "India", currency: "INR", currencySymbol: "₹", phoneCode: "+91" },
  { name: "United Kingdom", currency: "GBP", currencySymbol: "£", phoneCode: "+44" },
  { name: "Canada", currency: "CAD", currencySymbol: "C$", phoneCode: "+1" },
  { name: "Australia", currency: "AUD", currencySymbol: "A$", phoneCode: "+61" },
  { name: "United Arab Emirates", currency: "AED", currencySymbol: "د.إ", phoneCode: "+971" },
  { name: "Saudi Arabia", currency: "SAR", currencySymbol: "﷼", phoneCode: "+966" },
  { name: "Singapore", currency: "SGD", currencySymbol: "S$", phoneCode: "+65" },
];

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

export const currencies: CurrencyOption[] = [
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "INR", symbol: "₹", label: "Indian Rupee (INR)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
  { code: "EUR", symbol: "€", label: "Euro (EUR)" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar (CAD)" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar (AUD)" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham (AED)" },
  { code: "SAR", symbol: "﷼", label: "Saudi Riyal (SAR)" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar (SGD)" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen (JPY)" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan (CNY)" },
];

export const phoneCodes: string[] = [
  "+1", "+44", "+91", "+61", "+65", "+971", "+966", "+81", "+86", "+49", "+33", "+34", "+39", "+27", "+55", "+52",
];

export function getCountryDefaults(name: string): CountryDefault | undefined {
  return countries.find((c) => c.name === name);
}
