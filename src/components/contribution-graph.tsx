"use client";

import type { Day as WeekDay } from "date-fns";
import {
	differenceInCalendarDays,
	getDay,
	getMonth,
	nextDay,
	parseISO,
	subWeeks,
} from "date-fns";
import {
	createContext,
	Fragment,
	type HTMLAttributes,
	type ReactNode,
	useContext,
	useMemo,
} from "react";
import { cn } from "@/utils/classNames";

export type Activity = {
	date: string;
	count: number;
	level: number;
};

type Week = Array<Activity | undefined>;

type MonthLabel = {
	weekIndex: number;
	label: string;
};

const MONTH_LABELS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

type ContextType = {
	weeks: Week[];
	blockMargin: number;
	blockRadius: number;
	blockSize: number;
	fontSize: number;
	labelHeight: number;
	maxLevel: number;
	totalCount: number;
	width: number;
	height: number;
};

const Context = createContext<ContextType | null>(null);

const useGraph = () => {
	const context = useContext(Context);
	if (!context) throw new Error("Must be used within ContributionGraph");
	return context;
};

const groupByWeeks = (
	activities: Activity[],
	weekStart: WeekDay = 0,
): Week[] => {
	if (activities.length === 0) return [];

	const firstDate = parseISO(activities[0].date);
	const firstCalendarDate =
		getDay(firstDate) === weekStart
			? firstDate
			: subWeeks(nextDay(firstDate, weekStart), 1);

	const padded = [
		...new Array(differenceInCalendarDays(firstDate, firstCalendarDate)).fill(
			undefined,
		),
		...activities,
	];

	return Array.from({ length: Math.ceil(padded.length / 7) }, (_, i) =>
		padded.slice(i * 7, i * 7 + 7),
	);
};

const getMonthLabels = (weeks: Week[]): MonthLabel[] => {
	return weeks
		.reduce<MonthLabel[]>((labels, week, weekIndex) => {
			const activity = week.find((a) => a !== undefined);
			if (!activity) throw new Error(`Week ${weekIndex + 1} is empty`);

			const month = MONTH_LABELS[getMonth(parseISO(activity.date))];
			if (!month) throw new Error(`Invalid month for ${activity.date}`);

			const prev = labels.at(-1);
			if (weekIndex === 0 || !prev || prev.label !== month) {
				return labels.concat({ weekIndex, label: month });
			}
			return labels;
		}, [])
		.filter(({ weekIndex }, index, labels) => {
			const minWeeks = 3;
			if (index === 0)
				return labels[1] && labels[1].weekIndex - weekIndex >= minWeeks;
			if (index === labels.length - 1)
				return weeks.slice(weekIndex).length >= minWeeks;
			return true;
		});
};

type ContributionGraphProps = HTMLAttributes<HTMLDivElement> & {
	data: Activity[];
	blockMargin?: number;
	blockRadius?: number;
	blockSize?: number;
	fontSize?: number;
	maxLevel?: number;
	className?: string;
	children: ReactNode;
};

export const ContributionGraph = ({
	data,
	blockMargin = 4,
	blockRadius = 2,
	blockSize = 12,
	fontSize = 14,
	maxLevel: maxLevelProp = 4,
	className,
	children,
	...props
}: ContributionGraphProps) => {
	const maxLevel = Math.max(1, maxLevelProp);
	const weeks = useMemo(() => groupByWeeks(data, 0), [data]);
	const labelHeight = fontSize + 8;
	const totalCount = data.reduce((sum, a) => sum + a.count, 0);
	const width = weeks.length * (blockSize + blockMargin) - blockMargin;
	const height = labelHeight + (blockSize + blockMargin) * 7 - blockMargin;

	if (data.length === 0) return null;

	return (
		<Context.Provider
			value={{
				weeks,
				blockMargin,
				blockRadius,
				blockSize,
				fontSize,
				labelHeight,
				maxLevel,
				totalCount,
				width,
				height,
			}}
		>
			<div
				className={cn("flex w-max max-w-full flex-col gap-2", className)}
				style={{ fontSize }}
				{...props}
			>
				{children}
			</div>
		</Context.Provider>
	);
};

