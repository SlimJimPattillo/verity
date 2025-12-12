import { Home, FileText, Sparkles, Database, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { mockUser } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VerityLogo } from "@/components/icons/VerityLogo";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Report Builder", url: "/report-builder", icon: FileText },
  { title: "Grant Copilot", url: "/grant-copilot", icon: Sparkles },
  { title: "Asset Vault", url: "/asset-vault", icon: Database },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-primary transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-primary-foreground/20 px-4">
        <div className="flex items-center gap-3">
          <VerityLogo className="h-10 w-auto" />
          {!collapsed && (
            <span className="text-lg text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              Verity
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-white/20 text-white"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/20 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2",
            collapsed && "justify-center px-2"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-white/20 text-xs text-white">
              {mockUser.avatar}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {mockUser.name}
              </p>
              <p className="truncate text-xs text-white/70">
                {mockUser.role}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card shadow-soft hover:bg-accent"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}
