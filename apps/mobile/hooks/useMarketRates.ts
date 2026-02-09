import { useSync } from "@/providers/SyncProvider";
import { MarketRate } from "@astik/db";
import { Q } from "@nozbe/watermelondb";
import {
  REALTIME_SUBSCRIBE_STATES,
  RealtimeChannel,
} from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { useDatabase } from "../providers/DatabaseProvider";
import { supabase } from "../services/supabase";

interface UseMarketRatesResult {
  latestRates: MarketRate | null;
  previousDayRate: MarketRate | null;
  isLoading: boolean;
  isConnected: boolean;
  lastUpdated: Date | null;
  isStale: boolean;
}

/**
 * Hook to get market rates from local WatermelonDB with realtime updates
 * Single source of truth: WatermelonDB (synced from Supabase)
 */
export function useMarketRates(): UseMarketRatesResult {
  const database = useDatabase();
  const [latestRates, setLatestRates] = useState<MarketRate | null>(null);
  const [previousDayRate, setPreviousDayRate] = useState<MarketRate | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { sync } = useSync();

  // Query latest market rate from local DB
  useEffect(() => {
    const subscription = database
      .get<MarketRate>("market_rates")
      .query(Q.sortBy("created_at", Q.desc), Q.take(1))
      .observe()
      .subscribe((rates) => {
        const latest = rates.at(0) ?? null;
        setLatestRates(latest);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [database]);

  // Query previous day rate (before today)
  useEffect(() => {
    const fetchPreviousDay = async (): Promise<void> => {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const rates = await database
          .get<MarketRate>("market_rates")
          .query(
            Q.where("created_at", Q.lt(todayStart.getTime())),
            Q.sortBy("created_at", Q.desc),
            Q.take(1)
          )
          .fetch();

        setPreviousDayRate(rates.at(0) ?? null);
      } catch (err) {
        console.error("Error fetching previous day rate:", err);
      }
    };

    fetchPreviousDay().catch(console.error);
  }, [database, latestRates]); // Re-fetch when latest rate changes

  // Set up realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel("market-rates-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "market_rates",
        },
        () => {
          sync().catch(console.error);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [database]);

  return {
    latestRates,
    previousDayRate,
    isLoading,
    isConnected,
    lastUpdated: latestRates?.createdAt || null,
    isStale: latestRates?.isStale() ?? false,
  };
}
