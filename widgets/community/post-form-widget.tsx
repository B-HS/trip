'use client'

import { useRouter } from 'next/navigation'
import type { FC } from 'react'
import { useCreatePost, useUpdatePost } from '@/entities/community/community.query'
import type { Board, PostDetail } from '@/entities/community/community.type'
import { useTripList } from '@/entities/trip/trip.query'
import { useUploadImage } from '@/entities/upload/upload.query'
import { PostForm } from '@/features/community/post-form'
import type { PostFormInput, PostFormValues } from '@/features/community/post-form.schema'
import { EMPTY_RICH_TEXT_DOCUMENT } from '@/shared/lib/rich-text-document'

const UPLOAD_KIND = 'post'
const NO_POST_ID = ''
const CREATE_TITLE = '새 글 쓰기'
const EDIT_TITLE = '글 수정'
const DESCRIPTION = '제목과 본문을 작성하고, 필요하면 내 트립을 연결할 수 있습니다.'

export type PostFormBoard = Pick<Board, 'key' | 'name'>

export type PostFormWidgetProps =
    { mode: 'create'; board: PostFormBoard; isUploadEnabled: boolean } | { mode: 'edit'; post: PostDetail; isUploadEnabled: boolean }

export const PostFormWidget: FC<PostFormWidgetProps> = (props) => {
    const router = useRouter()
    const tripList = useTripList()
    const uploadImage = useUploadImage(UPLOAD_KIND)
    const createPost = useCreatePost()
    const updatePost = useUpdatePost(props.mode === 'edit' ? props.post.id : NO_POST_ID)

    const board = props.mode === 'edit' ? props.post.board : props.board
    const defaultValues: PostFormInput =
        props.mode === 'edit'
            ? { title: props.post.title, body: props.post.body, tripId: props.post.tripId }
            : { title: '', body: EMPTY_RICH_TEXT_DOCUMENT, tripId: null }
    const trips = (tripList.data ?? []).map((trip) => ({ id: trip.id, title: trip.title }))
    const handleUploadImage = async (file: File) => {
        try {
            return await uploadImage.mutateAsync(file)
        } catch {
            return null
        }
    }
    const handleSubmit = async (values: PostFormValues) => {
        try {
            const saved =
                props.mode === 'edit' ? await updatePost.mutateAsync(values) : await createPost.mutateAsync({ ...values, boardKey: props.board.key })
            router.push(`/boards/${saved.boardKey}/${saved.id}`)
            return true
        } catch {
            return false
        }
    }

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-card p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>{board.name}</p>
                <h1 className='text-2xl font-semibold tracking-tight'>{props.mode === 'edit' ? EDIT_TITLE : CREATE_TITLE}</h1>
                <p className='text-xs text-muted-foreground'>{DESCRIPTION}</p>
            </section>
            <PostForm
                defaultValues={defaultValues}
                trips={trips}
                cancelHref={props.mode === 'edit' ? `/boards/${board.key}/${props.post.id}` : `/boards/${board.key}`}
                isUploadEnabled={props.isUploadEnabled}
                isUploading={uploadImage.isPending}
                isPending={createPost.isPending || updatePost.isPending}
                onUploadImage={handleUploadImage}
                onSubmit={handleSubmit}
            />
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
