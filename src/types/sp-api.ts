// SP-API Type Definitions

// Orders API Types
export interface Order {
  AmazonOrderId: string;
  SellerOrderId?: string;
  PurchaseDate: string;
  LastUpdateDate: string;
  OrderStatus: OrderStatus;
  FulfillmentChannel: 'AFN' | 'MFN';
  SalesChannel?: string;
  OrderChannel?: string;
  ShipServiceLevel?: string;
  OrderTotal?: Money;
  NumberOfItemsShipped?: number;
  NumberOfItemsUnshipped?: number;
  PaymentMethod?: string;
  PaymentMethodDetails?: string[];
  MarketplaceId: string;
  ShipmentServiceLevelCategory?: string;
  EasyShipShipmentStatus?: string;
  OrderType?: string;
  EarliestShipDate?: string;
  LatestShipDate?: string;
  EarliestDeliveryDate?: string;
  LatestDeliveryDate?: string;
  IsBusinessOrder?: boolean;
  IsPrime?: boolean;
  IsPremiumOrder?: boolean;
  IsGlobalExpressEnabled?: boolean;
  IsSoldByAB?: boolean;
  IsIBA?: boolean;
  ShippingAddress?: Address;
  BuyerInfo?: BuyerInfo;
}

export type OrderStatus =
  | 'Pending'
  | 'Unshipped'
  | 'PartiallyShipped'
  | 'Shipped'
  | 'Canceled'
  | 'Unfulfillable'
  | 'InvoiceUnconfirmed'
  | 'PendingAvailability';

export interface Money {
  CurrencyCode: string;
  Amount: string;
}

export interface Address {
  Name?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  AddressLine3?: string;
  City?: string;
  County?: string;
  District?: string;
  StateOrRegion?: string;
  PostalCode?: string;
  CountryCode?: string;
  Phone?: string;
  AddressType?: string;
}

export interface BuyerInfo {
  BuyerEmail?: string;
  BuyerName?: string;
  BuyerCounty?: string;
  BuyerTaxInfo?: BuyerTaxInfo;
  PurchaseOrderNumber?: string;
}

export interface BuyerTaxInfo {
  CompanyLegalName?: string;
  TaxingRegion?: string;
  TaxClassifications?: TaxClassification[];
}

export interface TaxClassification {
  Name: string;
  Value: string;
}

export interface OrderItem {
  ASIN: string;
  SellerSKU?: string;
  OrderItemId: string;
  Title?: string;
  QuantityOrdered: number;
  QuantityShipped?: number;
  ProductInfo?: ProductInfo;
  PointsGranted?: PointsGranted;
  ItemPrice?: Money;
  ShippingPrice?: Money;
  ItemTax?: Money;
  ShippingTax?: Money;
  ShippingDiscount?: Money;
  ShippingDiscountTax?: Money;
  PromotionDiscount?: Money;
  PromotionDiscountTax?: Money;
  PromotionIds?: string[];
  CODFee?: Money;
  CODFeeDiscount?: Money;
  IsGift?: boolean;
  ConditionNote?: string;
  ConditionId?: string;
  ConditionSubtypeId?: string;
  ScheduledDeliveryStartDate?: string;
  ScheduledDeliveryEndDate?: string;
  PriceDesignation?: string;
  TaxCollection?: TaxCollection;
  SerialNumberRequired?: boolean;
  IsTransparency?: boolean;
  IossNumber?: string;
  StoreChainStoreId?: string;
  DeemedResellerCategory?: string;
  BuyerInfo?: OrderItemBuyerInfo;
  BuyerRequestedCancel?: BuyerRequestedCancel;
}

export interface ProductInfo {
  NumberOfItems?: number;
}

export interface PointsGranted {
  PointsNumber?: number;
  PointsMonetaryValue?: Money;
}

export interface TaxCollection {
  Model?: string;
  ResponsibleParty?: string;
}

export interface OrderItemBuyerInfo {
  BuyerCustomizedInfo?: BuyerCustomizedInfo;
  GiftWrapPrice?: Money;
  GiftWrapTax?: Money;
  GiftMessageText?: string;
  GiftWrapLevel?: string;
}

