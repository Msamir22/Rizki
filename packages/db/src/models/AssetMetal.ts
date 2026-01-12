import { BaseAssetMetal } from "./base/base-asset-metal";

export class AssetMetal extends BaseAssetMetal {
  /**
   * Calculate current value based on live price
   * @param pricePerGram - Live price per gram
   * @returns Current value in the same currency as the price
   */
  calculateValue(pricePerGram: number): number {
    return this.weightGrams * this.purityFraction * pricePerGram;
  }
}
