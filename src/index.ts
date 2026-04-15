interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Google Ads MCP Pack
 *
 * Requires OAuth connection — gateway injects credentials via _context.google_ads.
 * Tools: list campaigns, get campaign, campaign metrics, list ad groups, GAQL search.
 *
 * Note: All tools require a customer_id parameter (Google Ads account ID, digits only).
 * The Google Ads API uses GAQL (Google Ads Query Language) for queries.
 */


interface AdsContext {
  google_ads?: { accessToken: string };
}

const API = 'https://googleads.googleapis.com/v17';

async function gFetch(ctx: AdsContext, url: string, options: RequestInit = {}) {
  if (!ctx.google_ads) {
    return { error: 'connection_required', message: 'Connect your Google account at https://pipeworx.io/account' };
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${ctx.google_ads.accessToken}`,
      'Content-Type': 'application/json',
      'developer-token': 'pipeworx-mcp',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Ads API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function gaqlSearch(ctx: AdsContext, customerId: string, query: string) {
  const cleanId = customerId.replace(/-/g, '');
  return gFetch(ctx, `${API}/customers/${cleanId}/googleAds:searchStream`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

const tools: McpToolExport['tools'] = [
  {
    name: 'gads_list_campaigns',
    description: 'List all campaigns in a Google Ads account. Returns campaign names, IDs, statuses, budgets, and types.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string', description: 'Google Ads customer ID (e.g., "1234567890" or "123-456-7890")' },
        status: { type: 'string', enum: ['ENABLED', 'PAUSED', 'REMOVED'], description: 'Filter by campaign status (optional, returns all if omitted)' },
        limit: { type: 'number', description: 'Maximum number of campaigns to return (default 50)' },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'gads_get_campaign',
    description: 'Get detailed information about a specific Google Ads campaign by ID. Returns name, status, budget, bidding strategy, and settings.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string', description: 'Google Ads customer ID' },
        campaign_id: { type: 'string', description: 'The campaign resource ID' },
      },
      required: ['customer_id', 'campaign_id'],
    },
  },
  {
    name: 'gads_campaign_metrics',
    description: 'Get performance metrics for campaigns in a Google Ads account. Returns impressions, clicks, cost, conversions, CTR, and CPC for a given date range.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string', description: 'Google Ads customer ID' },
        campaign_id: { type: 'string', description: 'Campaign ID to filter (optional, returns all campaigns if omitted)' },
        start_date: { type: 'string', description: 'Start date in YYYY-MM-DD format (e.g., "2024-01-01")' },
        end_date: { type: 'string', description: 'End date in YYYY-MM-DD format (e.g., "2024-01-31")' },
        limit: { type: 'number', description: 'Maximum number of rows to return (default 50)' },
      },
      required: ['customer_id', 'start_date', 'end_date'],
    },
  },
  {
    name: 'gads_list_ad_groups',
    description: 'List ad groups for a specific campaign. Returns ad group names, IDs, statuses, and CPC bid.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string', description: 'Google Ads customer ID' },
        campaign_id: { type: 'string', description: 'Campaign ID to list ad groups for' },
        status: { type: 'string', enum: ['ENABLED', 'PAUSED', 'REMOVED'], description: 'Filter by ad group status (optional)' },
        limit: { type: 'number', description: 'Maximum number of ad groups to return (default 50)' },
      },
      required: ['customer_id', 'campaign_id'],
    },
  },
  {
    name: 'gads_search',
    description: 'Execute a custom GAQL (Google Ads Query Language) query. Use this for advanced queries not covered by other tools. See https://developers.google.com/google-ads/api/docs/query/overview for GAQL syntax.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string', description: 'Google Ads customer ID' },
        query: { type: 'string', description: 'GAQL query string (e.g., "SELECT campaign.name, metrics.clicks FROM campaign WHERE segments.date DURING LAST_7_DAYS")' },
      },
      required: ['customer_id', 'query'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as AdsContext;
  delete args._context;

  switch (name) {
    case 'gads_list_campaigns': {
      const customerId = args.customer_id as string;
      const limit = Math.min(1000, Math.max(1, (args.limit as number) ?? 50));
      let query = `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.bidding_strategy_type, campaign_budget.amount_micros FROM campaign`;
      if (args.status) {
        query += ` WHERE campaign.status = '${args.status}'`;
      }
      query += ` LIMIT ${limit}`;
      return gaqlSearch(context, customerId, query);
    }
    case 'gads_get_campaign': {
      const customerId = args.customer_id as string;
      const campaignId = args.campaign_id as string;
      const query = `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.bidding_strategy_type, campaign.start_date, campaign.end_date, campaign.serving_status, campaign_budget.amount_micros, campaign_budget.delivery_method FROM campaign WHERE campaign.id = ${campaignId}`;
      return gaqlSearch(context, customerId, query);
    }
    case 'gads_campaign_metrics': {
      const customerId = args.customer_id as string;
      const startDate = args.start_date as string;
      const endDate = args.end_date as string;
      const limit = Math.min(1000, Math.max(1, (args.limit as number) ?? 50));
      let query = `SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr, metrics.average_cpc FROM campaign WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'`;
      if (args.campaign_id) {
        query += ` AND campaign.id = ${args.campaign_id}`;
      }
      query += ` LIMIT ${limit}`;
      return gaqlSearch(context, customerId, query);
    }
    case 'gads_list_ad_groups': {
      const customerId = args.customer_id as string;
      const campaignId = args.campaign_id as string;
      const limit = Math.min(1000, Math.max(1, (args.limit as number) ?? 50));
      let query = `SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.type, ad_group.cpc_bid_micros FROM ad_group WHERE campaign.id = ${campaignId}`;
      if (args.status) {
        query += ` AND ad_group.status = '${args.status}'`;
      }
      query += ` LIMIT ${limit}`;
      return gaqlSearch(context, customerId, query);
    }
    case 'gads_search': {
      const customerId = args.customer_id as string;
      const query = args.query as string;
      return gaqlSearch(context, customerId, query);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 15 }, provider: 'google_ads' } satisfies McpToolExport;
