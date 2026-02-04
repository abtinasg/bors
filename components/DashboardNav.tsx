"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  LogOut,
  Home,
  PieChart,
  Star,
  LineChart,
  ArrowLeftRight,
  BarChart3,
} from "lucide-react";

interface User {
  id: string;
  phone: string;
  name: string | null;
}

interface DashboardNavProps {
  user: User;
  onLogout: () => void;
}

const navTabs = [
  { id: "home", label: "خانه", href: "/dashboard", icon: Home },
  { id: "portfolio", label: "پرتفوی", href: "/dashboard/portfolio", icon: PieChart },
  { id: "watchlist", label: "واچ‌لیست", href: "/dashboard/watchlist", icon: Star },
  { id: "market", label: "بازار", href: "/dashboard/market", icon: LineChart },
  { id: "analysis", label: "تحلیل", href: "/dashboard/analysis", icon: BarChart3 },
  { id: "converter", label: "تبدیل ارز", href: "/dashboard/converter", icon: ArrowLeftRight },
];

export default function DashboardNav({ user, onLogout }: DashboardNavProps) {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === "/dashboard") return "home";
    if (pathname.startsWith("/dashboard/portfolio")) return "portfolio";
    if (pathname.startsWith("/dashboard/watchlist")) return "watchlist";
    if (pathname.startsWith("/dashboard/market")) return "market";
    if (pathname.startsWith("/dashboard/analysis")) return "analysis";
    if (pathname.startsWith("/dashboard/converter")) return "converter";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-700 text-lg">
              B
            </div>
            <span className="text-xl font-bold text-slate-800">
              برس
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1 bg-slate-50 rounded-xl p-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    isActive
                      ? "bg-white text-slate-900 border border-slate-200 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="خروج"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 font-medium">
            {user.name ? user.name[0] : user.phone.slice(-2)}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 border border-slate-200 shadow-sm"
                    : "text-slate-600 bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
