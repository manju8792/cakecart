import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Settings, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../hooks/useCart";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

type Page = "catalog" | "admin" | "checkout" | "confirmation";

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { totalItems, openCart } = useCart();
  const { login, clear, identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  const isLoggedIn = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <motion.button
          onClick={() => onNavigate("catalog")}
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img
            src="/assets/generated/cakecart-logo-transparent.dim_400x120.png"
            alt="CakeCart"
            className="h-10 w-auto object-contain"
          />
        </motion.button>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => onNavigate("catalog")}
            data-ocid="nav.catalog_link"
            className={`font-body text-sm font-medium transition-colors ${
              currentPage === "catalog"
                ? "text-gold bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Our Cakes
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() => onNavigate("admin")}
              data-ocid="nav.admin_link"
              className={`font-body text-sm font-medium transition-colors ${
                currentPage === "admin"
                  ? "text-gold bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="mr-1 h-4 w-4" />
              Admin
            </Button>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <motion.button
            data-ocid="nav.cart_button"
            onClick={openCart}
            className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Cart (${totalItems} items)`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center"
              >
                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                  {totalItems > 9 ? "9+" : totalItems}
                </Badge>
              </motion.span>
            )}
          </motion.button>

          {/* Auth button */}
          {!isInitializing &&
            (isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                data-ocid="nav.logout_button"
                className="text-muted-foreground hover:text-foreground font-body text-sm"
              >
                <LogOut className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                data-ocid="nav.login_button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-body text-sm font-medium"
              >
                <LogIn className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            ))}

          {/* Mobile nav: Our Cakes */}
          <div className="md:hidden flex items-center">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate("admin")}
                data-ocid="nav.admin_link"
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