export interface BuyerCustomizedInfo {
  CustomizedURL?: string;
}

export interface BuyerRequestedCancel {
  IsBuyerRequestedCancel?: boolean;
  BuyerCancelReason?: string;
}

// Orders API Response Types
export interface GetOrdersResponse {
  payload: {
    Orders: Order[];
    NextToken?: string;
    LastUpdatedBefore?: string;
    CreatedBefore?: string;
  };
}

export interface GetOrderResponse {
  payload: Order;
}

export interface GetOrderItemsResponse {
  payload: {
    OrderItems: OrderItem[];
    NextToken?: string;
    AmazonOrderId: string;
  };
}

// Inventory API Types
export interface InventorySummary {
  asin: string;
  fnSku: string;
  sellerSku: string;
  condition: string;
  inventoryDetails?: InventoryDetails;
  lastUpdatedTime: string;
  productName: string;
  totalQuantity: number;
}

export interface InventoryDetails {
  fulfillableQuantity?: number;
  inboundWorkingQuantity?: number;
  inboundShippedQuantity?: number;
  inboundReceivingQuantity?: number;
  reservedQuantity?: ReservedQuantity;
  researchingQuantity?: ResearchingQuantity;
  unfulfillableQuantity?: UnfulfillableQuantity;
}

export interface ReservedQuantity {
  totalReservedQuantity?: number;
  pendingCustomerOrderQuantity?: number;
  pendingTransshipmentQuantity?: number;
  fcProcessingQuantity?: number;
}

export interface ResearchingQuantity {
  totalResearchingQuantity?: number;
  researchingQuantityBreakdown?: ResearchingQuantityEntry[];
}

export interface ResearchingQuantityEntry {
  name: string;
  quantity: number;
}

export interface UnfulfillableQuantity {
  totalUnfulfillableQuantity?: number;
  customerDamagedQuantity?: number;
  warehouseDamagedQuantity?: number;
  distributorDamagedQuantity?: number;
  carrierDamagedQuantity?: number;
  defectiveQuantity?: number;
  expiredQuantity?: number;
}

export interface GetInventorySummariesResponse {
  payload: {
    granularity: {
      granularityType: string;
      granularityId: string;
    };
    inventorySummaries: InventorySummary[];
  };
  pagination?: {
    nextToken?: string;
  };
}

// Reports API Types
export type ReportProcessingStatus =
  | 'CANCELLED'
  | 'DONE'
  | 'FATAL'
  | 'IN_PROGRESS'
  | 'IN_QUEUE';

export interface Report {
  reportId: string;
  reportType: string;
  dataStartTime?: string;
  dataEndTime?: string;
  createdTime: string;
  processingStatus: ReportProcessingStatus;
  processingStartTime?: string;
  processingEndTime?: string;
  reportDocumentId?: string;
  marketplaceIds?: string[];
}

export interface CreateReportResponse {
  reportId: string;
}

export interface GetReportsResponse {
  reports: Report[];
  nextToken?: string;
}

export interface GetReportResponse {
  reportId: string;
  reportType: string;
  dataStartTime?: string;
  dataEndTime?: string;
  createdTime: string;
  processingStatus: ReportProcessingStatus;
  processingStartTime?: string;
  processingEndTime?: string;
  reportDocumentId?: string;
  marketplaceIds?: string[];
}

export interface ReportDocument {
  reportDocumentId: string;
  url: string;
  compressionAlgorithm?: 'GZIP';
}

export interface GetReportDocumentResponse {
  reportDocumentId: string;
  url: string;
  compressionAlgorithm?: 'GZIP';
}

// Sales API Types
export interface SalesMetrics {
  date: string;
  unitCount: number;
  orderItemCount: number;
  orderCount: number;
  averageUnitPrice: Money;
  totalSales: Money;
}

export interface GetSalesMetricsResponse {
  payload: SalesMetrics[];
}

