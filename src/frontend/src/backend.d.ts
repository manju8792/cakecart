import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cake {
    id: CakeId;
    name: string;
    description: string;
    available: boolean;
    imageUrl?: string;
    category: string;
    price: bigint;
}
export type CakeId = bigint;
export interface OrderItem {
    quantity: bigint;
    cakeId: CakeId;
}
export interface Order {
    id: OrderId;
    customerName: string;
    status: string;
    deliveryAddress: string;
    userId?: Principal;
    deliveryDate: string;
    timestamp: bigint;
    items: Array<OrderItem>;
    totalPrice: bigint;
}
export interface UserProfile {
    username: string;
    address: string;
}
export type OrderId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCake(name: string, description: string, price: bigint, category: string, imageUrl: string | null): Promise<CakeId>;
    deleteCake(id: CakeId): Promise<void>;
    getCakeById(id: CakeId): Promise<Cake | null>;
    getCakes(): Promise<Array<Cake>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, deliveryAddress: string, items: Array<OrderItem>, deliveryDate: string): Promise<Order>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleCakeAvailability(id: CakeId): Promise<void>;
    updateCake(id: CakeId, name: string, description: string, price: bigint, category: string, imageUrl: string | null): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: string): Promise<void>;
}
