/**
 * Compact, hand-written description of what the chatbot can query.
 *
 * This is the ONLY database knowledge the planner LLM receives, kept small on
 * purpose to save tokens. The actual SQL is built server-side in query.ts from
 * a whitelist — the model never writes SQL, it only picks a resource + filters.
 */

export type Resource =
  | "events"
  | "sectors"
  | "trainings"
  | "posts"
  | "partners"
  | "links"
  | "none";

export type PlannerResult = {
  resource: Resource;
  filters: {
    keyword?: string;
    sector?: string;
    country?: string;
    date_from?: string; // YYYY-MM-DD
    date_to?: string; // YYYY-MM-DD
    event_type?: string;
    level?: string;
    category?: string;
    upcoming?: boolean;
  };
  limit?: number;
};

/** Short site description used when no DB lookup is needed (resource: none). */
export const SITE_OVERVIEW = `JAZ is an Iraqi platform for organizing events, exhibitions, conferences, and training programs across multiple sectors. The site has pages for: Events, Sectors/Departments, Trainings, Blog/News, Partnerships, and useful Links.`;

/**
 * The schema text injected into the planner system prompt. Keep it terse.
 */
export const PLANNER_SCHEMA = `You can look up data from these resources:

- "events": exhibitions/conferences/local events. Filters: keyword, sector (e.g. health, technology, education, agriculture), country, date_from, date_to, event_type (local|international|virtual), upcoming (true to only future events).
- "sectors": the platform's sectors/departments. Filters: keyword.
- "trainings": training courses. Filters: keyword, level (beginner|intermediate|advanced), upcoming.
- "posts": blog articles and news. Filters: keyword, category.
- "partners": partnership opportunities/categories. Filters: keyword.
- "links": directory of organizations/useful links. Filters: keyword, country.
- "none": greetings, thanks, or general questions about the platform that need no data lookup.`;
