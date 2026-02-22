
import { Sidebar } from "@/components/brandlift/sidebar"
import { Header } from "@/components/brandlift/header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar className="hidden lg:block w-64 border-r" />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-64">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
                    <div className="relative z-10 max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
