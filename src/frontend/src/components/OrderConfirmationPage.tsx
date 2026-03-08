import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import type { Order } from "../backend.d";
import { useGetCakes } from "../hooks/useQueries";
import { SAMPLE_CAKES, formatPrice } from "../utils/sampleCakes";

interface OrderConfirmationPageProps {
  order: Order;
  onContinueShopping: () => void;
}

export function OrderConfirmationPage({
  order,
  onContinueShopping,
}: OrderConfirmationPageProps) {
  const { data: backendCakes } = useGetCakes();
  const allCakes =
    backendCakes && backendCakes.length > 0 ? backendCakes : SAMPLE_CAKES;

  const getOrderedCakeName = (cakeId: bigint) => {
    const cake = allCakes.find((c) => c.id === cakeId);
    return cake?.name ?? `Cake #${cakeId.toString()}`;
  };

  const getOrderedCakePrice = (cakeId: bigint) => {
    const cake = allCakes.find((c) => c.id === cakeId);
    return cake?.price ?? BigInt(0);
  };

  const formattedDate = new Date(
    Number(order.timestamp / BigInt(1_000_000)),
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <motion.div
          data-ocid="order_confirm.panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-gold" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Order Confirmed!
            </h1>
            <p className="font-body text-muted-foreground">
              Thank you,{" "}
              <strong className="text-foreground">{order.customerName}</strong>.
              Your cakes are being prepared with love.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border overflow-hidden mb-6"
        >
          {/* Order header */}
          <div className="px-6 py-4 border-b border-border bg-secondary/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Order ID
                </p>
                <p className="font-heading font-bold text-sm text-foreground">
                  #{order.id.toString()}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-gold text-gold font-heading font-semibold capitalize"
              >
                {order.status}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                  Delivery to
                </p>
                <p className="font-body text-foreground text-sm">
                  {order.deliveryAddress}
                </p>
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                  Placed at
                </p>
                <p className="font-body text-foreground text-sm">
                  {formattedDate}
                </p>
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                  Delivery Date
                </p>
                <p className="font-body text-foreground text-sm">
                  {order.deliveryDate
                    ? new Date(order.deliveryDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Items table */}
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider h-8">
                  Cake
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
              {order.items.map((item) => (
                <TableRow
                  key={item.cakeId.toString()}
                  className="border-border"
                >
                  <TableCell className="font-body text-sm text-foreground py-3">
                    {getOrderedCakeName(item.cakeId)}
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground text-center py-3">
                    {item.quantity.toString()}
                  </TableCell>
                  <TableCell className="font-heading font-semibold text-sm text-right py-3 text-gold">
                    {formatPrice(
                      getOrderedCakePrice(item.cakeId) * item.quantity,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="px-6 py-4 border-t border-border">
            <Separator className="mb-3 bg-border" />
            <div className="flex justify-between items-center">
              <span className="font-heading font-bold text-base text-foreground">
                Total
              </span>
              <span className="font-display text-xl font-bold text-gold">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Button
            onClick={onContinueShopping}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-sm px-8 h-12 rounded-full shadow-gold transition-all"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
