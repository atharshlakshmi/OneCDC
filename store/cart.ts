"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShopRef = { id: string; name: string; distanceKm?: number };
export type CartEntry = { shop: ShopRef; itemTags: string[]; selected?: boolean };

type CartState = {
  entries: CartEntry[];
  addShopWithTag: (shop: ShopRef, tag: string) => void;
  removeShop: (shopId: string) => void;
  toggleSelected: (shopId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      entries: [],
      addShopWithTag: (shop, tag) => {
        const entries = get().entries;
        const i = entries.findIndex((e) => e.shop.id === shop.id);
        if (i >= 0) {
          const entry = entries[i];
          const tags = entry.itemTags.includes(tag) ? entry.itemTags : [...entry.itemTags, tag];
          const next = [...entries];
          next[i] = { ...entry, itemTags: tags };
          set({ entries: next });
        } else {
          set({ entries: [...entries, { shop, itemTags: [tag], selected: true }] });
        }
      },
      removeShop: (shopId) => set((s) => ({ entries: s.entries.filter((e) => e.shop.id !== shopId) })),
      toggleSelected: (shopId) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.shop.id === shopId ? { ...e, selected: !e.selected } : e)),
        })),
      clear: () => set({ entries: [] }),
    }),
    { name: "onecdc-cart" }
  )
);
