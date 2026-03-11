const GITHUB_REST_BASE_URL = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

class GitHubApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.details = details;
  }
}

function buildHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "github-dashboard"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseErrorResponse(response) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (payload?.message) {
    return payload.message;
  }

  return `${response.status} ${response.statusText}`;
}

async function githubGraphQLRequest(query, variables, token) {
  if (!token) {
    throw new GitHubApiError(
      "Missing GITHUB_TOKEN. GraphQL queries require authentication.",
      401
    );
  }

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    const message = await parseErrorResponse(response);
    throw new GitHubApiError(`GitHub GraphQL error: ${message}`, response.status);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    const firstMessage = payload.errors[0].message || "Unknown GraphQL error";
    throw new GitHubApiError(`GitHub GraphQL error: ${firstMessage}`, 400, payload.errors);
  }

  return payload.data;
}

async function githubRestRequest(path, token) {
  const response = await fetch(`${GITHUB_REST_BASE_URL}${path}`, {
    headers: buildHeaders(token)
  });

  if (!response.ok) {
    const message = await parseErrorResponse(response);
    throw new GitHubApiError(`GitHub REST error: ${message}`, response.status);
  }

  return response.json();
}

module.exports = {
  GitHubApiError,
  githubGraphQLRequest,
  githubRestRequest
};
