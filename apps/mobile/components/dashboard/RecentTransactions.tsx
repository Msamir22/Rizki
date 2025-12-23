import { palette } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface Transaction {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  type: "expense" | "income";
  icon: string;
  iconType: "feather" | "fontawesome";
  iconBgClass: string;
  iconColor: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    merchant: "Supermarket",
    date: "Today, 10:30 AM",
    amount: -450.0,
    type: "expense",
    icon: "shopping-cart",
    iconType: "feather",
    iconBgClass: "bg-red-500/15 dark:bg-red-500/20",
    iconColor: palette.red[500],
  },
  {
    id: "2",
    merchant: "Coffee Shop",
    date: "Yesterday, 3:15 PM",
    amount: -120.5,
    type: "expense",
    icon: "coffee",
    iconType: "feather",
    iconBgClass: "bg-orange-500/15 dark:bg-orange-500/20",
    iconColor: palette.orange[500],
  },
  {
    id: "3",
    merchant: "Salary Transfer",
    date: "Yesterday, 9:00 AM",
    amount: 15000.0,
    type: "income",
    icon: "arrow-up",
    iconType: "feather",
    iconBgClass: "bg-nileGreen-500/15 dark:bg-nileGreen-500/20",
    iconColor: palette.nileGreen[500],
  },
];

interface TransactionItemProps {
  tx: Transaction;
  isLast: boolean;
}

function TransactionItem({
  tx,
  isLast,
}: TransactionItemProps): React.JSX.Element {
  const renderIcon = (): React.JSX.Element => {
    if (tx.iconType === "feather") {
      return (
        <Feather
          name={tx.icon as keyof typeof Feather.glyphMap}
          size={18}
          color={tx.iconColor}
        />
      );
    }
    return <FontAwesome5 name={tx.icon} size={14} color={tx.iconColor} />;
  };

  return (
    <View>
      <TouchableOpacity className="flex-row items-center py-3">
        {/* Icon Circle */}
        <View
          className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${tx.iconBgClass}`}
        >
          {renderIcon()}
        </View>

        {/* Text Info */}
        <View className="flex-1 gap-0.5">
          <Text className="text-[15px] font-semibold text-slate-800 dark:text-white">
            {tx.merchant}
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            {tx.date}
          </Text>
        </View>

        {/* Amount */}
        <Text
          className={`text-[15px] font-semibold ${
            tx.type === "income" ? "text-nileGreen-500" : "text-red-500"
          }`}
        >
          {tx.type === "income" ? "+ " : "- "}EGP{" "}
          {Math.abs(tx.amount).toLocaleString()}
        </Text>
      </TouchableOpacity>

      {/* Separator */}
      {!isLast && (
        <View className="ml-[52px] h-[1px] bg-slate-200 dark:bg-white/10" />
      )}
    </View>
  );
}

export function RecentTransactions(): React.JSX.Element {
  const handleSeeAll = (): void => {
    router.push("/(tabs)/transactions");
  };

  return (
    <>
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between px-1">
        <Text className="header-text">Recent Transactions</Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text className="text-sm font-medium text-nileGreen-500">
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <View className="dark:rounded-2xl dark:bg-slate-800 dark:p-4">
        {MOCK_TRANSACTIONS.map((tx, index) => (
          <TransactionItem
            key={tx.id}
            tx={tx}
            isLast={index === MOCK_TRANSACTIONS.length - 1}
          />
        ))}
      </View>
    </>
  );
}
