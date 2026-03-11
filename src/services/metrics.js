const { GitHubApiError, githubGraphQLRequest } = require("../lib/github");

const CONTRIBUTION_QUERY = `
  query DashboardContributionQuery($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      name
      followers {
        totalCount
      }
      repositories(privacy: PUBLIC, isFork: false, ownerAffiliations: OWNER) {
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
              weekday
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 5) {
          repository {
            nameWithOwner
            url
            stargazerCount
          }
          contributions(first: 1) {
            totalCount
          }
        }
      }
    }
  }
`;

const LANGUAGE_QUERY = `
  query DashboardLanguageQuery($login: String!, $after: String) {
    user(login: $login) {
      repositories(
        first: 100
        after: $after
        ownerAffiliations: OWNER
        isFork: false
        privacy: PUBLIC
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

function flattenContributionDays(weeks) {
  return weeks.flatMap((week) =>
    (week.contributionDays || []).map((day) => ({
      date: day.date,
      contributionCount: day.contributionCount,
      contributionLevel: day.contributionLevel,
      weekday: day.weekday
    }))
  );
}

function dayDiff(previousDate, currentDate) {
  const previous = new Date(`${previousDate}T00:00:00Z`);
  const current = new Date(`${currentDate}T00:00:00Z`);
  const diffMs = current.getTime() - previous.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

function calculateStreak(days) {
  const activeDates = days
    .filter((day) => day.contributionCount > 0)
    .map((day) => day.date)
    .sort();

  if (!activeDates.length) {
    return {
      current: 0,
      longest: 0,
      lastActiveDate: null,
      activeDays: 0
    };
  }

  let longest = 1;
  let rolling = 1;

  for (let index = 1; index < activeDates.length; index += 1) {
    if (dayDiff(activeDates[index - 1], activeDates[index]) === 1) {
      rolling += 1;
      longest = Math.max(longest, rolling);
    } else {
      rolling = 1;
    }
  }

  const lastActiveDate = activeDates[activeDates.length - 1];
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterdayDate = new Date(now);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  let current = 0;
  if (lastActiveDate === today || lastActiveDate === yesterday) {
    current = 1;
    for (let index = activeDates.length - 2; index >= 0; index -= 1) {
      if (dayDiff(activeDates[index], activeDates[index + 1]) !== 1) {
        break;
      }
      current += 1;
    }
  }

  return {
    current,
    longest,
    lastActiveDate,
    activeDays: activeDates.length
  };
}

async function getContributionMetrics(username, token) {
  const toDate = new Date();
  const fromDate = new Date(toDate);
  fromDate.setUTCDate(fromDate.getUTCDate() - 365);

  const data = await githubGraphQLRequest(
    CONTRIBUTION_QUERY,
    {
      login: username,
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    },
    token
  );

  const user = data.user;
  if (!user) {
    throw new GitHubApiError(`User '${username}' not found.`, 404);
  }

  const collection = user.contributionsCollection;
  if (!collection) {
    throw new GitHubApiError("Could not read contribution data for this user.", 404);
  }

  const calendar = collection.contributionCalendar;
  const weeks = calendar?.weeks || [];
  const days = flattenContributionDays(weeks);
  const streak = calculateStreak(days);
  const topCommitRepos = (collection.commitContributionsByRepository || [])
    .map((item) => ({
      name: item.repository?.nameWithOwner || "unknown",
      url: item.repository?.url || "",
      stars: item.repository?.stargazerCount || 0,
      commits: item.contributions?.totalCount || 0
    }))
    .filter((repo) => repo.commits > 0)
    .sort((left, right) => right.commits - left.commits)
    .slice(0, 3);

  return {
    username: user.login,
    displayName: user.name || user.login,
    followers: user.followers?.totalCount || 0,
    publicRepos: user.repositories?.totalCount || 0,
    totals: {
      contributions: calendar?.totalContributions || 0,
      commits: collection.totalCommitContributions || 0,
      pullRequests: collection.totalPullRequestContributions || 0,
      issues: collection.totalIssueContributions || 0,
      reviews: collection.totalPullRequestReviewContributions || 0
    },
    calendar: {
      weeks,
      days
    },
    streak,
    topCommitRepos,
    range: {
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10)
    }
  };
}

async function getLanguageMetrics(username, token, pageLimit = 3) {
  const languageMap = new Map();
  let afterCursor = null;
  let scannedRepositories = 0;

  for (let page = 0; page < pageLimit; page += 1) {
    const data = await githubGraphQLRequest(
      LANGUAGE_QUERY,
      {
        login: username,
        after: afterCursor
      },
      token
    );

    const user = data.user;
    if (!user) {
      throw new GitHubApiError(`User '${username}' not found.`, 404);
    }

    const repositories = user.repositories?.nodes || [];
    scannedRepositories += repositories.length;

    for (const repository of repositories) {
      const languageEdges = repository.languages?.edges || [];
      for (const edge of languageEdges) {
        const languageName = edge.node?.name || "Other";
        const color = edge.node?.color || "#94a3b8";
        const size = edge.size || 0;
        const current = languageMap.get(languageName);

        if (!current) {
          languageMap.set(languageName, {
            name: languageName,
            color,
            bytes: size
          });
          continue;
        }

        current.bytes += size;
      }
    }

    const pageInfo = user.repositories?.pageInfo;
    if (!pageInfo?.hasNextPage) {
      break;
    }

    afterCursor = pageInfo.endCursor;
  }

  const sortedLanguages = [...languageMap.values()].sort(
    (left, right) => right.bytes - left.bytes
  );
  const totalBytes = sortedLanguages.reduce((sum, language) => sum + language.bytes, 0);

  const languages = sortedLanguages.slice(0, 8).map((language) => ({
    ...language,
    percentage: totalBytes > 0 ? (language.bytes / totalBytes) * 100 : 0
  }));

  return {
    username,
    totalBytes,
    scannedRepositories,
    languages
  };
}

module.exports = {
  getContributionMetrics,
  getLanguageMetrics
};
