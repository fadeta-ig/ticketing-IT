import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";

type SessionUser = {
    id: string;
    role?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await getServerSession(authOptions);
    return session?.user?.id ? session.user : null;
}

export function hasAdminRole(user?: Pick<SessionUser, "role"> | null) {
    return user?.role === Role.ADMIN;
}

export function hasStaffRole(user?: Pick<SessionUser, "role"> | null) {
    return user?.role === Role.ADMIN || user?.role === Role.STAFF;
}

export async function requireSession() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}

export async function requireAdmin() {
    const user = await requireSession();
    if (!hasAdminRole(user)) {
        throw new Error("Forbidden");
    }
    return user;
}

export async function requireStaff() {
    const user = await requireSession();
    if (!hasStaffRole(user)) {
        throw new Error("Forbidden");
    }
    return user;
}
