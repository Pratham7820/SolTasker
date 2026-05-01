import z from "zod";
export const taskBody = z.object({
    title: z.string(),
    description: z.string().default(''),
    options: z.object({
        optionId: z.number(),
        imageUrl: z.string()
    }).array()
});
//# sourceMappingURL=types.js.map