/**
 * useNetWorthSummary Hook
 * Local-first net worth calculation using WatermelonDB
 */

import { Account, Asset, AssetMetal, database } from "@astik/db";
import {
  calculateNetWorth,
  calculateTotalAssets,
  calculateTotalBalance,
  NetWorthSummary,
} from "@astik/logic";
import { Q } from "@nozbe/watermelondb";
import { useEffect, useMemo, useState } from "react";
import { useMarketRates } from "./useMarketRates";

interface UseNetWorthSummaryResult {
  summary: NetWorthSummary | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Hook to get user's net worth summary
 */
export function useNetWorthSummary(): UseNetWorthSummaryResult {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assetMetals, setAssetMetals] = useState<AssetMetal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { rates, isLoading: isRatesLoading } = useMarketRates();

  const refresh = (): void => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const accountsCollection = database.get<Account>("accounts");
    const query = accountsCollection.query(Q.where("deleted", false));

    const subscription = query.observe().subscribe({
      next: (result) => setAccounts(result),
      error: (err) => {
        console.error("Error observing accounts:", err);
        setError(err);
      },
    });

    return () => subscription.unsubscribe();
  }, [refreshKey]);

  useEffect(() => {
    const assetMetalsCollection = database.get<AssetMetal>("asset_metals");
    const query = assetMetalsCollection.query(Q.where("deleted", false));

    const subscription = query.observe().subscribe({
      next: (result) => {
        setAssetMetals(result);
        setIsLoading(false);
      },
      error: (err) => {
        console.error("Error observing asset metals:", err);
        setError(err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [refreshKey]);

  // Calculate summary when data changes
  const summary = useMemo<NetWorthSummary | null>(() => {
    if (isLoading || isRatesLoading || !rates) {
      return null;
    }

    // Calculate total accounts in EGP
    const totalAccounts = calculateTotalBalance(accounts, rates);

    // Calculate total assets in EGP
    const totalAssets = calculateTotalAssets(assetMetals, rates);

    return calculateNetWorth(totalAccounts, totalAssets);
  }, [accounts, assetMetals, rates, isLoading, isRatesLoading]);

  return {
    summary,
    isLoading: isLoading || isRatesLoading,
    error,
    refresh,
  };
}

/**
 * Simplified hook that just returns the net worth value
 * Useful for components that only need the total
 */
export function useNetWorth(): {
  netWorth: number;
  isLoading: boolean;
} {
  const { summary, isLoading } = useNetWorthSummary();

  const netWorth = useMemo(() => {
    return summary?.totalNetWorth ?? 0;
  }, [summary]);

  return { netWorth, isLoading };
}
