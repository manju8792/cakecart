import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils/sampleCakes";

interface CartDrawerProps {
  onCheckout: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] flex flex-col p-0 bg-card border-l border-border"
        data-ocid="cart.panel"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="font-display text-xl text-foreground flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            Your Cart
            {items.length > 0 && (
              <span className="ml-1 text-sm font-body font-normal text-muted-foreground">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-foreground">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-body">
                Add some delicious cakes to get started
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.cake.id.toString()}
                    data-ocid={`cart.item.${index + 1}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {item.cake.imageUrl ? (
                        <img
                          src={item.cake.imageUrl}
                          alt={item.cake.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-sm text-foreground truncate">
                        {item.cake.name}
                      </h4>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">
                        {formatPrice(item.cake.price)} each
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.cake.id, item.quantity - 1)
                          }
                          className="h-6 w-6 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-body text-sm w-4 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.cake.id, item.quantity + 1)
                          }
                          className="h-6 w-6 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="font-heading font-bold text-sm text-gold">
                        {formatPrice(item.cake.price * BigInt(item.quantity))}
                      </span>
                      <button
                        type="button"
                        data-ocid={`cart.delete_button.${index + 1}`}
                        onClick={() => removeItem(item.cake.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${item.cake.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}

        {items.length > 0 && (
          <SheetFooter className="px-6 pt-4 pb-6 border-t border-border flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-muted-foreground">Subtotal</span>
              <span className="font-display text-xl font-bold text-gold">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              Delivery fee calculated at checkout
            </p>
            <Separator className="bg-border" />
            <Button
              data-ocid="cart.checkout_button"
              onClick={() => {
                closeCart();
                onCheckout();
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-sm h-12 rounded-lg shadow-gold transition-all"
            >
              Proceed to Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
