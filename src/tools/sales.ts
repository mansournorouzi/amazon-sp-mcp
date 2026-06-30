import { z } from 'zod';
import { getSPAPIClient } from '../client/sp-api-client.js';
import { getConfig, MARKETPLACE_IDS } from '../config/index.js';
import type { GetOrdersResponse, Order } from '../types/sp-api.js';

// Map marketplace IDs to their default currencies
const MARKETPLACE_CURRENCY: Record<string, string> = {
  [MARKETPLACE_IDS.US]: 'USD',
  [MARKETPLACE_IDS.CA]: 'CAD',
  [MARKETPLACE_IDS.MX]: 'MXN',
  [MARKETPLACE_IDS.BR]: 'BRL',
  [MARKETPLACE_IDS.UK]: 'GBP',
  [MARKETPLACE_IDS.DE]: 'EUR',
  [MARKETPLACE_IDS.FR]: 'EUR',
  [MARKETPLACE_IDS.IT]: 'EUR',
  [MARKETPLACE_IDS.ES]: 'EUR',
  [MARKETPLACE_IDS.NL]: 'EUR',
  [MARKETPLACE_IDS.SE]: 'SEK',
  [MARKETPLACE_IDS.PL]: 'PLN',
  [MARKETPLACE_IDS.BE]: 'EUR',
  [MARKETPLACE_IDS.JP]: 'JPY',
  [MARKETPLACE_IDS.AU]: 'AUD',
  [MARKETPLACE_IDS.SG]: 'SGD',
  [MARKETPLACE_IDS.IN]: 'INR',
  [MARKETPLACE_IDS.AE]: 'AED',
  [MARKETPLACE_IDS.SA]: 'SAR',
  [MARKETPLACE_IDS.EG]: 'EGP',
  [MARKETPLACE_IDS.TR]: 'TRY',
};

// Sales API response types
interface OrderMetrics {
  interval: string;
  unitCount: number;
  orderItemCount: number;
  orderCount: number;
  averageUnitPrice: {
    currencyCode: string;
    amount: number;
  };
  totalSales: {
    currencyCode: string;
    amount: number;
  };
}

interface GetOrderMetricsResponse {
  payload: OrderMetrics[];
}

// Input schemas
const getSalesMetricsSchema = z.object({
  interval: z
    .enum(['Day', 'Week', 'Month', 'Total'])
    .default('Day')
    .describe('Time granularity for the metrics'),
  startDate: z.string().describe('Start date in ISO 8601 format (e.g., 2025-01-01)'),
  endDate: z.string().describe('End date in ISO 8601 format (e.g., 2025-01-31)'),
  asin: z.string().optional().describe('Filter by specific ASIN'),
  sku: z.string().optional().describe('Filter by specific SKU'),
});

const getSalesSummarySchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
});

