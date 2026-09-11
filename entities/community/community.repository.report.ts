import 'server-only'
import { and, count, desc, eq, isNull } from 'drizzle-orm'
import { alias } from 'drizzle-orm/mysql-core'
import type { ReportPage, ReportView } from '@/entities/community/community.type'
import type { ReportCreateValues } from '@/entities/community/community.validate'
import type { ReportStatus } from '@/shared/constant/community'
import { getDb } from '@/shared/db/client'
import { user } from '@/shared/db/schema/auth'
import { tripComment, tripPost, tripReport } from '@/shared/db/schema/community'
import { ApiError } from '@/shared/lib/api-response'

const REPORT_DUPLICATE = 'error.reportDuplicate'
const REPORT_NOT_FOUND = 'error.reportNotFound'

const targetUser = alias(user, 'target_user')

export const submitReport = async (reporterId: string, values: ReportCreateValues) => {
    const [existing] = await getDb()
        .select({ id: tripReport.id })
        .from(tripReport)
        .where(and(eq(tripReport.reporterId, reporterId), eq(tripReport.kind, values.kind), eq(tripReport.targetId, values.targetId)))
        .limit(1)
    if (existing) throw new ApiError('VALIDATION_ERROR', REPORT_DUPLICATE)
    const id = crypto.randomUUID()
    await getDb()
        .insert(tripReport)
        .values({ id, reporterId, kind: values.kind, targetId: values.targetId, reason: values.reason, memo: values.memo })
    return { id }
}

export const countOpenReports = async () => {
    const [row] = await getDb().select({ value: count() }).from(tripReport).where(eq(tripReport.status, 'open'))
    return row?.value ?? 0
}

export const findOpenReportsPage = async (offset: number, limit: number): Promise<ReportPage> => {
    const [total, rows] = await Promise.all([countOpenReports(), selectOpenReports(offset, limit)])
    const pageCount = Math.max(1, Math.ceil(total / limit))
    return { items: rows, page: Math.floor(offset / limit) + 1, pageSize: limit, total, pageCount }
}

const selectOpenReports = async (offset: number, limit: number): Promise<ReportView[]> => {
    const rows = await getDb()
        .select({
            id: tripReport.id,
            kind: tripReport.kind,
            targetId: tripReport.targetId,
            reason: tripReport.reason,
            memo: tripReport.memo,
            status: tripReport.status,
            createdAt: tripReport.createdAt,
            reporter: { id: user.id, name: user.name, username: user.username, image: user.image },
            postTitle: tripPost.title,
            postDeletedAt: tripPost.deletedAt,
            commentBody: tripComment.body,
            commentDeletedAt: tripComment.deletedAt,
            targetUsername: targetUser.username,
        })
        .from(tripReport)
        .innerJoin(user, eq(tripReport.reporterId, user.id))
        .leftJoin(tripPost, and(eq(tripReport.kind, 'post'), eq(tripPost.id, tripReport.targetId)))
        .leftJoin(tripComment, and(eq(tripReport.kind, 'comment'), eq(tripComment.id, tripReport.targetId)))
        .leftJoin(targetUser, and(eq(tripReport.kind, 'user'), eq(targetUser.id, tripReport.targetId)))
        .where(eq(tripReport.status, 'open'))
        .orderBy(desc(tripReport.createdAt))
        .limit(limit)
        .offset(offset)
    return rows.map(
        (row) =>
            ({
                id: row.id,
                kind: row.kind,
                targetId: row.targetId,
                reason: row.reason,
                memo: row.memo,
                status: row.status,
                reporter: row.reporter,
                targetLabel: targetLabelOf(row),
                createdAt: row.createdAt.toISOString(),
            }) satisfies ReportView,
    )
}

const targetLabelOf = (row: {
    kind: 'post' | 'comment' | 'user'
    postTitle: string | null
    postDeletedAt: Date | null
    commentBody: string | null
    commentDeletedAt: Date | null
    targetUsername: string | null
}) => {
    if (row.kind === 'post') return row.postTitle === null || row.postDeletedAt !== null ? 'error.deletedPost' : row.postTitle
    if (row.kind === 'comment') return row.commentBody === null || row.commentDeletedAt !== null ? 'error.deletedComment' : row.commentBody
    return row.targetUsername === null ? 'error.withdrawnUser' : row.targetUsername
}

export const findReportById = async (reportId: string) => {
    const [row] = await getDb().select().from(tripReport).where(eq(tripReport.id, reportId)).limit(1)
    if (!row) throw new ApiError('NOT_FOUND', REPORT_NOT_FOUND)
    return row
}

export const resolveReportTargetUserId = async (report: { kind: 'post' | 'comment' | 'user'; targetId: string }) => {
    if (report.kind === 'user') return report.targetId
    if (report.kind === 'post') {
        const [row] = await getDb().select({ authorId: tripPost.authorId }).from(tripPost).where(eq(tripPost.id, report.targetId)).limit(1)
        if (!row) throw new ApiError('NOT_FOUND', REPORT_NOT_FOUND)
        return row.authorId
    }
    const [row] = await getDb().select({ authorId: tripComment.authorId }).from(tripComment).where(eq(tripComment.id, report.targetId)).limit(1)
    if (!row) throw new ApiError('NOT_FOUND', REPORT_NOT_FOUND)
    return row.authorId
}

export const markReportHandled = async (reportId: string, handledBy: string, status: ReportStatus) => {
    await getDb().update(tripReport).set({ status, handledBy, handledAt: new Date() }).where(eq(tripReport.id, reportId))
    return { id: reportId, status }
}

export const softDeleteTarget = async (kind: 'post' | 'comment', targetId: string) => {
    if (kind === 'post') {
        const result = await getDb()
            .update(tripPost)
            .set({ deletedAt: new Date() })
            .where(and(eq(tripPost.id, targetId), isNull(tripPost.deletedAt)))
        if (result[0].affectedRows === 0) throw new ApiError('NOT_FOUND', REPORT_NOT_FOUND)
        return
    }
    const result = await getDb()
        .update(tripComment)
        .set({ deletedAt: new Date() })
        .where(and(eq(tripComment.id, targetId), isNull(tripComment.deletedAt)))
    if (result[0].affectedRows === 0) throw new ApiError('NOT_FOUND', REPORT_NOT_FOUND)
}
