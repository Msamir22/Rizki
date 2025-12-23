import { palette } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View, Dimensions } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

interface Props {
  totalEgp: number;
  totalUsd: number;
}
const { width } = Dimensions.get("window");

export function TotalBalanceCard({ totalEgp, totalUsd }: Props) {
  const formatCurrency = (amount: number, currency: string) => {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + (currency ? ` ${currency}` : "")
    );
  };

  // Glow dimensions
  const glowWidth = width; // Full width to allow soft fading at edges
  const glowHeight = 60;

  return (
    <View className="relative items-center justify-center my-2">
      {/* Bottom Glow */}
      <View
        style={{
          position: "absolute",
          bottom: -35, // Positioned to start just under the card
          width: glowWidth,
          height: glowHeight,
          alignItems: "center",
          zIndex: -1,
        }}
      >
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient
              id="card-glow"
              cx="50%"
              cy="0%" // Start from the top of the glow view (bottom of card)
              rx="50%" // Horizontal spread (fades out at edges)
              ry="100%" // Vertical spread
              fx="50%"
              fy="0%"
              gradientUnits="userSpaceOnUse"
            >
              <Stop
                offset="0%"
                stopColor={palette.nileGreen[500]}
                stopOpacity="0.4"
              />
              <Stop
                offset="100%"
                stopColor={palette.nileGreen[500]}
                stopOpacity="0"
              />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#card-glow)" />
        </Svg>
      </View>

      <LinearGradient
        // Gradient from Dark Green (800) to slightly lighter Green (600) for depth
        colors={[palette.nileGreen[800], palette.nileGreen[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full min-h-[180px] items-center rounded-2xl p-6 shadow-lg border border-white/10 overflow-hidden relative"
      >
        {/* Geometric Background Pattern ("Shadow Boxes") */}
        <View className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden rounded-[24px]">
          {/* Large diagonal shape */}
          <View className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/5 rotate-45 transform" />
          {/* Smaller intersecting shapes */}
          <View className="absolute -right-4 bottom-10 w-32 h-32 bg-white/5 rotate-12 transform" />
          <View className="absolute right-20 -bottom-10 w-32 h-32 bg-white/5 -rotate-12 transform" />
        </View>

        <View className="items-center gap-1 z-10">
          {/* Label */}
          <Text className="text-slate-300 text-sm font-medium tracking-wide opacity-90">
            Total Net Worth
          </Text>

          {/* Main Amount (EGP) */}
          <Text className="text-white text-[42px] font-extrabold tracking-tight mt-1">
            EGP {formatCurrency(totalEgp, "")}
          </Text>

          {/* Secondary Amount (USD) */}
          <Text className="text-slate-100 text-base font-medium opacity-80">
            ≈ ${formatCurrency(totalUsd, "USD")}
          </Text>

          {/* Monthly Percentage Change */}
          <View className="flex-row items-center gap-1 mt-2 bg-white/10 px-3 py-1 rounded-full">
            <Ionicons
              name="arrow-up"
              style={{ transform: [{ rotate: "40deg" }] }}
              size={12}
              color={palette.nileGreen[400]}
            />

            {/* TODO : show arrow down dynamically */}
            {/* <Ionicons
              name="arrow-down"
              style={{ transform: [{ rotate: "40deg" }] }}
              size={12}
              color={palette.nileGreen[400]}
            /> */}

            <Text className="text-nileGreen-50 text-xs font-bold">
              +2.5% Month
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
