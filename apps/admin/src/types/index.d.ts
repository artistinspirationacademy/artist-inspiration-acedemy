import { SafeUser } from "@workspace/config";

declare global {
    type TokenPayload = Pick<SafeUser, "id">;
}
