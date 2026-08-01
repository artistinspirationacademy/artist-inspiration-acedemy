"use client";

import { ProfileSkeleton } from "@/components/globals/skeletons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FullFacultyUser, generateUploadThingURL } from "@workspace/config";
import { useFacultyAuth } from "@workspace/rq";
import Image from "next/image";

export function ProfileFetch() {
    const { useCurrentUser } = useFacultyAuth();
    const { data, isPending } = useCurrentUser();

    if (isPending) return <ProfileSkeleton />;
    if (!data) return null;

    return <ProfileSummaryCard user={data} />;
}

function ProfileSummaryCard({ user }: { user: FullFacultyUser }) {
    return (
        <Card>
            <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
                <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-full">
                    <Image
                        src={generateUploadThingURL(user.teacher.imageKey)}
                        alt={user.teacher.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold">
                        {user.teacher.name}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                        {user.email}
                    </p>
                </div>

                <Badge variant="secondary" className="w-fit">
                    Faculty
                </Badge>
            </CardContent>

            <CardContent className="pt-0">
                <p className="text-muted-foreground text-xs">
                    Your name, login email and password are managed by the
                    academy team. Ask them if any of these needs to change.
                </p>
            </CardContent>
        </Card>
    );
}
