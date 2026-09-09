import type { FC } from 'react'
import type { TripDayDetail } from '@/entities/trip/trip.type'
import { formatDateWithWeekday, formatSummary } from '@/features/trip-viewer/trip-viewer-format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export type DaySummaryRow = Pick<TripDayDetail, 'id' | 'date' | 'morningSummary' | 'afternoonSummary' | 'eveningSummary'>

type DaySummaryTableProps = {
    days: readonly DaySummaryRow[]
}

const COLUMN_LABELS = ['날짜', '오전', '오후', '저녁'] as const

export const DaySummaryTable: FC<DaySummaryTableProps> = ({ days }) => (
    <Table className='break-inside-avoid text-xs'>
        <TableHeader>
            <TableRow>
                {COLUMN_LABELS.map((label) => (
                    <TableHead key={label} scope='col' className='h-auto bg-muted p-2 text-xs font-medium text-muted-foreground'>
                        {label}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
        <TableBody>
            {days.map((day) => (
                <TableRow key={day.id}>
                    <TableCell className='p-2 align-top font-mono whitespace-nowrap tabular-nums'>{formatDateWithWeekday(day.date)}</TableCell>
                    <TableCell className='p-2 align-top whitespace-normal'>{formatSummary(day.morningSummary)}</TableCell>
                    <TableCell className='p-2 align-top whitespace-normal'>{formatSummary(day.afternoonSummary)}</TableCell>
                    <TableCell className='p-2 align-top whitespace-normal'>{formatSummary(day.eveningSummary)}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)
