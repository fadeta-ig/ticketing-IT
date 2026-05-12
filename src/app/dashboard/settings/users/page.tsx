import { UserService } from "@/services/user.service"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { UserList } from "@/components/users/user-list"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function UserManagementPage() {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        redirect("/dashboard")
    }

    const isAdmin = session?.user?.role === "ADMIN"

    const users = await UserService.getAllUsers()

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
                    <p className="text-muted-foreground italic">Kelola akun, peran, dan akses pengguna dalam sistem IT Dashboard.</p>
                </div>
                {isAdmin && <CreateUserDialog />}
            </div>

            <UserList initialUsers={users} currentRole={session?.user?.role as string} />
        </div>
    )
}
