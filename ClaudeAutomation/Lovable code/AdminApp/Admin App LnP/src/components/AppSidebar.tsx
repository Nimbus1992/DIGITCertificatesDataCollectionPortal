import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  MapPin,
  Lock,
  Palette,
  Languages,
  Bell,
  Plug,
  ClipboardList,
  HelpCircle,
  Settings,
  LogOut,
  Shield,
  UserCog,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import cityOfCapeTownLogo from "@/assets/city-of-cape-town-logo.png";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { MOCK_CREDENTIALS } from "@/data/mockCredentials";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";


const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Templates", url: "/services", icon: FileText },
];

const setupItems = [
  { title: "Organization Profile", url: "/setup/organization", icon: Building2 },
  { title: "Users & Access", url: "/setup/users", icon: Users },
  { title: "Application Areas", url: "/setup/deployment", icon: MapPin },
  { title: "Authentication", url: "/setup/auth", icon: Lock },
];

const configItems = [
  { title: "Branding & Theme", url: "/config/branding", icon: Palette },
  { title: "Languages", url: "/config/languages", icon: Languages },
  
  { title: "Integrations", url: "/config/integrations", icon: Plug },
];

const utilItems = [
  { title: "Audit Log", url: "/audit-log", icon: ClipboardList },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items }: { label: string; items: typeof mainItems }) {
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                <NavLink
                  to={item.url}
                  end
                  className="hover:bg-sidebar-accent/40 text-sidebar-foreground/80"
                  activeClassName="bg-sidebar-accent/60 text-sidebar-foreground font-medium border-l-2 border-sidebar-primary"
                  aria-current={location.pathname === item.url ? "page" : undefined}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>

              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  service_owner: "Service Owner",
};

export function AppSidebar() {
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  const { state: onboarding, signOut } = useOnboarding();
  const navigate = useNavigate();

  const currentUser = MOCK_CREDENTIALS.find((c) => c.email === onboarding.email);
  const displayName = currentUser?.name || onboarding.email || "User";
  const displayRole = ROLE_LABEL[onboarding.currentUserRole] || "Admin";
  const initials = displayName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  function handleSignOut() {
    signOut();
    navigate("/onboarding");
  }

  return (
    <Sidebar collapsible="offcanvas" aria-label="Main navigation">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img
            src={cityOfCapeTownLogo}
            alt="City of Cape Town"
            className="h-7 w-7 object-contain shrink-0 rounded-sm bg-white/10"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                City of Cape Town
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">Admin Console</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Main" items={mainItems} />
        <NavGroup label="Setup" items={setupItems} />
        <NavGroup label="Configuration" items={configItems} />
        <NavGroup label="Utilities" items={utilItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{displayRole}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="shrink-0 p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
