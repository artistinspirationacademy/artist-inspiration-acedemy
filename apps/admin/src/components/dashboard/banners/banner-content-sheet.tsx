"use client";

import { BannerContentForm } from "@/components/globals/forms";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Icons } from "@workspace/config";
import { useState } from "react";

export function BannerContentSheet() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <Icons.PencilSimple />
                    Page Content
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
            >
                <SheetHeader className="border-b p-6">
                    <SheetTitle>Banner Page Content</SheetTitle>
                    <SheetDescription>
                        Edit the heading, tagline, and body copy shown around
                        the banner carousel on the public site.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="p-6">
                        {isOpen && (
                            <BannerContentForm
                                onSaved={() => setIsOpen(false)}
                            />
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
