import * as z from "zod";

export const extractLogoSchema = z.object({
    logoURL: z.string().nullable().describe("The URL of the logo image, or null if no logo is found"),
});