type ContributionGraphBlockProps = HTMLAttributes<SVGRectElement> & {
	activity: Activity;
	dayIndex: number;
	weekIndex: number;
};

export const ContributionGraphBlock = ({
	activity,
	dayIndex,
	weekIndex,
	className,
	...props
}: ContributionGraphBlockProps) => {
	const { blockSize, blockMargin, blockRadius, labelHeight, maxLevel } =
		useGraph();

	if (activity.level < 0 || activity.level > maxLevel) {
		throw new RangeError(
			`Activity level ${activity.level} is out of range (0-${maxLevel})`,
		);
	}

	return (
		<rect
			className={cn(
				'data-[level="0"]:fill-ctp-base',
				'data-[level="1"]:fill-ctp-surface0',
				'data-[level="2"]:fill-ctp-surface1',
				'data-[level="3"]:fill-ctp-surface2',
				'data-[level="4"]:fill-ctp-mauve',
				className,
			)}
			data-count={activity.count}
			data-date={activity.date}
			data-level={activity.level}
			height={blockSize}
			rx={blockRadius}
			ry={blockRadius}
			width={blockSize}
			x={(blockSize + blockMargin) * weekIndex}
			y={labelHeight + (blockSize + blockMargin) * dayIndex}
			{...props}
		/>
	);
};

type ContributionGraphCalendarProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	"children"
> & {
	children: (props: {
		activity: Activity;
		dayIndex: number;
		weekIndex: number;
	}) => ReactNode;
};

export const ContributionGraphCalendar = ({
	className,
	children,
	...props
}: ContributionGraphCalendarProps) => {
	const { weeks, width, height, blockSize, blockMargin } = useGraph();
	const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);

	return (
		<div
			className={cn(
				"scrollbar max-w-full overflow-y-hidden overflow-x-auto md:w-max md:max-w-none",
				className,
			)}
			{...props}
		>
			<svg
				className="block overflow-visible"
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
			>
				<title>Contribution Graph</title>
				<g className="fill-ctp-text">
					{monthLabels.map(({ label, weekIndex }) => (
						<text
							dominantBaseline="hanging"
							key={`${label}-${weekIndex}`}
							x={(blockSize + blockMargin) * weekIndex}
						>
							{label}
						</text>
					))}
				</g>
				{weeks.map((week, weekIndex) =>
					week.map((activity, dayIndex) =>
						activity ? (
							<Fragment key={activity.date}>
								{children({ activity, dayIndex, weekIndex })}
							</Fragment>
						) : null,
					),
				)}
			</svg>
		</div>
	);
};

export const ContributionGraphFooter = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-wrap gap-1 whitespace-nowrap sm:gap-x-4",
			className,
		)}
		{...props}
	/>
);

export const ContributionGraphTotalCount = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => {
	const { totalCount } = useGraph();
	return (
		<div className={cn("text-ctp-overlay0", className)} {...props}>
			{totalCount} contributions in the past year
		</div>
	);
};

export const ContributionGraphLegend = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => {
	const { maxLevel, blockSize, blockRadius } = useGraph();
	const levels = useMemo(
		() => Array.from({ length: maxLevel + 1 }, (_, i) => i),
		[maxLevel],
	);

	return (
		<div
			className={cn("ml-auto flex items-center gap-0.75", className)}
			{...props}
		>
			<span className="mr-1 text-ctp-overlay0">Less</span>
			{levels.map((level) => (
				<svg key={`legend-level-${level}`} height={blockSize} width={blockSize}>
					<title>{`${level} contributions`}</title>
					<rect
						className={cn(
							"stroke-[1px] stroke-ctp-surface0",
							'data-[level="0"]:fill-ctp-base',
							'data-[level="1"]:fill-ctp-surface0',
							'data-[level="2"]:fill-ctp-surface1',
							'data-[level="3"]:fill-ctp-surface2',
							'data-[level="4"]:fill-ctp-mauve',
						)}
						data-level={level}
						height={blockSize}
						rx={blockRadius}
						ry={blockRadius}
						width={blockSize}
					/>
				</svg>
			))}
			<span className="ml-1 text-ctp-overlay0">More</span>
		</div>
	);
};