// Tool definitions
export const salesTools = [
  {
    name: 'get_sales_metrics',
    description:
      'Get aggregated sales metrics from Amazon Sales API. USE THIS for longer date ranges (7+ days, 30 days, etc). IMPORTANT: Data has a 24-48 hour delay, so the last 2 days will NOT have data. For yesterday/today sales, use get_sales_summary instead. Returns total sales, unit count, order count grouped by day/week/month.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        interval: {
          type: 'string',
          enum: ['Day', 'Week', 'Month', 'Total'],
          description: 'Time granularity for the metrics',
          default: 'Day',
        },
        startDate: {
          type: 'string',
          description: 'Start date in ISO 8601 format (e.g., 2025-01-01)',
        },
        endDate: {
          type: 'string',
          description: 'End date in ISO 8601 format (e.g., 2025-01-31)',
        },
        asin: {
          type: 'string',
          description: 'Filter by specific ASIN',
        },
        sku: {
          type: 'string',
          description: 'Filter by specific SKU',
        },
      },
      required: ['startDate', 'endDate'],
    },
    handler: async (params: unknown) => {
      const input = getSalesMetricsSchema.parse(params);
      const client = getSPAPIClient();
      const config = getConfig();

      // Format dates for the API
      const startDateTime = input.startDate.includes('T')
        ? input.startDate
        : `${input.startDate}T00:00:00Z`;
      const endDateTime = input.endDate.includes('T')
        ? input.endDate
        : `${input.endDate}T23:59:59Z`;

      // Build the interval string
      const intervalString = `${startDateTime}--${endDateTime}`;

      const queryParams: Record<string, unknown> = {
        marketplaceIds: config.MARKETPLACE_ID,
        interval: intervalString,
        granularity: input.interval,
      };

      if (input.asin) {
        queryParams.asin = input.asin;
      }
      if (input.sku) {
        queryParams.sku = input.sku;
      }

      const response = await client.get<GetOrderMetricsResponse>(
        '/sales/v1/orderMetrics',
        queryParams,
        { rateLimitCategory: 'sales' }
      );

      const metrics = response.payload || [];

      // Calculate totals
      // NOTE: the Sales API returns totalSales.amount as a STRING. Adding it to a number
      // with `+` performs string concatenation, which makes totals.totalSales a string and
      // breaks the .toFixed() calls below. Coerce each amount to a number before summing.
      const totals = metrics.reduce(
        (acc, m) => ({
          totalUnits: acc.totalUnits + m.unitCount,
          totalOrders: acc.totalOrders + m.orderCount,
          totalSales: acc.totalSales + Number(m.totalSales?.amount ?? 0),
        }),
        { totalUnits: 0, totalOrders: 0, totalSales: 0 }
      );

      const currencyCode = metrics[0]?.totalSales?.currencyCode || 'USD';

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                summary: {
                  dateRange: { start: input.startDate, end: input.endDate },
                  granularity: input.interval,
                  totalUnits: totals.totalUnits,
                  totalOrders: totals.totalOrders,
                  totalSales: {
                    amount: totals.totalSales.toFixed(2),
                    currencyCode,
                  },
                  averageOrderValue:
                    totals.totalOrders > 0
                      ? (totals.totalSales / totals.totalOrders).toFixed(2)
                      : '0.00',
                  averageUnitsPerOrder:
                    totals.totalOrders > 0
                      ? (totals.totalUnits / totals.totalOrders).toFixed(1)
                      : '0.0',
                },
                dataPoints: metrics.length,
                metrics: metrics.map((m) => ({
                  interval: m.interval,
                  unitCount: m.unitCount,
                  orderCount: m.orderCount,
                  orderItemCount: m.orderItemCount,
                  averageUnitPrice: m.averageUnitPrice,
                  totalSales: m.totalSales,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },
  {
    name: 'get_sales_summary',
    description:
      'Get REAL-TIME sales summary calculated from orders data. USE THIS for yesterday/today sales (last 48 hours) since Sales API has a delay. Also useful when you need accurate recent data. Returns total sales, order count, units sold, and daily breakdown.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (e.g., 2025-01-01)',
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (e.g., 2025-01-31)',
        },
      },
      required: ['startDate', 'endDate'],
    },
    handler: async (params: unknown) => {
      const input = getSalesSummarySchema.parse(params);
      const client = getSPAPIClient();
      const config = getConfig();

      // Fetch ALL orders with pagination
      const allOrders: Order[] = [];
      let nextToken: string | undefined;
      const maxPages = 50; // Safety limit (50 pages x 100 = 5000 orders max)
      let page = 0;

      const startDateTime = `${input.startDate}T00:00:00Z`;
      // Orders v0 rejects a CreatedBefore that is not at least 2 minutes in the past, so an end date
      // of today (whose 23:59:59 is in the future) would 400. Clamp it to now minus 2 minutes.
      let endDateTime = `${input.endDate}T23:59:59Z`;
      const maxBefore = new Date(Date.now() - 2 * 60 * 1000);
      if (new Date(endDateTime) > maxBefore) {
        endDateTime = maxBefore.toISOString();
      }

      do {
        const queryParams: Record<string, unknown> = {
          MarketplaceIds: config.MARKETPLACE_ID,
          MaxResultsPerPage: 100,
          CreatedAfter: startDateTime,
          CreatedBefore: endDateTime,
        };

        if (nextToken) queryParams.NextToken = nextToken;

        const response = await client.get<GetOrdersResponse>('/orders/v0/orders', queryParams, {
          rateLimitCategory: 'orders',
        });

        const orders = response.payload.Orders || [];
        allOrders.push(...orders);
        nextToken = response.payload.NextToken;
        page++;
      } while (nextToken && page < maxPages);

      // Filter to completed orders (Shipped) and calculate totals
      const shippedOrders = allOrders.filter(
        (o) => o.OrderStatus === 'Shipped' || o.OrderStatus === 'PartiallyShipped'
      );

      // Calculate totals
      let totalSales = 0;
      let totalUnits = 0;
      const dailySales: Record<string, { sales: number; orders: number; units: number }> = {};

      for (const order of shippedOrders) {
        const amount = parseFloat(order.OrderTotal?.Amount || '0');
        const units = (order.NumberOfItemsShipped || 0) + (order.NumberOfItemsUnshipped || 0);
        totalSales += amount;
        totalUnits += units;

        // Group by day
        const day = order.PurchaseDate.split('T')[0];
        if (!dailySales[day]) {
          dailySales[day] = { sales: 0, orders: 0, units: 0 };
        }
        dailySales[day].sales += amount;
        dailySales[day].orders += 1;
        dailySales[day].units += units;
      }

      const currency = shippedOrders[0]?.OrderTotal?.CurrencyCode || MARKETPLACE_CURRENCY[config.MARKETPLACE_ID] || 'USD';
      const avgOrderValue = shippedOrders.length > 0 ? totalSales / shippedOrders.length : 0;

      // Sort daily data by date
      const dailyBreakdown = Object.entries(dailySales)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          date,
          sales: data.sales.toFixed(2),
          orders: data.orders,
          units: data.units,
        }));

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                summary: {
                  dateRange: { start: input.startDate, end: input.endDate },
                  totalOrders: shippedOrders.length,
                  totalOrdersIncludingCanceled: allOrders.length,
                  totalUnits: totalUnits,
                  totalSales: {
                    amount: totalSales.toFixed(2),
                    currencyCode: currency,
                  },
                  averageOrderValue: avgOrderValue.toFixed(2),
                  pagesFetched: page,
                },
                dailyBreakdown,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },
];
