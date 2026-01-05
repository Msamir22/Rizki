import { BaseAssetMetal } from "./base/base-asset-metal";

export class AssetMetal extends BaseAssetMetal {
  /**
   * Calculate current value based on live gold price
   * @param goldPricePerGram - Live gold price per gram (for 24K)
   * @returns Current value in the same currency as the price
   */
  calculateValue(goldPricePerGram: number): number {
    return this.weightGrams * (this.purityKarat / 24) * goldPricePerGram;
  }
}
