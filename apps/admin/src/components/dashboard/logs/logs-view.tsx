"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArchivesList } from "./archives-list";
import { RecentLogs } from "./recent-logs";

export function LogsView() {
    return (
        <Tabs defaultValue="recent" className="space-y-4">
            <TabsList>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="archives">Archives</TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
                <RecentLogs />
            </TabsContent>

            <TabsContent value="archives">
                <ArchivesList />
            </TabsContent>
        </Tabs>
    );
}
