# mcp-google_ads

Google Ads MCP Pack

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `gads_list_campaigns` | List all campaigns in a Google Ads account. Returns campaign names, IDs, statuses, budgets, and types. |
| `gads_get_campaign` | Get detailed information about a specific Google Ads campaign by ID. Returns name, status, budget, bidding strategy, and settings. |
| `gads_campaign_metrics` | Get performance metrics for campaigns in a Google Ads account. Returns impressions, clicks, cost, conversions, CTR, and CPC for a given date range. |
| `gads_list_ad_groups` | List ad groups for a specific campaign. Returns ad group names, IDs, statuses, and CPC bid. |
| `gads_search` | Execute a custom GAQL (Google Ads Query Language) query. Use this for advanced queries not covered by other tools. See https://developers.google.com/google-ads/api/docs/query/overview for GAQL syntax. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "google_ads": {
      "url": "https://gateway.pipeworx.io/google_ads/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use google_ads
```

## License

MIT
