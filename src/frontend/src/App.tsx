import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Order } from "./backend.d";
import { AdminDashboard } from "./components/AdminDashboard";
import { CartDrawer } from "./components/CartDrawer";
import { CatalogPage } from "./components/CatalogPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { OrderConfirmationPage } from "./components/OrderConfirmationPage";
import { CartProvider } from "./hooks/useCart";

type Page = "catalog" | "admin" | "checkout" | "confirmation";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("catalog");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrderPlaced = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentPage("confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinueShopping = () => {
    setConfirmedOrder(null);
    setCurrentPage("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />

        <CartDrawer onCheckout={() => handleNavigate("checkout")} />

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {currentPage === "catalog" && (
              <motion.div
                key="catalog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CatalogPage />
              </motion.div>
            )}

            {currentPage === "checkout" && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CheckoutPage
                  onBack={() => handleNavigate("catalog")}
                  onOrderPlaced={handleOrderPlaced}
                />
              </motion.div>
            )}

            {currentPage === "confirmation" && confirmedOrder && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <OrderConfirmationPage
                  order={confirmedOrder}
                  onContinueShopping={handleContinueShopping}
                />
              </motion.div>
            )}

            {currentPage === "admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AdminDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Footer />
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-card border border-border text-foreground font-body text-sm",
            title: "font-heading font-semibold",
            description: "text-muted-foreground text-xs",
            actionButton:
              "bg-primary text-primary-foreground font-heading text-xs",
            cancelButton: "bg-secondary text-foreground font-body text-xs",
          },
        }}
      />
    </CartProvider>
  );
}
