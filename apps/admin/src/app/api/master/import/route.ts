import { cache } from "@workspace/cache";
import {
    CResponse,
    handleError,
    importMasterPayloadSchema,
    ImportMasterRow,
    ImportMasterRowResult,
    importMasterRowSchema,
} from "@workspace/config";
import { queries } from "@workspace/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { month, rows } = importMasterPayloadSchema.parse(body);

        // rows are validated one by one — a bad row becomes a reported error,
        // never a 400 for the whole file. Numbering is spreadsheet-style: the
        // header is row 1, so the first data row reports as 2.
        const valid: { row: number; data: ImportMasterRow }[] = [];
        const invalid: ImportMasterRowResult[] = [];
        const seen = new Set<string>();

        rows.forEach((raw, index) => {
            const row = index + 2;
            const parsed = importMasterRowSchema.safeParse(raw);

            if (!parsed.success) {
                const issue = parsed.error.issues[0];
                invalid.push({
                    row,
                    id: null,
                    error: issue
                        ? issue.path.length
                            ? `${issue.path.join(" ")}: ${issue.message}`
                            : issue.message
                        : "Invalid row",
                });
                return;
            }

            // the file's grain is one row per enrollment, so a student with
            // two enrollments legitimately repeats their ID — duplicates are
            // judged on the (ID, tutor, course) triple
            const key = [
                parsed.data.code,
                parsed.data.tutor.toLowerCase(),
                parsed.data.course.toLowerCase(),
            ].join("::");

            if (seen.has(key)) {
                invalid.push({
                    row,
                    id: parsed.data.code,
                    error: "Duplicate Student ID + Tutor + Course in file — the first row wins",
                });
                return;
            }

            seen.add(key);
            valid.push({ row, data: parsed.data });
        });

        const data = valid.length
            ? await queries.master.import({ month, rows: valid })
            : { created: 0, updated: 0, results: [] };

        const results = [...data.results, ...invalid].sort(
            (a, b) => a.row - b.row
        );
        const errors = results.filter((result) => result.error).length;

        await cache.logs.add({
            type: "student",
            message: "Master import",
            metadata: {
                month,
                created: data.created,
                updated: data.updated,
                errors,
            },
        });

        return CResponse({
            data: { created: data.created, updated: data.updated, results },
        });
    } catch (err) {
        return handleError(err);
    }
}
