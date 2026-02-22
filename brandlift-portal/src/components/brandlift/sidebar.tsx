
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Radar, ArrowBigLeft, Settings, Rocket, LogOut } from "lucide-react"

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Scanner", href: "/dashboard/scanner", icon: Radar },
    { name: "Deployments", href: "/dashboard/deployments", icon: Rocket },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    return (
        <div className={cn("hidden border-r bg-background/80 backdrop-blur-md lg:block w-64 h-screen fixed top-0 left-0 flex flex-col justify-between p-4", className)}>
            <div className="space-y-4">
                <div className="px-3 py-2">
                    <Link href="/dashboard" className="flex items-center gap-2 mb-8">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] border border-primary/50 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <span className="text-primary-foreground font-bold text-lg font-mono relative z-10">B</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">BrandLift</h2>
                    </Link>
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    pathname === item.href
                                        ? "bg-muted text-primary font-medium"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="px-3 py-4 border-t">
                <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </div>
            </div>
        </div>
    )
}
