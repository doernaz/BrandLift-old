
"use client"

import { User, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAppStore } from "@/lib/store"

export function Header() {
    const { mode, toggleMode } = useAppStore()

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/60 px-6 backdrop-blur-xl transition-all">
            <div className="flex flex-1 items-center gap-2">
                <h1 className="text-lg font-semibold md:text-xl">BrandLift Portal</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50">
                    <span className={`text-xs font-bold uppercase ${mode === 'test' ? 'text-primary' : 'text-muted-foreground'}`}>Test</span>
                    <Switch
                        checked={mode === 'prod'}
                        onCheckedChange={toggleMode}
                        className="data-[state=checked]:bg-green-500"
                    />
                    <span className={`text-xs font-bold uppercase ${mode === 'prod' ? 'text-green-600' : 'text-muted-foreground'}`}>Prod (Auto)</span>
                </div>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
                </Button>
                <div className="flex items-center gap-2 border-l pl-4 ml-2">
                    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center overflow-hidden border border-border">
                        <User className="h-5 w-5 text-muted-foreground" role="img" aria-label="User Avatar" />
                    </div>
                    <div className="text-sm hidden md:block">
                        <p className="font-medium">System Admin</p>
                        <p className="text-xs text-muted-foreground">Authorized</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
