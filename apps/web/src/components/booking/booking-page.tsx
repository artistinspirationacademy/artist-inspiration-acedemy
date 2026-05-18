"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useBooking, useCourses, useHome, useTeacher } from "@/lib/rq";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    cn,
    Course,
    createBookingSchema,
    FullCourseCategory,
    Icons,
} from "@workspace/config";
import { Country, ICountry } from "country-state-city";
import { format } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import {
    useForm,
    type FieldPath,
    type Resolver,
    type UseFormReturn,
} from "react-hook-form";
import z from "zod";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const EXPERIENCE_OPTIONS = [
    { value: "beginner", label: "Beginner — just getting started" },
    { value: "intermediate", label: "Intermediate — some practice" },
    { value: "advanced", label: "Advanced — actively shipping work" },
];

const bookingFormSchema = createBookingSchema.omit({ phone: true }).extend({
    phoneCode: z
        .string("Country code is required")
        .regex(/^\+[\d-]+$/, "Country code is required"),
    phoneNumber: z
        .string("Phone number is required")
        .min(4, "Phone number is too short")
        .regex(/^\d+$/, "Phone number must contain digits only"),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface StepDef {
    title: string;
    hint: string;
    fields: FieldPath<BookingFormValues>[];
}

const STEPS: StepDef[] = [
    {
        title: "Pick your course",
        hint: "Tell us which track you want to join and when.",
        fields: ["courseId", "timestamp"],
    },
    {
        title: "About you",
        hint: "A few quick details so we can shape the right cohort.",
        fields: ["name", "email", "age", "gender", "experienceLevel"],
    },
    {
        title: "Where to reach you",
        hint: "We&rsquo;ll confirm your spot here and share onboarding details.",
        fields: ["country", "phoneCode", "phoneNumber"],
    },
];

export function BookingPage() {
    const { useGet } = useCourses();
    const { data, isPending } = useGet({});

    const { useGet: useHomeGet } = useHome();
    const { data: homeData, isPending: isHomePending } = useHomeGet({});

    const categories = useMemo(
        () => data?.categories ?? [],
        [data?.categories]
    );
    const courses = useMemo(
        () => categories.flatMap((c) => c.courses ?? []),
        [categories]
    );

    const bookingsDisabled = homeData?.configuration?.enableBooking === false;

    return (
        <section className="relative isolate min-h-svh w-full overflow-hidden bg-neutral-950 text-white">
            <BackgroundAura />

            <div className="relative z-10 mx-auto max-w-3xl px-4 pt-28 pb-24 sm:px-6 sm:pt-32 lg:px-8">
                <BookingHeader />

                <div className="mt-10">
                    {isPending || isHomePending ? (
                        <FormSkeleton />
                    ) : bookingsDisabled ? (
                        <BookingsDisabledState />
                    ) : !courses.length ? (
                        <NoCoursesState />
                    ) : (
                        <BookingForm
                            courses={courses}
                            categories={categories}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

function BookingsDisabledState() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/3 p-10 text-center backdrop-blur-md">
            <div className="bg-highlight/10 border-highlight/30 flex size-16 items-center justify-center rounded-full border">
                <Icons.Pause
                    weight="duotone"
                    className="text-highlight size-7"
                />
            </div>
            <h2 className="text-2xl font-semibold">
                Bookings are paused right now
            </h2>
            <p className="max-w-md text-sm text-white/70">
                We&rsquo;re not accepting new bookings at the moment. Please
                check back soon — enrolment will reopen shortly.
            </p>
        </div>
    );
}

function BackgroundAura() {
    return (
        <>
            <div
                aria-hidden
                className="bg-highlight/15 pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full blur-3xl"
            />
            <div
                aria-hidden
                className="bg-highlight/10 pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0%,transparent_60%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.85)_100%)]"
            />
        </>
    );
}

function BookingHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center gap-5 text-center"
        >
            <span
                className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1",
                    "text-xs font-semibold tracking-[0.25em] text-white/90 uppercase backdrop-blur-md"
                )}
            >
                <Icons.Sparkle
                    weight="fill"
                    className="text-highlight size-3"
                />
                Book your spot
            </span>

            <h1 className="text-4xl leading-[1.05] font-bold text-balance text-white drop-shadow-lg sm:text-5xl md:text-6xl">
                Reserve your{" "}
                <span className="relative inline-block">
                    <span
                        aria-hidden
                        className="bg-highlight/30 absolute inset-x-0 bottom-1 -z-10 h-3 rounded-sm sm:h-4"
                    />
                    <span className="text-highlight">cohort</span>
                </span>
            </h1>

            <p className="max-w-xl text-base text-balance text-white/80 sm:text-lg">
                Three quick steps. We&rsquo;ll confirm your seat by email within
                24 hours.
            </p>
        </motion.div>
    );
}

