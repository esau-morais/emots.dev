import { eachDayOfInterval, formatISO, subDays } from "date-fns";
import { cacheLife, cacheTag } from "next/cache";
import type { Activity } from "@/components/contribution-graph";
import { env } from "./env";

type GitHubGraphQLResponse = {
	data: {
		user: {
			contributionsCollection: {
				contributionCalendar: {
					totalContributions: number;
					weeks: Array<{
						contributionDays: Array<{
							contributionCount: number;
							date: string;
						}>;
					}>;
				};
			};
		} | null;
	};
	errors?: Array<{
		message: string;
	}>;
};

const calculateLevel = (
	count: number,
	maxCount: number,
	maxLevel: number,
): number => {
	if (count === 0 || maxCount === 0) return 0;
	return Math.min(Math.ceil((count / maxCount) * maxLevel), maxLevel);
};

const query = `
query($userName: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $userName) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
`;

export const getGitHubContributions = async (
	username: string,
): Promise<Activity[]> => {
	"use cache";
	cacheTag("github-contributions", `github-${username}`);
	cacheLife("hours");

	try {
		const { GITHUB_TOKEN } = env;

		const now = new Date();
		const dateStart = subDays(now, 365);
		const dateEnd = now;

		const variables = {
			userName: username,
			from: dateStart.toISOString(),
			to: dateEnd.toISOString(),
		};

		const response = await fetch("https://api.github.com/graphql", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query, variables }),
			next: { revalidate: 3600 },
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch contributions: ${response.statusText}`);
		}

		const data = (await response.json()) as GitHubGraphQLResponse;

		if (data.errors) {
			throw new Error(data.errors.map((e) => e.message).join(", "));
		}

		const calendar =
			data.data?.user?.contributionsCollection?.contributionCalendar;
		if (!calendar) {
			return [];
		}

		const contributionsMap = new Map<string, number>();
		let maxCount = 0;

		for (const week of calendar.weeks) {
			for (const day of week.contributionDays) {
				const count = day.contributionCount;
				if (count > 0) {
					contributionsMap.set(day.date, count);
					maxCount = Math.max(maxCount, count);
				}
			}
		}

		// Generate data for all days of the past 12 months
		const days = eachDayOfInterval({ start: dateStart, end: dateEnd });
		const maxLevel = 4;
		const finalMaxCount = Math.max(maxCount, 1);

		return days.map((date) => {
			const dateStr = formatISO(date, { representation: "date" });
			const count = contributionsMap.get(dateStr) || 0;
			return {
				date: dateStr,
				count,
				level: calculateLevel(count, finalMaxCount, maxLevel),
			};
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error fetching GitHub contributions:", error.message);
		}
		return [];
	}
};
