import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Cake, Order, OrderItem } from "../backend.d";
import { useActor } from "./useActor";

// ── Cake queries ──────────────────────────────────────────────────────────────

export function useGetCakes() {
  const { actor, isFetching } = useActor();
  return useQuery<Cake[]>({
    queryKey: ["cakes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCakes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Cake mutations ─────────────────────────────────────────────────────────────

export function useCreateCake() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: bigint;
      category: string;
      imageUrl: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCake(
        data.name,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cakes"] });
    },
  });
}

export function useUpdateCake() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      category: string;
      imageUrl: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCake(
        data.id,
        data.name,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cakes"] });
    },
  });
}

export function useDeleteCake() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCake(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cakes"] });
    },
  });
}

export function useToggleCakeAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleCakeAvailability(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cakes"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      customerName: string;
      deliveryAddress: string;
      items: OrderItem[];
      deliveryDate: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(
        data.customerName,
        data.deliveryAddress,
        data.items,
        data.deliveryDate,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(data.orderId, data.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
