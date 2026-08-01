import {
    DEFAULT_PAGINATION,
    ImportMasterResult,
    importMasterResultSchema,
    ImportMasterRow,
    ImportMasterRowResult,
    MasterQuery,
    MasterTable,
    masterTableSchema,
    monthStart,
    shiftMonthKey,
    STUDENT_ID_PREFIX,
} from "@workspace/config";
import { and, asc, eq, gte, ilike, lt, or, sql } from "drizzle-orm";
import { db } from "../client";
import {
    attendanceDays,
    attendanceMonths,
    courses,
    packages,
    platforms,
    studentEnrollments,
    students,
    teachers,
} from "../schemas";

class MasterQueries {
    /**
     * One row per enrollment with the selected month's snapshot attached.
     * Day-level counts are pre-aggregated in subqueries before joining —
     * joining month rows straight to day rows would repeat each row once per
     * marked day and multiply every sum.
     */
    async paginate({
        month,
        search,
        teacherId,
        courseId,
        platformId,
        packageId,
        isActive,
        limit = DEFAULT_PAGINATION.GENERAL.LIMIT,
        page = DEFAULT_PAGINATION.GENERAL.PAGE,
    }: MasterQuery): Promise<MasterTable> {
        limit = limit < 0 ? DEFAULT_PAGINATION.GENERAL.LIMIT : limit;
        page = page < 0 ? DEFAULT_PAGINATION.GENERAL.PAGE : page;

        const monthDate = monthStart(month);
        const nextMonthDate = monthStart(shiftMonthKey(month, 1));

        const monthDayTotals = db
            .select({
                attendanceMonthId: attendanceDays.attendanceMonthId,
                present:
                    sql<number>`(count(*) filter (where ${attendanceDays.status} = 'present'))::int`.as(
                        "present"
                    ),
            })
            .from(attendanceDays)
            .where(
                and(
                    gte(attendanceDays.date, monthDate),
                    lt(attendanceDays.date, nextMonthDate)
                )
            )
            .groupBy(attendanceDays.attendanceMonthId)
            .as("month_day_totals");

        const lifetimeTotals = db
            .select({
                enrollmentId: attendanceMonths.enrollmentId,
                presentAllTime:
                    sql<number>`(count(*) filter (where ${attendanceDays.status} = 'present'))::int`.as(
                        "present_all_time"
                    ),
                lastMarked: sql<string>`max(${attendanceDays.date})::text`.as(
                    "last_marked"
                ),
            })
            .from(attendanceDays)
            .innerJoin(
                attendanceMonths,
                eq(attendanceMonths.id, attendanceDays.attendanceMonthId)
            )
            .groupBy(attendanceMonths.enrollmentId)
            .as("lifetime_totals");

        const conditions = and(
            teacherId ? eq(studentEnrollments.teacherId, teacherId) : undefined,
            courseId ? eq(studentEnrollments.courseId, courseId) : undefined,
            platformId
                ? eq(studentEnrollments.platformId, platformId)
                : undefined,
            packageId ? eq(studentEnrollments.packageId, packageId) : undefined,
            isActive !== undefined
                ? eq(studentEnrollments.isActive, isActive)
                : undefined,
            search?.length
                ? or(
                      ilike(students.name, `%${search}%`),
                      ilike(students.code, `%${search}%`)
                  )
                : undefined
        );

        const rows = await db
            .select({
                enrollmentId: studentEnrollments.id,
                studentId: students.id,
                studentSerialNo: students.serialNo,
                studentCode: students.code,
                studentName: students.name,
                studentEmail: students.email,
                studentPhone: students.phone,
                studentGuardian: students.guardianName,
                studentNotes: students.notes,
                studentActive: students.isActive,
                teacherId: teachers.id,
                teacherName: teachers.name,
                courseId: courses.id,
                courseTitle: courses.title,
                platformId: platforms.id,
                platformName: platforms.name,
                packageId: packages.id,
                packageName: packages.name,
                packageTotalClasses: packages.totalClasses,
                classesPerWeek: studentEnrollments.classesPerWeek,
                startMonth: studentEnrollments.startMonth,
                totalMonths: studentEnrollments.totalMonths,
                isActive: studentEnrollments.isActive,
                contractMonthlyClasses: studentEnrollments.monthlyClasses,
                contractAcademyFee: studentEnrollments.academyFee,
                contractTeacherFee: studentEnrollments.teacherFee,
                monthId: attendanceMonths.id,
                monthlyClasses: attendanceMonths.monthlyClasses,
                academyFee: attendanceMonths.academyFee,
                teacherFee: attendanceMonths.teacherFee,
                isLocked: attendanceMonths.isLocked,
                presentMonth: sql<number>`coalesce(${monthDayTotals.present}, 0)::int`,
                presentAllTime: sql<number>`coalesce(${lifetimeTotals.presentAllTime}, 0)::int`,
                lastMarked: lifetimeTotals.lastMarked,
                count: sql<number>`count(*) over()::int`,
            })
            .from(studentEnrollments)
            .innerJoin(students, eq(students.id, studentEnrollments.studentId))
            .innerJoin(teachers, eq(teachers.id, studentEnrollments.teacherId))
            .innerJoin(courses, eq(courses.id, studentEnrollments.courseId))
            .leftJoin(
                platforms,
                eq(platforms.id, studentEnrollments.platformId)
            )
            .leftJoin(packages, eq(packages.id, studentEnrollments.packageId))
            .leftJoin(
                attendanceMonths,
                and(
                    eq(attendanceMonths.enrollmentId, studentEnrollments.id),
                    eq(attendanceMonths.month, monthDate)
                )
            )
            .leftJoin(
                monthDayTotals,
                eq(monthDayTotals.attendanceMonthId, attendanceMonths.id)
            )
            .leftJoin(
                lifetimeTotals,
                eq(lifetimeTotals.enrollmentId, studentEnrollments.id)
            )
            .where(conditions)
            .orderBy(asc(students.name), asc(courses.title))
            .limit(limit)
            .offset((page - 1) * limit);

        const count = rows[0]?.count ?? 0;

        const data = rows.map((row) => ({
            enrollmentId: row.enrollmentId,
            student: {
                id: row.studentId,
                serialNo: row.studentSerialNo,
                code: row.studentCode,
                name: row.studentName,
                email: row.studentEmail,
                phone: row.studentPhone,
                guardianName: row.studentGuardian,
                notes: row.studentNotes,
                isActive: row.studentActive,
            },
            teacher: { id: row.teacherId, name: row.teacherName },
            course: { id: row.courseId, title: row.courseTitle },
            platform:
                row.platformId && row.platformName
                    ? { id: row.platformId, name: row.platformName }
                    : null,
            package:
                row.packageId && row.packageName && row.packageTotalClasses
                    ? {
                          id: row.packageId,
                          name: row.packageName,
                          totalClasses: row.packageTotalClasses,
                      }
                    : null,
            classesPerWeek: row.classesPerWeek,
            startMonth: row.startMonth,
            totalMonths: row.totalMonths,
            isActive: row.isActive,
            contract: {
                monthlyClasses: row.contractMonthlyClasses,
                academyFee: row.contractAcademyFee,
                teacherFee: row.contractTeacherFee,
            },
            monthSnapshot:
                row.monthId !== null
                    ? {
                          id: row.monthId,
                          monthlyClasses: row.monthlyClasses ?? 0,
                          academyFee: row.academyFee ?? 0,
                          teacherFee: row.teacherFee ?? 0,
                          isLocked: row.isLocked ?? false,
                      }
                    : null,
            presentMonth: row.presentMonth,
            presentAllTime: row.presentAllTime,
            lastMarked: row.lastMarked,
        }));

        return masterTableSchema.parse({
            month,
            data,
            count,
            pages: Math.ceil(count / limit),
        });
    }

