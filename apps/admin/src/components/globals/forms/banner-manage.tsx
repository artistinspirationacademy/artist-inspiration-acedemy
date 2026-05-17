"use client";
"use no memo";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FormFooterBar } from "@/components/ui/form-footer-bar";
import { Input } from "@/components/ui/input";
import { MediaSelectModal } from "@/components/ui/media-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Banner,
    BANNER_MEDIA_TYPES,
    CreateBanner,
    createBannerSchema,
    generateUploadThingURL,
    Icons,
    Media,
    UpdateBanner,
} from "@workspace/config";
import { useBanner } from "@workspace/rq";
import Image from "next/image";
import { redirect, useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

interface PageProps {
    data?: Banner;
}

function deriveBannerMediaType(
    mimeType: string
): (typeof BANNER_MEDIA_TYPES)[number] {
    if (mimeType.startsWith("video/")) return "video";
    return "image";
}

export function BannerFetch({ type }: { type: "create" | "edit" }) {
    const { id } = useParams<{ id?: string }>();

    const { useGet } = useBanner();
    const { data, isPending } = useGet({
        id: type === "edit" && typeof id === "string" ? id : "",
        enabled: type === "edit" && typeof id === "string",
    });

    if (type === "create") return <BannerManageForm />;

    if (!id || typeof id !== "string") redirect("/banners");
    if (isPending) return <BannerFormSkeleton />;
    if (!data) redirect("/banners");

    return <BannerManageForm data={data} />;
}

function BannerFormSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
    );
}

export function BannerManageForm({ data }: PageProps) {
    const router = useRouter();
    const isEdit = !!data;

    const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const previewVideoRef = useRef<HTMLVideoElement>(null);

    const form = useForm<CreateBanner>({
        resolver: zodResolver(createBannerSchema),
        defaultValues: {
            name: data?.name ?? "",
            mediaKey: data?.mediaKey ?? "",
            mediaType: data?.mediaType ?? "image",
            isActive: data?.isActive ?? false,
        },
    });

    const { useCreate, useUpdate } = useBanner();
    const { mutateAsync: createBanner, isPending: isCreating } = useCreate();
    const { mutateAsync: updateBanner, isPending: isUpdating } = useUpdate();

    const isSubmitting = isCreating || isUpdating;

    const mediaKey = useWatch({ control: form.control, name: "mediaKey" });
    const mediaType = useWatch({ control: form.control, name: "mediaType" });
    const previewUrl = mediaKey ? generateUploadThingURL(mediaKey) : null;

    const handleMediaSelection = (items: Media[]) => {
        const picked = items[0];
        if (!picked) return;

        setSelectedMedia(picked);
        form.setValue("mediaKey", picked.key, { shouldDirty: true });
        form.setValue("mediaType", deriveBannerMediaType(picked.type), {
            shouldDirty: true,
        });
        form.clearErrors(["mediaKey", "mediaType"]);
    };

    const handleSubmit = async (values: CreateBanner) => {
        if (isEdit && data) {
            await updateBanner({
                id: data.id,
                values: values as UpdateBanner,
            });
        } else {
            await createBanner([values]);
        }
    };

    return (
        <Form {...form}>
            <form
                className="space-y-6"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Enter banner name"
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mediaKey"
                        render={() => (
                            <FormItem>
                                <FormLabel>Media</FormLabel>
                                <FormDescription>
                                    Select an image or video for this banner.
                                </FormDescription>

                                {previewUrl ? (
                                    <div className="flex items-center gap-4 rounded-md border p-3">
                                        <div
                                            className="bg-muted aspect-video w-32 shrink-0 cursor-pointer overflow-hidden rounded-md"
                                            onMouseEnter={() => {
                                                if (
                                                    mediaType !== "video" ||
                                                    !previewVideoRef.current
                                                )
                                                    return;
                                                previewVideoRef.current
                                                    .play()
                                                    .catch(() => {
                                                        // ignore autoplay rejections
                                                    });
                                            }}
                                            onMouseLeave={() => {
                                                if (
                                                    mediaType !== "video" ||
                                                    !previewVideoRef.current
                                                )
                                                    return;
                                                previewVideoRef.current.pause();
                                                previewVideoRef.current.currentTime = 0.5;
                                            }}
                                        >
                                            {mediaType === "image" ? (
                                                <Image
                                                    src={previewUrl}
                                                    alt="Banner preview"
                                                    width={256}
                                                    height={144}
                                                    className="size-full object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <video
                                                    ref={previewVideoRef}
                                                    src={`${previewUrl}#t=0.5`}
                                                    preload="metadata"
                                                    muted
                                                    playsInline
                                                    loop
                                                    className="size-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1 text-sm">
                                            <p className="font-medium capitalize">
                                                {mediaType}
                                            </p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {selectedMedia?.name ??
                                                    mediaKey ??
                                                    ""}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            onClick={() =>
                                                setIsMediaSelectorOpen(true)
                                            }
                                        >
                                            Change
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            setIsMediaSelectorOpen(true)
                                        }
                                    >
                                        <Icons.PlusCircle className="mr-2 size-4" />
                                        Select Media
                                    </Button>
                                )}

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel>Active</FormLabel>
                                    <FormDescription>
                                        Inactive banners are hidden from the
                                        public site.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value ?? false}
                                        onCheckedChange={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormFooterBar
                    visible={!isEdit || form.formState.isDirty}
                    isSubmitting={isSubmitting}
                    saveDisabled={!mediaKey}
                    saveLabel={isEdit ? "Update Banner" : "Create Banner"}
                    savingLabel={isEdit ? "Updating..." : "Creating..."}
                    message={
                        isEdit
                            ? "You have unsaved changes"
                            : "New banner — fill the details and save"
                    }
                    cancelLabel="Cancel"
                    onCancel={() => router.push("/banners")}
                />
            </form>

            <MediaSelectModal
                isOpen={isMediaSelectorOpen}
                setIsOpen={setIsMediaSelectorOpen}
                selected={selectedMedia ? [selectedMedia] : []}
                selectedKey={mediaKey || undefined}
                types={["image", "video"]}
                accept="image/*,video/*"
                onSelectionComplete={handleMediaSelection}
            />
        </Form>
    );
}
