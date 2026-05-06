import z from "zod";

export const responseMessages = z.union([
    z.literal("OK"),
    z.literal("CREATED"),
    z.literal("BAD_REQUEST"),
    z.literal("UNAUTHORIZED"),
    z.literal("FORBIDDEN"),
    z.literal("NOT_FOUND"),
    z.literal("CONFLICT"),
    z.literal("TOO_MANY_REQUESTS"),
    z.literal("INTERNAL_SERVER_ERROR"),
    z.literal("NOT_IMPLEMENTED"),
    z.literal("BAD_GATEWAY"),
    z.literal("SERVICE_UNAVAILABLE"),
    z.literal("GATEWAY_TIMEOUT"),
    z.literal("UNPROCESSABLE_ENTITY"),
    z.literal("UNKNOWN_ERROR"),
    z.literal("ERROR"),
]);

export const responseSchema = <DataType extends z.ZodTypeAny>(
    dataType: DataType
) => {
    return z.object({
        success: z.boolean(),
        longMessage: z.string().optional(),
        data: dataType.optional(),
    });
};

export type ResponseMessages = z.infer<typeof responseMessages>;
export type ResponseData<T = undefined> =
    | {
          success: true;
          data: T;
          longMessage?: string;
      }
    | {
          success: false;
          data?: never;
          longMessage?: string;
      };
