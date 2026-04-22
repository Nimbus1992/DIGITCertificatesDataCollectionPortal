import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  MapPin,
  Lock,
  KeyRound,
  Palette,
  Languages,
  Bell,
  Plug,
  ClipboardList,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

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
import { Shield } from "lucide-react";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Services", url: "/services", icon: FileText },
  { title: "Applications", url: "/applications", icon: ClipboardList },
];

const setupItems = [
  { title: "Organization Profile", url: "/setup/organization", icon: Building2 },
  { title: "Users & Roles", url: "/setup/users", icon: Users },
  { title: "Service Areas", url: "/setup/deployment", icon: MapPin },
  { title: "Authentication", url: "/setup/auth", icon: Lock },
  { title: "License & Billing", url: "/setup/license", icon: KeyRound },
];

const configItems = [
  { title: "Branding & Theme", url: "/config/branding", icon: Palette },
  { title: "Languages", url: "/config/languages", icon: Languages },
  { title: "Integrations", url: "/config/integrations", icon: Plug },
];

const utilItems = [
  { title: "Audit Log", url: "/audit-log", icon: Shield },
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
                  className="hover:bg-sidebar-accent/50"
                  activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
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

export function AppSidebar() {
  const { state } = useOnboarding();
  const { user, signOut } = useAuth();
  const { state: sidebarState } = useSidebar();
  const { logoDataUrl, portalName } = useTheme();
  const collapsed = sidebarState === "collapsed";

  const displayName = portalName || state.orgName || "LnP Platform";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt="Logo"
              className="h-7 w-7 object-contain rounded shrink-0"
            />
          ) : (
            <Shield className="h-6 w-6 text-sidebar-primary shrink-0" />
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {displayName}
              </p>
              {state.department && (
                <p className="text-xs text-sidebar-foreground/60 truncate">{state.department}</p>
              )}
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

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          {!collapsed && (
            <p className="text-xs text-sidebar-foreground/60 truncate flex-1 min-w-0">
              {user?.email}
            </p>
          )}
          <button
            onClick={signOut}
            title="Sign out"
            className="p-1.5 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