function FormSkeleton() {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-10">
            <div className="space-y-4">
                <div className="h-2 w-full animate-pulse rounded-full bg-white/10" />
                <div className="h-8 w-1/2 animate-pulse rounded-md bg-white/10" />
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-white/[0.06]" />
                <div className="space-y-3 pt-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-12 w-full animate-pulse rounded-md bg-white/[0.05]"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function NoCoursesState() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-md">
            <div className="bg-highlight/10 border-highlight/30 flex size-16 items-center justify-center rounded-full border">
                <Icons.Book
                    weight="duotone"
                    className="text-highlight size-7"
                />
            </div>
            <h2 className="text-2xl font-semibold">No courses yet</h2>
            <p className="max-w-md text-sm text-white/70">
                Our curriculum is being finalised. Drop us a note and
                we&rsquo;ll reach out the moment enrolment opens.
            </p>
        </div>
    );
}

function BookingForm({
    courses,
    categories,
}: {
    courses: Course[];
    categories: FullCourseCategory[];
}) {
    const [preselectedCourse] = useQueryState("course", parseAsString);
    const [preselectedTeacher] = useQueryState("teacher", parseAsString);

    const { useGet: useTeacherGet } = useTeacher();
    const { data: teacher } = useTeacherGet({
        id: preselectedTeacher ?? "",
        enabled: !!preselectedTeacher,
    });

    const [stepIndex, setStepIndex] = useState(0);
    const [submitted, setSubmitted] = useState<{
        course: Course;
        timestamp: Date;
    } | null>(null);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(
            bookingFormSchema
        ) as unknown as Resolver<BookingFormValues>,
        mode: "onTouched",
        defaultValues: {
            courseId: courses.find((c) => c.id === preselectedCourse)?.id ?? "",
            teacherId: preselectedTeacher ?? null,
            timestamp: undefined as unknown as Date,
            name: "",
            email: "",
            age: undefined as unknown as number,
            gender: "",
            experienceLevel: "",
            country: "",
            phoneCode: "",
            phoneNumber: "",
        },
    });

    const { useCreate } = useBooking();
    const { mutateAsync: createBooking, isPending: isCreating } = useCreate();

    const goNext = async () => {
        const step = STEPS[stepIndex];
        if (!step) return;
        const ok = await form.trigger(step.fields, { shouldFocus: true });
        if (!ok) return;

        if (stepIndex < STEPS.length - 1) {
            setStepIndex((i) => i + 1);
        } else {
            await onSubmit(form.getValues());
        }
    };

    const goBack = () => {
        setStepIndex((i) => Math.max(0, i - 1));
    };

    const onSubmit = async (values: BookingFormValues) => {
        const { phoneCode, phoneNumber, ...rest } = values;
        const phone = `${phoneCode}${phoneNumber}`;

        const course = courses.find((c) => c.id === values.courseId);
        if (!course) {
            form.setError("courseId", {
                message: "Please select a valid course",
            });
            setStepIndex(0);
            return;
        }

        await createBooking([{ ...rest, phone }]);
        setSubmitted({ course, timestamp: values.timestamp });
    };

    if (submitted) {
        return (
            <SuccessPanel
                course={submitted.course}
                timestamp={submitted.timestamp}
            />
        );
    }

    const isLastStep = stepIndex === STEPS.length - 1;
    const step = STEPS[stepIndex]!;
    const progress = ((stepIndex + 1) / STEPS.length) * 100;

    return (
        <Form {...form}>
            {teacher && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={cn(
                        "mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-md",
                        "border-highlight/30 bg-highlight/10"
                    )}
                >
                    <Icons.Sparkle
                        weight="fill"
                        className="text-highlight size-4 shrink-0"
                    />
                    <p className="text-sm text-white/90">
                        Booking with{" "}
                        <span className="text-highlight font-semibold">
                            {teacher.name}
                        </span>
                    </p>
                </motion.div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    goNext();
                }}
                className={cn(
                    "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md",
                    "p-6 sm:p-10"
                )}
            >
                <ProgressBar value={progress} />

                <div className="mt-6 mb-8 flex items-baseline justify-between gap-4">
                    <div>
                        <p className="text-highlight text-xs font-semibold tracking-[0.2em] uppercase">
                            Step {stepIndex + 1} of {STEPS.length}
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                            {step.title}
                        </h2>
                        <p
                            className="mt-1 text-sm text-white/70"
                            dangerouslySetInnerHTML={{ __html: step.hint }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="space-y-5"
                    >
                        {stepIndex === 0 && (
                            <StepCourse
                                form={form}
                                courses={courses}
                                categories={categories}
                            />
                        )}
                        {stepIndex === 1 && <StepAboutYou form={form} />}
                        {stepIndex === 2 && <StepContact form={form} />}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-10 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={goBack}
                        disabled={stepIndex === 0 || isCreating}
                        className="text-white/80 hover:bg-white/5 hover:text-white"
                    >
                        <Icons.ArrowRight
                            weight="bold"
                            className="size-4 rotate-180"
                        />
                        Back
                    </Button>

                    <Button
                        type="submit"
                        disabled={isCreating}
                        className={cn(
                            "bg-highlight text-highlight-foreground hover:bg-highlight/90",
                            "h-11 rounded-full px-6 font-semibold shadow-lg shadow-black/40",
                            "transition-all duration-300 hover:-translate-y-0.5"
                        )}
                    >
                        {isCreating
                            ? "Submitting..."
                            : isLastStep
                              ? "Confirm booking"
                              : "Continue"}
                        <Icons.ArrowRight weight="bold" className="size-4" />
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="absolute inset-x-0 top-0 h-1 w-full overflow-hidden rounded-t-2xl bg-white/5">
            <motion.div
                className="bg-highlight h-full"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
        </div>
    );
}