    /**
     * Bulk upsert, one CSV row at a time. Rows never delete anything: a
     * student's enrollments that the sheet doesn't mention are left alone
     * (deliberately unlike the student-form reconcile). Reference values are
     * resolved by name and never created. Each row runs in its own savepoint,
     * so one bad row is reported without poisoning the rest of the file.
     */
    async import({
        month,
        rows,
    }: {
        month: string;
        rows: { row: number; data: ImportMasterRow }[];
    }): Promise<ImportMasterResult> {
        const monthDate = monthStart(month);

        const [teacherRows, courseRows, platformRows, packageRows] =
            await Promise.all([
                db.query.teachers.findMany(),
                db.query.courses.findMany(),
                db.query.platforms.findMany(),
                db.query.packages.findMany(),
            ]);

        const byName = (list: { id: string; label: string }[]) =>
            new Map(
                list.map(({ id, label }) => [label.trim().toLowerCase(), id])
            );

        const teacherIds = byName(
            teacherRows.map((t) => ({ id: t.id, label: t.name }))
        );
        const courseIds = byName(
            courseRows.map((c) => ({ id: c.id, label: c.title }))
        );
        const platformIds = byName(
            platformRows.map((p) => ({ id: p.id, label: p.name }))
        );
        const packageIds = byName(
            packageRows.map((p) => ({ id: p.id, label: p.name }))
        );

        // export writes `displayStudentId`, so an ID like AIA-0007 may be the
        // auto-generated form of a student without a custom code — resolve it
        // back through the serial so an unmodified export round-trips instead
        // of creating duplicates
        const autoIdPattern = new RegExp(`^${STUDENT_ID_PREFIX}-(\\d{4,})$`);

        const results: ImportMasterRowResult[] = [];

        await db.transaction(async (tx) => {
            for (const { row, data } of rows) {
                const fail = (error: string) =>
                    results.push({ row, id: data.code, error });

                const teacherId = teacherIds.get(data.tutor.toLowerCase());
                if (!teacherId) {
                    fail(`Unknown tutor "${data.tutor}"`);
                    continue;
                }

                const courseId = courseIds.get(data.course.toLowerCase());
                if (!courseId) {
                    fail(`Unknown course "${data.course}"`);
                    continue;
                }

                const platformId = data.platform
                    ? platformIds.get(data.platform.toLowerCase())
                    : null;
                if (platformId === undefined) {
                    fail(`Unknown platform "${data.platform}"`);
                    continue;
                }

                const packageId = data.package
                    ? packageIds.get(data.package.toLowerCase())
                    : null;
                if (packageId === undefined) {
                    fail(`Unknown package "${data.package}"`);
                    continue;
                }

                try {
                    const action = await tx.transaction(async (rtx) => {
                        let student = await rtx.query.students.findFirst({
                            where: { code: data.code },
                        });

                        if (!student) {
                            const serial = autoIdPattern.exec(data.code);
                            if (serial) {
                                student = await rtx.query.students.findFirst({
                                    where: { serialNo: Number(serial[1]) },
                                });
                                if (!student)
                                    throw new Error(
                                        `No student matches the auto-generated ID "${data.code}"`
                                    );
                            }
                        }

                        let studentId: string;
                        let created = false;
                        if (!student) {
                            if (!data.name)
                                throw new Error(
                                    "Student Name is required to create a new student"
                                );

                            studentId = await rtx
                                .insert(students)
                                .values({
                                    code: data.code,
                                    name: data.name,
                                    email: data.email,
                                    phone: data.phone,
                                    guardianName: data.guardianName,
                                    notes: data.notes,
                                    isActive: true,
                                })
                                .returning()
                                .then((res) => res[0]!.id);
                            created = true;
                        } else {
                            studentId = student.id;
                            await rtx
                                .update(students)
                                .set({
                                    ...(data.name ? { name: data.name } : {}),
                                    email: data.email,
                                    phone: data.phone,
                                    guardianName: data.guardianName,
                                    notes: data.notes,
                                    updatedAt: new Date(),
                                })
                                .where(eq(students.id, studentId));
                        }

                        const contract = {
                            platformId,
                            packageId,
                            academyFee: data.academyFee,
                            teacherFee: data.teacherFee,
                            monthlyClasses: data.monthlyClasses,
                            classesPerWeek: data.classesPerWeek,
                            totalMonths: data.totalMonths,
                            startMonth: monthStart(data.startMonth),
                            isActive: data.isActive,
                        };

                        const enrollments =
                            await rtx.query.studentEnrollments.findMany({
                                where: { studentId },
                            });
                        const match = enrollments.find(
                            (enrollment) =>
                                enrollment.teacherId === teacherId &&
                                enrollment.courseId === courseId
                        );

                        let enrollmentId: string;
                        if (match) {
                            await rtx
                                .update(studentEnrollments)
                                .set({ ...contract, updatedAt: new Date() })
                                .where(eq(studentEnrollments.id, match.id));
                            enrollmentId = match.id;
                        } else {
                            enrollmentId = await rtx
                                .insert(studentEnrollments)
                                .values({
                                    ...contract,
                                    studentId,
                                    teacherId,
                                    courseId,
                                })
                                .returning()
                                .then((res) => res[0]!.id);
                        }

                        // quota + fees also land on the shown month's
                        // snapshot — the same fields the table's inline edits
                        // write. Past months are never touched, and a missing
                        // snapshot is fine: ensureMonth seeds it from the
                        // just-updated contract on the next master read.
                        await rtx
                            .update(attendanceMonths)
                            .set({
                                monthlyClasses: data.monthlyClasses,
                                academyFee: data.academyFee,
                                teacherFee: data.teacherFee,
                                updatedAt: new Date(),
                            })
                            .where(
                                and(
                                    eq(
                                        attendanceMonths.enrollmentId,
                                        enrollmentId
                                    ),
                                    eq(attendanceMonths.month, monthDate)
                                )
                            );

                        return created ? "created" : "updated";
                    });

                    results.push({ row, id: data.code, action });
                } catch (err) {
                    fail(
                        err instanceof Error
                            ? err.message
                            : "This row could not be imported"
                    );
                }
            }
        });

        return importMasterResultSchema.parse({
            created: results.filter((r) => r.action === "created").length,
            updated: results.filter((r) => r.action === "updated").length,
            results,
        });
    }
}

export const masterQueries = new MasterQueries();
