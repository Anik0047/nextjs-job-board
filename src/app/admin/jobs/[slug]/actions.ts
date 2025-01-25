"use server";

import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";

// Define the FormState type
type FormState = { error?: string } | undefined;

export async function approveSubmission(
    prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    try {
        const jobId = formData.get("jobId") as string; // Ensure jobId is treated as a string

        const user = await currentUser();

        if (!user || !isAdmin(user)) {
            throw new Error("Not authorized");
        }

        await prisma.job.update({
            where: { id: jobId }, // Use jobId as a string
            data: { approved: true },
        });

        revalidatePath("/");
    } catch (error) {
        let message = "Unexpected error";
        if (error instanceof Error) {
            message = error.message;
        }
        return { error: message };
    }
}

export async function deleteJob(
    prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    try {
        const jobId = formData.get("jobId") as string; // Ensure jobId is treated as a string

        const user = await currentUser();

        if (!user || !isAdmin(user)) {
            throw new Error("Not authorized");
        }

        // Find the job to get any related fields like the company logo
        const job = await prisma.job.findUnique({
            where: { id: jobId }, // Use jobId as a string
        });

        if (job?.companyLogoUrl) {
            // Construct the absolute path to the file
            const filePath = path.resolve("public/uploads", job.companyLogoUrl);

            // Check if the file exists and delete it
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Synchronous deletion
            }
        }

        // Delete the job document from MongoDB
        await prisma.job.delete({
            where: { id: jobId }, // Use jobId as a string
        });

        revalidatePath("/");
    } catch (error) {
        let message = "Unexpected error";
        if (error instanceof Error) {
            message = error.message;
        }
        return { error: message };
    }

    redirect("/admin");
}
