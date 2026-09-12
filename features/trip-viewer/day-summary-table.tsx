import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { TripDayDetail } from '@/entities/trip/trip.type'
import { formatDateWithWeekday, formatSummary } from '@/features/trip-viewer/trip-viewer-format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export type DaySummaryRow = Pick<TripDayDetail, 'id' | 'date' | 'morningSummary' | 'afternoonSummary' | 'eveningSummary'>

type DaySummaryTableProps = {
    days: readonly DaySummaryRow[]
}

export const DaySummaryTable: FC<DaySummaryTableProps> = ({ days }) => {
    const locale = useLocale()
    const t = useTranslations('tripViewer')
    const columnLabels = [t('tableDate'), t('tableMorning'), t('tableAfternoon'), t('tableEvening')]
    return (
        <Table className='break-inside-avoid text-xs'>
            <TableHeader>
                <TableRow>
                    {columnLabels.map((label) => (
                        <TableHead key={label} scope='col' className='h-auto bg-muted p-2 text-xs font-medium text-muted-foreground'>
                            {label}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {days.map((day) => (
                    <TableRow key={day.id}>
                        <TableCell className='p-2 align-top font-mono whitespace-nowrap tabular-nums'>
                            {formatDateWithWeekday(day.date, locale)}
                        </TableCell>
                        <TableCell className='p-2 align-top whitespace-normal'>{formatSummary(day.morningSummary)}</TableCell>
                        <TableCell className='p-2 align-top whitespace-normal'>{formatSummary(day.afternoonSummary)}</TableCell>
                        <TableCell className='p-2 align-top whitespace-normal'>{formatSummary(day.eveningSummary)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