// Report Type Constants
export const REPORT_TYPES = {
  // FBA Reports
  FBA_REIMBURSEMENTS: 'GET_FBA_REIMBURSEMENTS_DATA',
  FBA_FEE_ESTIMATES: 'GET_FBA_ESTIMATED_FBA_FEES_TXT_DATA',
  FBA_STORAGE_FEES: 'GET_FBA_STORAGE_FEE_CHARGES_DATA',
  FBA_LONGTERM_STORAGE_FEES: 'GET_FBA_FULFILLMENT_LONGTERM_STORAGE_FEE_CHARGES_DATA',
  FBA_INVENTORY_PLANNING: 'GET_FBA_INVENTORY_PLANNING_DATA',
  FBA_INVENTORY_LEDGER_SUMMARY: 'GET_LEDGER_SUMMARY_VIEW_DATA',
  FBA_INVENTORY_LEDGER_DETAIL: 'GET_LEDGER_DETAIL_VIEW_DATA',
  FBA_RETURNS: 'GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA',

  // Settlement Reports
  SETTLEMENT_FLAT_FILE: 'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
  SETTLEMENT_FLAT_FILE_V2: 'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_V2',
  SETTLEMENT_XML: 'GET_V2_SETTLEMENT_REPORT_DATA_XML',

  // Sales & Traffic Reports
  SALES_TRAFFIC: 'GET_SALES_AND_TRAFFIC_REPORT',

  // Brand Analytics Reports
  BRAND_ANALYTICS_SEARCH_TERMS: 'GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT',
  BRAND_ANALYTICS_MARKET_BASKET: 'GET_BRAND_ANALYTICS_MARKET_BASKET_REPORT',
  BRAND_ANALYTICS_REPEAT_PURCHASE: 'GET_BRAND_ANALYTICS_REPEAT_PURCHASE_REPORT',

  // Order Reports
  FLAT_FILE_ALL_ORDERS: 'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL',
  FLAT_FILE_RETURNS: 'GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE',
} as const;

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

// Catalog API Types (2022-04-01)
export interface CatalogItemSummary {
  marketplaceId: string;
  itemName?: string;
  brand?: string;
  manufacturer?: string;
  classificationType?: string;
  classificationDisplayName?: string;
  color?: string;
  size?: string;
  modelNumber?: string;
  packageQuantity?: number;
  bulletPoints?: string[];
  style?: string;
  websiteDisplayGroup?: string;
  websiteDisplayGroupName?: string;
}

export interface CatalogItemSalesRank {
  marketplaceId: string;
  classificationId?: string;
  title?: string;
  displayGroupRanks?: Array<{
    websiteDisplayGroup?: string;
    title?: string;
    rank?: number;
    link?: string;
  }>;
}

export interface CatalogItemImage {
  marketplaceId: string;
  images?: Array<{
    variant?: string;
    link?: string;
    width?: number;
    height?: number;
  }>;
}

export interface CatalogItem {
  asin: string;
  summaries?: CatalogItemSummary[];
  attributes?: Record<string, unknown>;
  salesRanks?: CatalogItemSalesRank[];
  images?: CatalogItemImage[];
  dimensions?: Record<string, unknown>[];
  identifiers?: Record<string, unknown>[];
  relationships?: Record<string, unknown>[];
  productTypes?: Array<{ marketplaceId: string; productType: string }>;
}

export type GetCatalogItemResponse = CatalogItem;

export interface SearchCatalogItemsResponse {
  numberOfResults?: number;
  pagination?: {
    nextToken?: string;
    previousToken?: string;
  };
  refinements?: Record<string, unknown>;
  items?: CatalogItem[];
}

// Finances API Types
export interface FinancialEventGroup {
  FinancialEventGroupId?: string;
  ProcessingStatus?: string;
  FundTransferStatus?: string;
  OriginalTotal?: Money;
  ConvertedTotal?: Money;
  FundTransferDate?: string;
  TraceId?: string;
  AccountTail?: string;
  BeginningBalance?: Money;
  FinancialEventGroupStart?: string;
  FinancialEventGroupEnd?: string;
}

export interface GetFinancialEventsResponse {
  payload?: {
    FinancialEvents: Record<string, unknown>;
    NextToken?: string;
  };
}

export interface GetFinancialEventGroupsResponse {
  payload?: {
    FinancialEventGroupList: FinancialEventGroup[];
    NextToken?: string;
  };
}
