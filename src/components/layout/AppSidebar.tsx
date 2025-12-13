import { Home, FileText, Sparkles, Database, Settings, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VerityLogo } from "@/components/icons/VerityLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Report Builder", url: "/report-builder", icon: FileText },
  { title: "Grant Copilot", url: "/grant-copilot", icon: Sparkles },
  { title: "Asset Vault", url: "/asset-vault", icon: Database },
  { title: "Settings", url: "/settings", icon: Settings },
];

const STORAGE_KEY = "verity-onboarding";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserName(parsed.userName);
    }
  }, []);

  // Listen for storage changes (when onboarding updates the name)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserName(parsed.userName);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also poll for changes since storage event doesn't fire in same tab
    const interval = setInterval(handleStorageChange, 500);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const displayName = userName || "Guest";
  const initials = userName 
    ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "G";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar-background transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <VerityLogo className="h-10 w-10" inverted />
          {!collapsed && (
            <span className="text-lg text-sidebar-primary-foreground" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
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
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-sidebar-primary-foreground">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground">
                    {user?.email || 'Administrator'}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2">
              <User className="h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
