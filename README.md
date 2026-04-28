[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/mansournorouzi-amazon-sp-mcp-badge.png)](https://mseep.ai/app/mansournorouzi-amazon-sp-mcp)

# Amazon SP-API MCP Server

A Model Context Protocol (MCP) server that connects Claude to Amazon Seller Central via the SP-API. Enables natural language queries for sales data, inventory, reports, fees, reimbursements, and analytics.

> **Security Notice (March 31, 2026):** The `axios` npm package was briefly compromised in a supply chain attack. Malicious versions `1.14.1` and `0.30.4` were published between 00:21 and 03:15 UTC on March 31 before npm removed them. These versions contained a trojanized dependency (`plain-crypto-js`) that installed a remote access trojan. **This repo's axios dependency has been pinned to `1.14.0` (the last clean version).** If you ran `npm install` during the attack window, delete your `node_modules` folder and reinstall. See: [Snyk advisory](https://snyk.io/blog/axios-npm-package-compromised-supply-chain-attack-delivers-cross-platform/), [Datadog analysis](https://securitylabs.datadoghq.com/articles/axios-npm-supply-chain-compromise/).

## Key Feature: No AWS Credentials Required

As of October 2023, Amazon SP-API no longer requires AWS IAM credentials. This server uses **LWA (Login with Amazon) OAuth 2.0 only**, making setup simpler and more secure.

## Features

### Core Operations
- **Orders**: Get orders, order details, and order items
- **Inventory**: FBA inventory summary and detailed health metrics
- **Sales**: Sales metrics by day/week/month with totals and averages

### Financial Reports
- **Reimbursements**: FBA reimbursements for lost/damaged inventory
- **Settlements**: Payment disbursement details and breakdowns
- **Fee Estimates**: Per-SKU FBA fee estimates
- **Storage Fees**: Monthly storage charges
- **Long-term Storage Fees**: LTSF for aged inventory

### Analytics
- **Sales & Traffic**: Sessions, page views, conversion rates, buy box %
- **Search Terms**: Brand Analytics search term performance (requires Brand Registry)
- **Inventory Ledger**: Track inventory movements and adjustments

## Prerequisites

- Node.js 18+
- Amazon Seller Central account
- SP-API application registered in Developer Central
- LWA credentials (Client ID, Client Secret, Refresh Token)

## Installation

```bash
git clone https://github.com/mansournorouzi/amazon-sp-mcp.git
cd amazon-sp-mcp
npm install
npm run build
```

## Configuration

Create a `.env` file with your credentials:

```bash
# Copy the example
cp .env.example .env
```

Required environment variables:

```bash
# Login with Amazon (LWA) OAuth 2.0 Credentials
LWA_CLIENT_ID=amzn1.application-oa2-client.xxxxx
LWA_CLIENT_SECRET=your_lwa_client_secret
LWA_REFRESH_TOKEN=Atzr|your_refresh_token

# Seller Information
SELLER_ID=your_seller_id
MARKETPLACE_ID=ATVPDKIKX0DER

# SP-API Endpoint (optional, defaults to North America)
SP_API_ENDPOINT=https://sellingpartnerapi-na.amazon.com
```

### Marketplace IDs

| Region | Marketplace | ID |
|--------|------------|-----|
| US | Amazon.com | ATVPDKIKX0DER |
| CA | Amazon.ca | A2EUQ1WTGCTBG2 |
| MX | Amazon.com.mx | A1AM78C64UM0Y8 |
| UK | Amazon.co.uk | A1F83G8C2ARO7P |
| DE | Amazon.de | A1PA6795UKMFR9 |
| JP | Amazon.co.jp | A1VC38T7YXB528 |

### SP-API Endpoints

| Region | Endpoint |
|--------|----------|
| North America | https://sellingpartnerapi-na.amazon.com |
| Europe | https://sellingpartnerapi-eu.amazon.com |
| Far East | https://sellingpartnerapi-fe.amazon.com |

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "amazon-seller": {
      "command": "node",
      "args": ["/path/to/amazon-sp-mcp/build/index.js"],
      "env": {
        "LWA_CLIENT_ID": "amzn1.application-oa2-client.xxxxx",
        "LWA_CLIENT_SECRET": "your_secret",
        "LWA_REFRESH_TOKEN": "Atzr|your_token",
        "SELLER_ID": "your_seller_id",
        "MARKETPLACE_ID": "ATVPDKIKX0DER",
        "SP_API_ENDPOINT": "https://sellingpartnerapi-na.amazon.com"
      }
    }
  }
}
```

Restart Claude Desktop after making changes.

## Usage with Claude Code

Add `.mcp.json` to your project root:

```json
{
  "mcpServers": {
    "amazon-seller": {
      "command": "node",
      "args": ["./build/index.js"],
      "env": {
        "LWA_CLIENT_ID": "${LWA_CLIENT_ID}",
        "LWA_CLIENT_SECRET": "${LWA_CLIENT_SECRET}",
        "LWA_REFRESH_TOKEN": "${LWA_REFRESH_TOKEN}",
        "SELLER_ID": "${SELLER_ID}",
        "MARKETPLACE_ID": "${MARKETPLACE_ID}",
        "SP_API_ENDPOINT": "${SP_API_ENDPOINT}"
      }
    }
  }
}
```

## Available Tools

### Orders
| Tool | Description |
|------|-------------|
| `get_orders` | List orders by date range, status, fulfillment channel |
| `get_order_details` | Get details for a specific order |
| `get_order_items` | Get line items for an order |

### Inventory
| Tool | Description |
|------|-------------|
| `get_inventory_summary` | FBA inventory levels and health |
| `get_fba_inventory_details` | Detailed breakdown of reserved/unfulfillable quantities |

### Sales
| Tool | Description |
|------|-------------|
| `get_sales_metrics` | Sales aggregates by day/week/month |

### Financial Reports
| Tool | Description |
|------|-------------|
| `get_fba_reimbursements` | Lost/damaged inventory reimbursements |
| `get_settlement_report` | Payment disbursement details |
| `get_fba_fee_estimates` | Per-SKU fee breakdown |
| `get_storage_fees` | Monthly storage charges |
| `get_longterm_storage_fees` | LTSF for aged inventory (365+ days) |

### Analytics
| Tool | Description |
|------|-------------|
| `get_sales_traffic_report` | Sessions, page views, conversion rates |
| `get_search_terms_report` | Brand Analytics search terms (Brand Registry required) |
| `get_inventory_ledger` | Inventory movement summary |

## Example Queries

Once configured, you can ask Claude questions like:

- "What were my sales last week?"
- "Show me my FBA reimbursements for January"
- "What's my current inventory health?"
- "Pull my settlement report for the last payment"
- "What are my storage fees by SKU?"
- "Which products have the best conversion rate?"
- "Show me my long-term storage fees"

## Development

```bash
# Build
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format
npm run format
```

## Architecture

```
src/
├── index.ts                    # MCP server entry point
├── config/
│   └── index.ts                # Configuration & validation
├── auth/
│   └── token-manager.ts        # LWA OAuth 2.0 token management
├── client/
│   ├── sp-api-client.ts        # HTTP client (no AWS signing!)
│   └── rate-limiter.ts         # SP-API rate limiting
├── tools/
│   ├── index.ts                # Tool registry
│   ├── orders.ts               # Orders API tools
│   ├── inventory.ts            # Inventory API tools
│   ├── sales.ts                # Sales API tools
│   └── reports/
│       ├── reimbursements.ts   # FBA reimbursements
│       ├── settlements.ts      # Settlement reports
│       ├── fees.ts             # Fee reports
│       └── analytics.ts        # Brand analytics
├── types/
│   └── sp-api.ts               # TypeScript definitions
└── utils/
    ├── csv-parser.ts           # Report CSV parsing
    └── report-poller.ts        # Async report polling
```

## License

MIT

## Resources

- [Amazon SP-API Documentation](https://developer-docs.amazon.com/sp-api/)
- [SP-API Report Types](https://developer-docs.amazon.com/sp-api/docs/report-type-values)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [SP-API No Longer Requires AWS Credentials](https://developer-docs.amazon.com/sp-api/changelog/sp-api-will-no-longer-require-aws-iam-or-aws-signature-version-4)
