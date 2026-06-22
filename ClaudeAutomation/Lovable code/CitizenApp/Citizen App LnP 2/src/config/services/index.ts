import type { ServiceConfig } from "../types";
import { tradeLicense } from "./trade-license";
import { buildingPermit } from "./building-permit";
import { fireNoc } from "./fire-noc";

export const SERVICES: ServiceConfig[] = [tradeLicense, buildingPermit, fireNoc];

export function getService(id: string): ServiceConfig | undefined {
  return SERVICES.find((s) => s.id === id);
}