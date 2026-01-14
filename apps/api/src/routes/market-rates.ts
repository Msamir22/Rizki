import express from "express";
import { asyncHandler, Errors } from "../lib/errors";
import { getSupabaseClientAdmin } from "../lib/supabase";
import { AuthenticatedRequest } from "../middleware/auth";

const router = express.Router();

// GET /api/rates - Get cached rates
router.get(
  "/",
  asyncHandler<AuthenticatedRequest>(async (_req, res) => {
    const supabase = getSupabaseClientAdmin();
    const { data, error } = await supabase
      .from("market_rates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle() to handle empty table (returns null instead of error)

    if (error) {
      throw Errors.supabaseError(error);
    }

    res.json({
      status: "success",
      data,
    });
  })
);

export default router;
