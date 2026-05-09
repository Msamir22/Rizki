const mockWrite = jest.fn();
const mockGet = jest.fn();
const mockCreateBudget = jest.fn();
const mockWhere = jest.fn();
const mockAnd = jest.fn();
const mockFindAccessibleCategory = jest.fn();
const mockQueryOwned = jest.fn();
const mockGetCurrentUserDataScope = jest.fn();

interface MockBudgetRecord {
  readonly id: string;
  readonly userId: string;
  readonly type: string;
  categoryId: string;
  readonly period: string;
  readonly update: jest.Mock<
    Promise<void>,
    [(record: MockBudgetRecord) => void]
  >;
}

jest.mock("@monyvi/db", () => ({
  database: {
    write: (...args: unknown[]): Promise<unknown> =>
      mockWrite(...args) as Promise<unknown>,
    get: (tableName: string): unknown => mockGet(tableName),
  },
  Q: {
    where: (...args: unknown[]): unknown => mockWhere(...args),
    and: (...args: unknown[]): unknown => mockAnd(...args),
    notEq: (value: unknown): unknown => ({ operator: "notEq", value }),
  },
}));

jest.mock("@/services/user-data-access", () => ({
  getCurrentUserDataScope: (): Promise<unknown> => {
    const scope = mockGetCurrentUserDataScope() as Promise<unknown>;
    return scope;
  },
}));

import { createBudget, updateBudget } from "@/services/budget-service";

describe("budget-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWrite.mockImplementation(async (callback: () => Promise<unknown>) =>
      callback()
    );
    mockCreateBudget.mockImplementation(
      (builder: (record: Record<string, unknown>) => void) => {
        const budget: Record<string, unknown> = {};
        builder(budget);
        return Promise.resolve(budget);
      }
    );
    mockGet.mockImplementation((tableName: string) => {
      if (tableName === "budgets") {
        return { create: mockCreateBudget };
      }
      return {};
    });
    mockWhere.mockImplementation((column: string, value: unknown) => ({
      column,
      value,
    }));
    mockAnd.mockImplementation((...conditions: readonly unknown[]) => ({
      conditions,
    }));
    mockFindAccessibleCategory.mockResolvedValue({ id: "category-resolved" });
    mockQueryOwned.mockReturnValue({
      fetch: jest.fn(() => Promise.resolve([])),
      fetchCount: jest.fn(() => Promise.resolve(0)),
    });
    mockGetCurrentUserDataScope.mockResolvedValue({
      userId: "user-1",
      findAccessibleCategory: mockFindAccessibleCategory,
      queryOwned: mockQueryOwned,
    });
  });

  it("resolves a category budget category through the current user scope before create", async () => {
    const budget = await createBudget({
      name: "Food",
      type: "CATEGORY",
      categoryId: "category-input",
      amount: 1000,
      period: "MONTHLY",
      alertThreshold: 80,
    });

    expect(mockFindAccessibleCategory).toHaveBeenCalledWith(
      expect.anything(),
      "category-input"
    );
    expect(mockFindAccessibleCategory.mock.invocationCallOrder[0]).toBeLessThan(
      mockQueryOwned.mock.invocationCallOrder[0]
    );
    expect(budget).toMatchObject({
      userId: "user-1",
      type: "CATEGORY",
      categoryId: "category-resolved",
    });
  });

  it("resolves a replacement category through the current user scope before update", async () => {
    const existingBudget: MockBudgetRecord = {
      id: "budget-1",
      userId: "user-1",
      type: "CATEGORY",
      categoryId: "category-old",
      period: "MONTHLY",
      update: jest.fn(
        (builder: (record: MockBudgetRecord) => void): Promise<void> => {
          builder(existingBudget);
          return Promise.resolve();
        }
      ),
    };
    mockQueryOwned
      .mockReturnValueOnce({
        fetch: jest.fn(() => Promise.resolve([existingBudget])),
        fetchCount: jest.fn(() => Promise.resolve(0)),
      })
      .mockReturnValue({
        fetch: jest.fn(() => Promise.resolve([])),
        fetchCount: jest.fn(() => Promise.resolve(0)),
      });

    await updateBudget("budget-1", { categoryId: "category-new" });

    expect(mockFindAccessibleCategory).toHaveBeenCalledWith(
      expect.anything(),
      "category-new"
    );
    expect(existingBudget.update).toHaveBeenCalledTimes(1);
    expect(existingBudget.categoryId).toBe("category-resolved");
  });
});