function StepCourse({
    form,
    courses,
    categories,
}: {
    form: UseFormReturn<BookingFormValues>;
    courses: Course[];
    categories: FullCourseCategory[];
}) {
    return (
        <>
            <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Course</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-72">
                                {categories.map((category) => {
                                    const inCategory = courses.filter(
                                        (c) =>
                                            c.courseCategoryId === category.id
                                    );
                                    if (!inCategory.length) return null;
                                    return (
                                        <div key={category.id} className="py-1">
                                            <p className="px-3 py-1.5 text-xs font-semibold tracking-wider text-white/50 uppercase">
                                                {category.name}
                                            </p>
                                            {inCategory.map((course) => (
                                                <SelectItem
                                                    key={course.id}
                                                    value={course.id}
                                                >
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="timestamp"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Preferred demo date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "h-11 w-full justify-start px-3 font-normal",
                                            !field.value &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        <Icons.MapPin
                                            weight="duotone"
                                            className="text-highlight mr-2 size-4"
                                        />
                                        {field.value
                                            ? format(field.value, "PPP")
                                            : "Choose a date"}
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(d) =>
                                        d <
                                        new Date(
                                            new Date().setHours(0, 0, 0, 0)
                                        )
                                    }
                                    autoFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}

function StepAboutYou({ form }: { form: UseFormReturn<BookingFormValues> }) {
    return (
        <>
            <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ada Lovelace" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="email"
                                    placeholder="ada@example.com"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={3}
                                    placeholder="24"
                                    value={
                                        field.value === undefined ||
                                        Number.isNaN(field.value)
                                            ? ""
                                            : field.value
                                    }
                                    onChange={(e) => {
                                        const v = e.target.value.replace(
                                            /[^0-9]/g,
                                            ""
                                        );
                                        field.onChange(
                                            v === "" ? undefined : Number(v)
                                        );
                                    }}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Experience level</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Where are you at?" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {EXPERIENCE_OPTIONS.map((o) => (
                                        <SelectItem
                                            key={o.value}
                                            value={o.value}
                                        >
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                            <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                            >
                                {GENDER_OPTIONS.map((g) => (
                                    <label
                                        key={g}
                                        htmlFor={`gender-${g}`}
                                        className={cn(
                                            "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-center text-sm transition-colors",
                                            field.value === g
                                                ? "border-highlight/60 bg-highlight/10 text-white"
                                                : "border-white/15 bg-white/[0.03] text-white/80 hover:border-white/30 hover:text-white"
                                        )}
                                    >
                                        <RadioGroupItem
                                            id={`gender-${g}`}
                                            value={g}
                                            className="pointer-events-none absolute size-0 border-0 opacity-0"
                                        />
                                        <span>{g}</span>
                                    </label>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}

function StepContact({ form }: { form: UseFormReturn<BookingFormValues> }) {
    const countries = useMemo<ICountry[]>(() => Country.getAllCountries(), []);

    return (
        <>
            <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Country</FormLabel>
                        <CountryCombobox
                            countries={countries}
                            value={field.value}
                            onSelect={(country) => {
                                form.setValue("country", country.name, {
                                    shouldValidate: true,
                                });
                                form.setValue(
                                    "phoneCode",
                                    normalisePhoneCode(country.phonecode),
                                    { shouldValidate: true }
                                );
                            }}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="space-y-2">
                <FormLabel>Phone number</FormLabel>
                <div className="flex gap-2">
                    <FormField
                        control={form.control}
                        name="phoneCode"
                        render={({ field }) => (
                            <FormItem className="w-[110px] shrink-0">
                                <PhoneCodeCombobox
                                    countries={countries}
                                    value={field.value}
                                    onSelect={(code, country) => {
                                        form.setValue("phoneCode", code, {
                                            shouldValidate: true,
                                        });
                                        form.setValue("country", country.name, {
                                            shouldValidate: true,
                                        });
                                    }}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input
                                        {...field}
                                        inputMode="numeric"
                                        placeholder="5551234567"
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value.replace(
                                                    /[^0-9]/g,
                                                    ""
                                                )
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </>
    );
}

function normalisePhoneCode(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

function CountryCombobox({
    countries,
    value,
    onSelect,
}: {
    countries: ICountry[];
    value: string;
    onSelect: (country: ICountry) => void;
}) {
    const [open, setOpen] = useState(false);
    const selected = countries.find((c) => c.name === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "h-11 w-full justify-between px-3 font-normal",
                            !selected && "text-muted-foreground"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            {selected ? (
                                <>
                                    <span className="text-base">
                                        {selected.flag}
                                    </span>
                                    {selected.name}
                                </>
                            ) : (
                                "Choose a country"
                            )}
                        </span>
                        <Icons.CaretUpDown
                            weight="bold"
                            className="size-4 opacity-50"
                        />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.isoCode}
                                    value={`${country.name} ${country.isoCode}`}
                                    onSelect={() => {
                                        onSelect(country);
                                        setOpen(false);
                                    }}
                                >
                                    <span className="mr-2 text-base">
                                        {country.flag}
                                    </span>
                                    <span className="flex-1">
                                        {country.name}
                                    </span>
                                    <Icons.Check
                                        weight="bold"
                                        className={cn(
                                            "size-4",
                                            selected?.isoCode ===
                                                country.isoCode
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function PhoneCodeCombobox({
    countries,
    value,
    onSelect,
}: {
    countries: ICountry[];
    value: string;
    onSelect: (code: string, country: ICountry) => void;
}) {
    const [open, setOpen] = useState(false);
    const codes = useMemo(() => {
        const seen = new Map<string, ICountry>();
        for (const country of countries) {
            const code = normalisePhoneCode(country.phonecode);
            if (!code) continue;
            if (!seen.has(code)) seen.set(code, country);
        }
        return Array.from(seen.entries())
            .map(([code, country]) => ({ code, country }))
            .sort((a, b) =>
                a.code.localeCompare(b.code, undefined, { numeric: true })
            );
    }, [countries]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "h-11 w-full justify-between px-3 font-mono font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <span>{value || "Code"}</span>
                        <Icons.CaretUpDown
                            weight="bold"
                            className="size-4 opacity-50"
                        />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
                <Command>
                    <CommandInput placeholder="Search code or country..." />
                    <CommandList>
                        <CommandEmpty>No code found.</CommandEmpty>
                        <CommandGroup>
                            {codes.map(({ code, country }) => (
                                <CommandItem
                                    key={`${country.isoCode}-${code}`}
                                    value={`${code} ${country.name}`}
                                    onSelect={() => {
                                        onSelect(code, country);
                                        setOpen(false);
                                    }}
                                >
                                    <span className="mr-2 text-base">
                                        {country.flag}
                                    </span>
                                    <span className="font-mono text-sm">
                                        {code}
                                    </span>
                                    <span className="text-muted-foreground ml-2 truncate text-xs">
                                        {country.name}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function SuccessPanel({
    course,
    timestamp,
}: {
    course: Course;
    timestamp: Date;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md sm:p-12",
                "text-center"
            )}
        >
            <div
                aria-hidden
                className="bg-highlight/20 absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full blur-3xl"
            />

            <div className="bg-highlight/10 border-highlight/40 relative mx-auto flex size-20 items-center justify-center rounded-full border">
                <Icons.Check weight="bold" className="text-highlight size-9" />
            </div>

            <h2 className="relative mt-6 text-3xl font-bold text-white sm:text-4xl">
                You&rsquo;re on the list
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/75">
                We received your booking for{" "}
                <span className="text-highlight font-semibold">
                    {course.title}
                </span>{" "}
                starting{" "}
                <span className="text-white">{format(timestamp, "PPP")}</span>.
                Look out for a confirmation email within 24 hours.
            </p>
        </motion.div>
    );
}
