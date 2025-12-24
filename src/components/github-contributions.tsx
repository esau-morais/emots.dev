"use client";

import {
	type Activity,
	ContributionGraph,
	ContributionGraphBlock,
	ContributionGraphCalendar,
	ContributionGraphFooter,
	ContributionGraphLegend,
	ContributionGraphTotalCount,
} from "./contribution-graph";

type GitHubContributionsProps = {
	data: Activity[];
};

export const GitHubContributions = ({ data }: GitHubContributionsProps) => {
	if (data.length === 0) {
		return null;
	}

	return (
		<ContributionGraph data={data} className="mx-auto mt-8">
			<ContributionGraphCalendar>
				{({ activity, dayIndex, weekIndex }) => (
					<ContributionGraphBlock
						activity={activity}
						dayIndex={dayIndex}
						weekIndex={weekIndex}
					/>
				)}
			</ContributionGraphCalendar>
			<ContributionGraphFooter>
				<ContributionGraphTotalCount />
				<ContributionGraphLegend />
			</ContributionGraphFooter>
		</ContributionGraph>
	);
};
