import z from "zod";
export const taskBody = z.object({
    title: z.string(),
    description: z.string().default(''),
    options: z.object({
        key: z.string(),
        optionId: z.number(),
        imageUrl: z.string()
    }).array(),
    signature: z.string()
});
//# sourceMappingURL=types.js.map