"use client"

import { useState, useTransition } from "react"
import { upsertWebEnvironmentAction } from "@/app/actions/web-dev.actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { type SafeAny } from "@/lib/utils"

export function WebEnvironmentForm({ project }: { project: SafeAny }) {
    const env = project.webEnvironment || {}
    const [isPending, startTransition] = useTransition()
    
    const [formData, setFormData] = useState({
        repositoryUrl: env.repositoryUrl || "",
        stagingUrl: env.stagingUrl || "",
        productionUrl: env.productionUrl || "",
        stackFramework: env.stackFramework || "",
        hostingProvider: env.hostingProvider || ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async () => {
        startTransition(async () => {
            try {
                await upsertWebEnvironmentAction(project.id, formData)
                toast.success("Web Environment diperbarui")
            } catch (error: unknown) {
                toast.error((error instanceof Error ? error.message : String(error)))
            }
        })
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Web Environment</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Framework / Stack</Label>
                    <Input name="stackFramework" value={formData.stackFramework} onChange={handleChange} placeholder="e.g Next.js, Laravel" className="h-7 text-xs" />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hosting Provider</Label>
                    <Input name="hostingProvider" value={formData.hostingProvider} onChange={handleChange} placeholder="e.g Vercel, AWS" className="h-7 text-xs" />
                </div>
                <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Repository URL (Git)</Label>
                    <Input name="repositoryUrl" value={formData.repositoryUrl} onChange={handleChange} placeholder="https://github.com/..." className="h-7 text-xs" />
                </div>
                <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Staging URL</Label>
                    <Input name="stagingUrl" value={formData.stagingUrl} onChange={handleChange} placeholder="https://staging..." className="h-7 text-xs" />
                </div>
                <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Production URL</Label>
                    <Input name="productionUrl" value={formData.productionUrl} onChange={handleChange} placeholder="https://production..." className="h-7 text-xs" />
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isPending} size="sm" className="h-8 text-xs">
                    {isPending ? "Menyimpan..." : "Simpan Environment"}
                </Button>
            </div>
        </div>
    )
}
