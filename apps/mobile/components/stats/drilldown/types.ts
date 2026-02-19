/**
 * Shared types and constants for the Category Drilldown components.
 */

import type { CurrencyType } from "@astik/db";
import { palette } from "@/constants/colors";

// =============================================================================
// Constants
// =============================================================================

/**
 * Default display currency for aggregated stats.
 *
 * TODO: Replace with multi-currency aggregation once market rate conversion
 * is integrated into the stats flow. Currently all amounts are displayed
 * in the primary currency without conversion.
 */
export const DEFAULT_DISPLAY_CURRENCY: CurrencyType = "EGP";

/** Rotating palette for chart segments and category indicators. */
export const CHART_COLORS: readonly string[] = [
  palette.nileGreen[500],
  palette.blue[500],
  palette.orange[500],
  palette.violet[500],
  palette.gold[400],
  palette.red[400],
  palette.nileGreen[600],
  palette.blue[600],
];

// =============================================================================
// Types
// =============================================================================

/** Aggregated category data for a single drilldown level. */
export interface CategoryData {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly amount: number;
  readonly percentage: number;
  readonly color: string;
  readonly level: number;
  readonly parentId: string | null;
  readonly childrenIds: string[];
}

/** Navigation breadcrumb entry for hierarchy traversal. */
export interface BreadcrumbItem {
  readonly id: string | null;
  readonly name: string;
  readonly level: number;
}
