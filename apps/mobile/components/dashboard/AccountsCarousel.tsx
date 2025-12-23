import { palette } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Svg, { Circle, G } from "react-native-svg";

const { width } = Dimensions.get("window");

interface Account {
  id: string;
  name: string;
  balance: string;
  type: "bank" | "cash" | "gold";
  details?: string;
  color: string;
  gradient: [string, string]; // Top-Left to Bottom-Right
}

const MOCK_ACCOUNTS: Account[] = [
  {
    id: "1",
    name: "CIB Bank",
    balance: "EGP 85,000",
    type: "bank",
    color: palette.blue[500],
    gradient: ["#1E3A8A", "#172554"],
  },
  {
    id: "2",
    name: "Cash Wallet",
    balance: "EGP 12,450",
    type: "cash",
    color: palette.nileGreen[500],
    gradient: [palette.nileGreen[600], palette.nileGreen[800]],
  },
  {
    id: "3",
    name: "Gold Savings",
    balance: "EGP 28,000",
    type: "gold",
    color: palette.gold[600],
    gradient: [palette.gold[400], palette.gold[800]],
  },
];

const ASSET_DATA = [
  { label: "Bank", value: "EGP 85K", percentage: 68, color: palette.blue[500] },
  {
    label: "Cash",
    value: "EGP 12K",
    percentage: 10,
    color: palette.nileGreen[500],
  },
  {
    label: "Metals",
    value: "EGP 28K",
    percentage: 22,
    color: palette.gold[600],
  },
];

interface AccountCardProps {
  item: Account;
  isDark: boolean;
}

function AccountCard({ item, isDark }: AccountCardProps): React.JSX.Element {
  const handlePress = (): void => {
    if (item.type === "gold") {
      router.push("/metals");
    }
  };

  const Content = (): React.JSX.Element => (
    <>
      <View
        className="h-9 w-9 items-center justify-center rounded-xl mb-2"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.15)"
            : `${item.color}20`,
        }}
      >
        <FontAwesome5
          name={
            item.type === "bank"
              ? "university"
              : item.type === "cash"
                ? "wallet"
                : "coins"
          }
          size={20}
          color={isDark ? "#FFF" : item.color}
        />
      </View>
      <View className="gap-0.5">
        <Text className="text-xs font-medium text-slate-600 dark:text-white/70">
          {item.name}
        </Text>
        <Text className="text-lg font-bold text-slate-800 dark:text-white">
          {item.balance}
        </Text>
      </View>
    </>
  );

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      {isDark ? (
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: width / 3 - 10 }}
          className="h-[120px] justify-between rounded-2xl p-3.5 border border-white/10"
        >
          <Content />
        </LinearGradient>
      ) : (
        <View
          style={{ width: width / 3 - 10 }}
          className="h-[120px] justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
        >
          <Content />
        </View>
      )}
    </TouchableOpacity>
  );
}

interface RingChartProps {
  data: (typeof ASSET_DATA)[0];
  isDark: boolean;
}

function RingChart({ data, isDark }: RingChartProps): React.JSX.Element {
  const size = 90;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (data.percentage / 100) * circumference;

  return (
    <View className="items-center gap-1.5">
      <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {data.label}
      </Text>
      <View
        className="items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDark ? `${data.color}30` : `${data.color}20`}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={data.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <View className="absolute items-center">
          <Text className="text-sm font-bold" style={{ color: data.color }}>
            {data.percentage}%
          </Text>
          <Text className="text-[10px] font-semibold text-slate-700 dark:text-white">
            {data.value}
          </Text>
        </View>
      </View>
    </View>
  );
}

function AddButton(): React.JSX.Element {
  const handleAddPress = (): void => {
    router.push("/add-account");
  };

  return (
    <TouchableOpacity
      onPress={handleAddPress}
      activeOpacity={0.7}
      className="button"
    >
      <Feather name="plus" size={14} color="#FFFFFF" />
      <Text className="button-text ml-1">Add</Text>
    </TouchableOpacity>
  );
}

export function AccountsCarousel(): React.JSX.Element {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({ index }: { index: number }): React.JSX.Element => {
    if (index === 0) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ paddingHorizontal: 3, gap: 5 }}
        >
          {MOCK_ACCOUNTS.map((acc) => (
            <AccountCard key={acc.id} item={acc} isDark={isDark} />
          ))}
        </ScrollView>
      );
    }
    return (
      <View className="w-full flex-row justify-around px-4">
        {ASSET_DATA.map((asset, i) => (
          <RingChart key={i} data={asset} isDark={isDark} />
        ))}
      </View>
    );
  };

  return (
    <View className="my-3">
      <View className="mb-3 ml-1 flex-row items-center justify-between">
        <Text className="header-text">Accounts & Assets</Text>
        <AddButton />
      </View>

      <Carousel
        width={width}
        height={120}
        data={[0, 1]}
        renderItem={renderItem}
        onSnapToItem={(index) => setActiveIndex(index)}
        loop={true}
      />

      <View className="mt-2 flex-row justify-center gap-1.5">
        {[0, 1].map((_, i) => (
          <View
            key={i}
            className={`h-1 rounded-full ${i === activeIndex ? "bg-action w-5" : "bg-text-secondary/40 w-2"}`}
          />
        ))}
      </View>
    </View>
  );
}
