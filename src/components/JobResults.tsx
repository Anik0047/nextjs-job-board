import prisma from "@/lib/prisma";
import { JobFilterValues } from "@/lib/validation";
import { Prisma } from "@prisma/client";
import JobListItem from "./JobListItem";
import Link from "next/link";

interface JobResultsProps {
  filterValues: JobFilterValues;
}

export default async function JobResults({
  filterValues: { q, type, location, remote },
}: JobResultsProps) {
  const searchString = q
    ?.split(" ")
    .filter((word) => word.length > 0)
    .join(" & ");

  const searchFilter: Prisma.JobWhereInput = searchString
    ? {
      OR: [
        { title: { contains: searchString, mode: "insensitive" } },
        { companyName: { contains: searchString, mode: "insensitive" } },
        { locationType: { contains: searchString, mode: "insensitive" } },
        { location: { contains: searchString, mode: "insensitive" } },
        { type: { contains: searchString, mode: "insensitive" } },
      ],
    }
    : {};

  const where: Prisma.JobWhereInput = {
    AND: [
      searchFilter,
      type ? { type } : {},
      location ? { location } : {},
      remote ? { locationType: "Remote" } : {},
      { approved: true },
    ],
  };

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grow space-y-4">
      {jobs.map((job) => (
        <Link key={job.id} href={`/jobs/${job.slug}`} className="block">
          <JobListItem job={job} />
        </Link>
      ))}
      {jobs.length === 0 && (
        <p className="m-auto text-center">
          No jobs found. Try adjusting your search filters.
        </p>
      )}
    </div>
  );
}
