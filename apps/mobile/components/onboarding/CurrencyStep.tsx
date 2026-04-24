import React, { useCallback, useMemo, useState } from "react";
import {
  BackHandler,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useFirstRunTooltip } from "@/context/FirstRunTooltipContext";
import { useToast } from "@/components/ui/Toast";
import { confirmCurrencyAndOnboard } from "@/services/profile-service";
import { detectCurrencyFromTimezone } from "@/utils/currency-detection";
import { logger } from "@/utils/logger";
import type { CurrencyType } from "@rizqi/db";
import { CurrencyInfo, SUPPORTED_CURRENCIES } from "@rizqi/logic";
import { LanguageSwitcherPill } from "./LanguageSwitcherPill";

const CURRENCY_ITEM_HEIGHT = 80;

interface CurrencyItemProps {
  readonly item: CurrencyInfo;
  readonly isSelected: boolean;
  readonly isSuggested: boolean;
  readonly onSelect: (code: CurrencyType) => void;
  readonly tSuggested: string;
}

function CurrencyItemRow({
  item,
  isSelected,
  isSuggested,
  onSelect,
  tSuggested,
}: CurrencyItemProps): React.ReactElement {
  return (
    <TouchableOpacity
      onPress={(): void => onSelect(item.code)}
      className={`flex-row items-center py-4 px-4 mx-4 rounded-xl mb-2 ${
        isSelected
          ? "border-2 border-nileGreen-500 bg-emerald-500/[0.05] dark:bg-emerald-500/10"
          : "border border-transparent bg-black/[0.03] dark:bg-white/5"
      }`}
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center bg-slate-700/30 me-3">
        <Text className="text-xl">{item.flag}</Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
            {item.name}
          </Text>
          {isSuggested && (
            <View className="px-2 py-0.5 rounded-full bg-nileGreen-500/20">
              <Text className="text-[10px] font-bold text-nileGreen-500">
                {tSuggested}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
          {item.code}
        </Text>
      </View>

      <View
        className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
          isSelected ? "border-nileGreen-500" : "border-slate-500"
        }`}
      >
        {isSelected && (
          <View className="w-3 h-3 rounded-full bg-nileGreen-500" />
        )}
      </View>
    </TouchableOpacity>
  );
}

export function CurrencyStep(): React.ReactElement {
  const router = useRouter();
  const { isDark } = useTheme();
  const { signOut } = useAuth();
  const { markFirstRunPending } = useFirstRunTooltip();
  const { showToast } = useToast();
  const { t } = useTranslation("onboarding");
  const { t: tCommon } = useTranslation("common");

  const [searchQuery, setSearchQuery] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const suggestedCurrency = useMemo(
    (): CurrencyType => detectCurrencyFromTimezone() ?? "EGP",
    []
  );

  const [selectedCode, setSelectedCode] =
    useState<CurrencyType>(suggestedCurrency);

  const sortedCurrencies = useMemo((): readonly CurrencyInfo[] => {
    const suggested = SUPPORTED_CURRENCIES.find(
      (c) => c.code === suggestedCurrency
    );
    if (!suggested) return SUPPORTED_CURRENCIES;
    const rest = SUPPORTED_CURRENCIES.filter(
      (c) => c.code !== suggestedCurrency
    );
    return [suggested, ...rest];
  }, [suggestedCurrency]);

  const filteredCurrencies = useMemo((): readonly CurrencyInfo[] => {
    if (!searchQuery.trim()) return sortedCurrencies;
    const query = searchQuery.toLowerCase().trim();
    return sortedCurrencies.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query)
    );
  }, [searchQuery, sortedCurrencies]);

  const handleConfirm = useCallback(async (): Promise<void> => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      await confirmCurrencyAndOnboard(selectedCode, {
        onTransactionCommitted: () => {
          markFirstRunPending();
        },
      });
      router.replace("/(tabs)");
    } catch (error: unknown) {
      logger.warn(
        "currencyStep.confirm.failed",
        error instanceof Error ? { message: error.message } : undefined
      );
      showToast({
        type: "error",
        title: tCommon("error"),
        message: t("currency_step_error_generic"),
      });
    } finally {
      setIsConfirming(false);
    }
  }, [
    selectedCode,
    isConfirming,
    markFirstRunPending,
    router,
    showToast,
    t,
    tCommon,
  ]);

  const handleSignOut = useCallback((): void => {
    signOut().catch((error: unknown) => {
      logger.warn(
        "currencyStep.signOut.failed",
        error instanceof Error ? { message: error.message } : undefined
      );
    });
  }, [signOut]);

  // Block Android hardware back
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );
      return () => subscription.remove();
    }, [])
  );

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-6 pt-14">
        <LanguageSwitcherPill />
        <TouchableOpacity onPress={handleSignOut} hitSlop={12}>
          <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("currency_step_signout")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View className="px-6 pb-4 mt-4">
        <Text className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          {t("currency_step_title")}
        </Text>
        <Text className="text-sm text-text-secondary dark:text-text-secondary-dark leading-5">
          {t("currency_step_subtitle")}
        </Text>
      </View>

      {/* Search bar */}
      <View className="mx-6 mb-4">
        <View className="flex-row items-center px-4 py-3 rounded-xl bg-black/5 dark:bg-white/[0.08]">
          <Ionicons
            name="search"
            size={18}
            color={isDark ? palette.slate[400] : palette.slate[500]}
          />
          <TextInput
            className="flex-1 ms-2 text-base text-text-primary dark:text-text-primary-dark"
            placeholder={t("search_currency")}
            placeholderTextColor={
              isDark ? palette.slate[500] : palette.slate[400]
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Currency list */}
      <FlatList
        data={filteredCurrencies}
        renderItem={({ item, index }): React.ReactElement => (
          <CurrencyItemRow
            item={item}
            isSelected={item.code === selectedCode}
            isSuggested={
              index === 0 && item.code === suggestedCurrency && !searchQuery
            }
            onSelect={setSelectedCode}
            tSuggested={t("suggested")}
          />
        )}
        keyExtractor={(item): string => item.code}
        getItemLayout={(_, index) => ({
          length: CURRENCY_ITEM_HEIGHT,
          offset: CURRENCY_ITEM_HEIGHT * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      />

      {/* Confirm button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={() => {
            void handleConfirm();
          }}
          disabled={isConfirming}
          className={`rounded-2xl py-[18px] items-center justify-center ${
            isConfirming ? "bg-nileGreen-500/60" : "bg-nileGreen-500"
          }`}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-lg">
            {t("currency_step_confirm")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
