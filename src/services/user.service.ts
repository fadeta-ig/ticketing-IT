import prisma from "@/lib/prisma";
import { Role, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export class UserService {
    static async getAllUsers() {
        return await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getUserById(id: string) {
        return await prisma.user.findUnique({
            where: { id }
        });
    }

    static async createUser(data: {
        name: string;
        email: string;
        password?: string;
        role: Role;
    }) {
        const passwordHash = data.password
            ? await bcrypt.hash(data.password, 10)
            : undefined;

        return await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: data.role,
            }
        });
    }

    static async updateUser(id: string, data: Partial<{
        name: string;
        email: string;
        role: Role;
        password?: string;
    }>) {
        const { password, ...rest } = data;
        const updateData: Prisma.UserUpdateInput = { ...rest };

        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        return await prisma.user.update({
            where: { id },
            data: updateData
        });
    }

    static async deleteUser(id: string) {
        return await prisma.user.delete({
            where: { id }
        });
    }
}
