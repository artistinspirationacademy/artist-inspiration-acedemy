"use client";

import { Teacher } from "@workspace/config";
import { motion } from "motion/react";
import { TeacherCard } from "./teacher-card";

interface TeachersSectionProps {
    teachers: Teacher[];
    courseName?: string;
}

export function TeachersSection({
    teachers,
    courseName,
}: TeachersSectionProps) {
    if (!teachers.length) return null;

    const cardCourseNames = courseName ? [courseName] : undefined;

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-16 space-y-6"
        >
            <header className="flex items-baseline gap-3">
                <span className="bg-highlight inline-block size-2 rounded-full" />
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Meet your mentors
                </h2>
                <span className="ml-auto text-xs tracking-[0.2em] text-white/50 uppercase">
                    {teachers.length} mentor
                    {teachers.length === 1 ? "" : "s"}
                </span>
            </header>

            <div className="grid grid-cols-1 gap-5 pl-5 sm:grid-cols-2 lg:grid-cols-3">
                {teachers.map((teacher, index) => (
                    <TeacherCard
                        key={teacher.id}
                        teacher={teacher}
                        courseNames={cardCourseNames}
                        index={index}
                    />
                ))}
            </div>
        </motion.section>
    );
}
