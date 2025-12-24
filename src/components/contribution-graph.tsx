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
	type CSSProperties,
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

const DEFAULT_MONTH_LABELS = [
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

type ContributionGraphContextType = {
	data: Activity[];
	weeks: Week[];
	blockMargin: number;
	blockRadius: number;
	blockSize: number;
	fontSize: number;
	labelHeight: number;
	maxLevel: number;
	totalCount: number;
	weekStart: WeekDay;
	width: number;
	height: number;
};

const ContributionGraphContext =
	createContext<ContributionGraphContextType | null>(null);

const useContributionGraph = () => {
	const context = useContext(ContributionGraphContext);

	if (!context) {
		throw new Error(
			"ContributionGraph components must be used within a ContributionGraph",
		);
	}

	return context;
};

const groupByWeeks = (
	activities: Activity[],
	weekStart: WeekDay = 0,
): Week[] => {
	if (activities.length === 0) {
		return [];
	}

	// Data is already complete with all days filled (from github-contributions.ts)
	const firstActivity = activities[0] as Activity;
	const firstDate = parseISO(firstActivity.date);
	const firstCalendarDate =
		getDay(firstDate) === weekStart
			? firstDate
			: subWeeks(nextDay(firstDate, weekStart), 1);

	const paddedActivities = [
		...(new Array(differenceInCalendarDays(firstDate, firstCalendarDate)).fill(
			undefined,
		) as Activity[]),
		...activities,
	];

	const numberOfWeeks = Math.ceil(paddedActivities.length / 7);

	return new Array(numberOfWeeks)
		.fill(undefined)
		.map((_, weekIndex) =>
			paddedActivities.slice(weekIndex * 7, weekIndex * 7 + 7),
		);
};

const getMonthLabels = (
	weeks: Week[],
	monthNames: string[] = DEFAULT_MONTH_LABELS,
): MonthLabel[] => {
	return weeks
		.reduce<MonthLabel[]>((labels, week, weekIndex) => {
			const firstActivity = week.find((activity) => activity !== undefined);

			if (!firstActivity) {
				throw new Error(
					`Unexpected error: Week ${weekIndex + 1} is empty: [${week}].`,
				);
			}

			const month = monthNames[getMonth(parseISO(firstActivity.date))];

			if (!month) {
				const monthName = new Date(firstActivity.date).toLocaleString("en-US", {
					month: "short",
				});
				throw new Error(
					`Unexpected error: undefined month label for ${monthName}.`,
				);
			}

			const prevLabel = labels.at(-1);

			if (weekIndex === 0 || !prevLabel || prevLabel.label !== month) {
				return labels.concat({ weekIndex, label: month });
			}

			return labels;
		}, [])
		.filter(({ weekIndex }, index, labels) => {
			const minWeeks = 3;

			if (index === 0) {
				return labels[1] && labels[1].weekIndex - weekIndex >= minWeeks;
			}

			if (index === labels.length - 1) {
				return weeks.slice(weekIndex).length >= minWeeks;
			}

			return true;
		});
};

export type ContributionGraphProps = HTMLAttributes<HTMLDivElement> & {
	data: Activity[];
	blockMargin?: number;
	blockRadius?: number;
	blockSize?: number;
	fontSize?: number;
	maxLevel?: number;
	style?: CSSProperties;
	totalCount?: number;
	weekStart?: WeekDay;
	children: ReactNode;
	className?: string;
};

export const ContributionGraph = ({
	data,
	blockMargin = 4,
	blockRadius = 2,
	blockSize = 12,
	fontSize = 14,
	maxLevel: maxLevelProp = 4,
	style = {},
	totalCount: totalCountProp = undefined,
	weekStart = 0,
	className,
	...props
}: ContributionGraphProps) => {
	const maxLevel = Math.max(1, maxLevelProp);
	const weeks = useMemo(() => groupByWeeks(data, weekStart), [data, weekStart]);
	const LABEL_MARGIN = 8;

	const labelHeight = fontSize + LABEL_MARGIN;

	const totalCount =
		typeof totalCountProp === "number"
			? totalCountProp
			: data.reduce((sum, activity) => sum + activity.count, 0);

	const width = weeks.length * (blockSize + blockMargin) - blockMargin;
	const height = labelHeight + (blockSize + blockMargin) * 7 - blockMargin;

	if (data.length === 0) {
		return null;
	}

	return (
		<ContributionGraphContext.Provider
			value={{
				data,
				weeks,
				blockMargin,
				blockRadius,
				blockSize,
				fontSize,
				labelHeight,
				maxLevel,
				totalCount,
				weekStart,
				width,
				height,
			}}
		>
			<div
				className={cn("flex w-full flex-col gap-2", className)}
				style={{ fontSize, ...style }}
				{...props}
			/>
		</ContributionGraphContext.Provider>
	);
};

export type ContributionGraphBlockProps = HTMLAttributes<SVGRectElement> & {
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
		useContributionGraph();

	if (activity.level < 0 || activity.level > maxLevel) {
		throw new RangeError(
			`Provided activity level ${activity.level} for ${activity.date} is out of range. It must be between 0 and ${maxLevel}.`,
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

export type ContributionGraphCalendarProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	"children"
> & {
	hideMonthLabels?: boolean;
	className?: string;
	children: (props: {
		activity: Activity;
		dayIndex: number;
		weekIndex: number;
	}) => ReactNode;
};

export const ContributionGraphCalendar = ({
	hideMonthLabels = false,
	className,
	children,
	...props
}: ContributionGraphCalendarProps) => {
	const { weeks, width, height, blockSize, blockMargin } =
		useContributionGraph();

	const monthLabels = useMemo(
		() => getMonthLabels(weeks, DEFAULT_MONTH_LABELS),
		[weeks],
	);

	return (
		<div className={cn("w-full", className)} {...props}>
			<svg
				className="block w-full h-auto overflow-visible"
				viewBox={`0 0 ${width} ${height}`}
				preserveAspectRatio="xMidYMid meet"
			>
				<title>Contribution Graph</title>
				{!hideMonthLabels && (
					<g className="fill-ctp-text">
						{monthLabels.map(({ label, weekIndex }) => (
							<text
								dominantBaseline="hanging"
								key={weekIndex}
								x={(blockSize + blockMargin) * weekIndex}
							>
								{label}
							</text>
						))}
					</g>
				)}
				{weeks.map((week, weekIndex) =>
					week.map((activity, dayIndex) => {
						if (!activity) {
							return null;
						}

						return (
							<Fragment key={activity.date}>
								{children({ activity, dayIndex, weekIndex })}
							</Fragment>
						);
					}),
				)}
			</svg>
		</div>
	);
};

export type ContributionGraphFooterProps = HTMLAttributes<HTMLDivElement>;

export const ContributionGraphFooter = ({
	className,
	...props
}: ContributionGraphFooterProps) => (
	<div
		className={cn(
			"flex flex-wrap gap-1 whitespace-nowrap sm:gap-x-4",
			className,
		)}
		{...props}
	/>
);

export type ContributionGraphTotalCountProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	"children"
> & {
	children?: (props: { totalCount: number }) => ReactNode;
};

export const ContributionGraphTotalCount = ({
	className,
	children,
	...props
}: ContributionGraphTotalCountProps) => {
	const { totalCount } = useContributionGraph();

	if (children) {
		return <>{children({ totalCount })}</>;
	}

	return (
		<div className={cn("text-ctp-overlay0", className)} {...props}>
			{totalCount} contributions in the past year
		</div>
	);
};

export type ContributionGraphLegendProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	"children"
> & {
	children?: (props: { level: number }) => ReactNode;
};

export const ContributionGraphLegend = ({
	className,
	children,
	...props
}: ContributionGraphLegendProps) => {
	const { maxLevel, blockSize, blockRadius } = useContributionGraph();

	return (
		<div
			className={cn("ml-auto flex items-center gap-0.75", className)}
			{...props}
		>
			<span className="mr-1 text-ctp-overlay0">Less</span>
			{Array.from({ length: maxLevel + 1 }, (_, level) => level).map((level) =>
				children ? (
					<Fragment key={`legend-level-${level}`}>
						{children({ level })}
					</Fragment>
				) : (
					<svg
						height={blockSize}
						key={`legend-level-${level}`}
						width={blockSize}
					>
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
				),
			)}
			<span className="ml-1 text-ctp-overlay0">More</span>
		</div>
	);
};
