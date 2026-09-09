import { z } from 'zod'
import { postUpdateSchema } from '@/entities/community/community.validate'
import type { RichTextDocument } from '@/shared/lib/rich-text-document'

const postBodySchema = postUpdateSchema.shape.body

export const postFormSchema = z.object({
    title: postUpdateSchema.shape.title,
    body: z.custom<RichTextDocument>().superRefine((value, ctx) => {
        const result = postBodySchema.safeParse(value)
        if (result.success) return
        for (const issue of result.error.issues) ctx.addIssue(issue.message)
    }),
    tripId: postUpdateSchema.shape.tripId,
})

export type PostFormInput = z.input<typeof postFormSchema>
export type PostFormValues = z.output<typeof postFormSchema>
