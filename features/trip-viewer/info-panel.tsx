'use client'

import type { FC, ReactNode } from 'react'
import type { TripInfoBlock, TripInfoSectionDetail } from '@/entities/trip/trip.type'
import { DaySummaryTable, type DaySummaryRow } from '@/features/trip-viewer/day-summary-table'
import { cn } from '@/shared/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'

type InfoBlockGroup = { key: string; kind: 'bullet-list'; blocks: TripInfoBlock[] } | { key: string; kind: 'single'; block: TripInfoBlock }

const groupInfoBlocks = (blocks: readonly TripInfoBlock[]) =>
    blocks.reduce<InfoBlockGroup[]>((groups, block) => {
        const last = groups.at(-1)
        if (block.kind !== 'bullet') return [...groups, { key: block.id, kind: 'single', block }]
        if (last?.kind === 'bullet-list') return [...groups.slice(0, -1), { ...last, blocks: [...last.blocks, block] }]
        return [...groups, { key: block.id, kind: 'bullet-list', blocks: [block] }]
    }, [])

const renderInfoText = (block: TripInfoBlock): ReactNode => (
    <>
        {block.emphasis && <strong className='font-medium'>{block.emphasis}</strong>}
        {block.emphasis && block.text && ' '}
        {block.text}
        {block.text && block.linkUrl && ' '}
        {block.linkUrl && block.linkLabel && (
            <a className='underline' href={block.linkUrl} target='_blank' rel='noopener noreferrer'>
                {block.linkLabel}
            </a>
        )}
    </>
)

type InfoPanelProps = {
    sections: readonly TripInfoSectionDetail[]
    days: readonly DaySummaryRow[]
    isPrintLayout?: boolean
}

export const InfoPanel: FC<InfoPanelProps> = ({ sections, days, isPrintLayout = false }) => {
    const renderBlocks = (blocks: readonly TripInfoBlock[]) =>
        groupInfoBlocks(blocks).map((group) => {
            if (group.kind === 'bullet-list')
                return (
                    <ul key={group.key} className='flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed'>
                        {group.blocks.map((block) => (
                            <li key={block.id} className='break-keep'>
                                {renderInfoText(block)}
                            </li>
                        ))}
                    </ul>
                )
            if (group.block.kind === 'heading')
                return (
                    <h3 key={group.key} className='text-sm font-semibold tracking-tight break-keep'>
                        {group.block.text ?? group.block.emphasis}
                    </h3>
                )
            if (group.block.kind === 'day_table') return <DaySummaryTable key={group.key} days={days} />
            return (
                <p key={group.key} className='text-sm leading-relaxed break-keep'>
                    {renderInfoText(group.block)}
                </p>
            )
        })

    return (
        <section className={cn('flex flex-col gap-px', isPrintLayout && 'break-before-page')}>
            <h2 className='bg-card p-3 text-base font-semibold tracking-tight'>여행 정보와 확인 사항</h2>
            {isPrintLayout ? (
                sections.map((section) => (
                    <section key={section.id} className='flex break-inside-avoid flex-col gap-3 bg-card p-3'>
                        <h3 className='text-sm font-medium'>{section.title}</h3>
                        {renderBlocks(section.blocks)}
                    </section>
                ))
            ) : (
                <Accordion
                    type='multiple'
                    className='bg-card px-3'
                    defaultValue={sections.filter((section) => section.isDefaultOpen).map((section) => section.id)}>
                    {sections.map((section) => (
                        <AccordionItem key={section.id} value={section.id} className='last:border-b-0'>
                            <AccordionTrigger className='py-3 text-sm font-medium hover:no-underline'>{section.title}</AccordionTrigger>
                            <AccordionContent className='flex flex-col gap-3 pb-3'>{renderBlocks(section.blocks)}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </section>
    )
}
