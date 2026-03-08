import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend.d";
import { useCart } from "../hooks/useCart";
import { usePlaceOrder } from "../hooks/useQueries";
import { formatPrice } from "../utils/sampleCakes";

interface CheckoutPageProps {
  onBack: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function CheckoutPage({ onBack, onOrderPlaced }: CheckoutPageProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [deliveryDateError, setDeliveryDateError] = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const placeOrder = usePlaceOrder();

  const validate = () => {
    let valid = true;
    if (!customerName.trim()) {
      setNameError("Please enter your name");
      valid = false;
    } else {
      setNameError("");
    }
    if (!deliveryAddress.trim()) {
      setAddressError("Please enter your delivery address");
      valid = false;
    } else {
      setAddressError("");
    }
    if (!deliveryDate) {
      setDeliveryDateError("Please select a delivery date");
      valid = false;
    } else {
      setDeliveryDateError("");
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    try {
      const orderItems = items.map((item) => ({
        cakeId: item.cake.id,
        quantity: BigInt(item.quantity),
      }));

      const order = await placeOrder.mutateAsync({
        customerName: customerName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items: orderItems,
        deliveryDate,
      });

      clearCart();
      toast.success("Order placed successfully!");
      onOrderPlaced(order);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-muted-foreground hover:text-foreground font-body text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to shop
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Checkout
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-8">
            Complete your order details below
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-heading font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-gold" />
                  Delivery Details
                </h2>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="customerName"
                      className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Your Name
                    </Label>
                    <Input
                      id="customerName"
                      data-ocid="checkout.name_input"
                      placeholder="Enter your full name"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (e.target.value.trim()) setNameError("");
                      }}
                      className="bg-secondary border-border font-body text-sm h-10 focus-visible:ring-primary"
                      autoComplete="name"
                    />
                    {nameError && (
                      <p className="text-xs text-destructive font-body">
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="deliveryAddress"
                      className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Delivery Address
                    </Label>
                    <Textarea
                      id="deliveryAddress"
                      data-ocid="checkout.address_input"
                      placeholder="Enter your full delivery address"
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (e.target.value.trim()) setAddressError("");
                      }}
                      className="bg-secondary border-border font-body text-sm resize-none focus-visible:ring-primary min-h-[80px]"
                      autoComplete="street-address"
                    />
                    {addressError && (
                      <p className="text-xs text-destructive font-body">
                        {addressError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="deliveryDate"
                      className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Delivery Date
                    </Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      data-ocid="checkout.delivery_date_input"
                      min={tomorrowStr}
                      value={deliveryDate}
                      onChange={(e) => {
                        setDeliveryDate(e.target.value);
                        if (e.target.value) setDeliveryDateError("");
                      }}
                      className="bg-secondary border-border font-body text-sm h-10 focus-visible:ring-primary"
                    />
                    {deliveryDateError && (
                      <p className="text-xs text-destructive font-body">
                        {deliveryDateError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-heading font-bold text-base text-foreground">
                    Order Summary
                  </h2>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider h-8">
                        Item
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider h-8 text-center">
                        Qty
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider h-8 text-right">
                        Price
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.cake.id.toString()}
                        className="border-border"
                      >
                        <TableCell className="font-body text-sm text-foreground py-3 max-w-[140px]">
                          <span className="block truncate">
                            {item.cake.name}
                          </span>
                        </TableCell>
                        <TableCell className="font-body text-sm text-muted-foreground text-center py-3">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="font-heading font-semibold text-sm text-right py-3 text-gold">
                          {formatPrice(item.cake.price * BigInt(item.quantity))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="px-6 py-4 border-t border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="font-body text-sm">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">
                      Delivery
                    </span>
                    <span className="font-body text-sm text-muted-foreground">
                      Free
                    </span>
                  </div>
                  <Separator className="my-2 bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="font-heading font-bold text-base text-foreground">
                      Total
                    </span>
                    <span className="font-display text-xl font-bold text-gold">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                data-ocid="checkout.submit_button"
                disabled={placeOrder.isPending || items.length === 0}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-sm h-12 rounded-lg shadow-gold transition-all"
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </main>
  );
}
