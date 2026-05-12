"use client"

import { useState } from "react"
import { InfrastructureProjectCard } from "./infra-project-card"
import { Pagination } from "@/components/ui/pagination"
import { Prisma } from "@prisma/client"

const PROJECTS_PER_PAGE = 6

type ProjectWithRelations = Prisma.ProjectGetPayload<{
    include: { manager: { select: { name: true } } }
}>;

export function InfrastructureList({ initialProjects }: { initialProjects: ProjectWithRelations[] }) {
    const [currentPage, setCurrentPage] = useState(1)

    // Pagination Logic
    const totalPages = Math.ceil(initialProjects.length / PROJECTS_PER_PAGE)
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE
    const paginatedProjects = initialProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE)

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedProjects.length > 0 ? (
                    paginatedProjects.map((project) => (
                        <InfrastructureProjectCard key={project.id} project={project} />
                    ))
                ) : (
                    <div className="col-span-full flex h-[300px] items-center justify-center rounded-2xl border-2 border-dashed border-muted text-muted-foreground">
                        Belum ada proyek infrastruktur. Mulai dengan membuat proyek baru.
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
