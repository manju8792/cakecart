import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Cake } from "../backend.d";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils/sampleCakes";

interface CakeCardProps {
  cake: Cake;
  index: number;
}

export function CakeCard({ cake, index }: CakeCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!cake.available) return;
    addItem(cake);
    toast.success(`${cake.name} added to cart!`, {
      description: formatPrice(cake.price),
    });
  };

  return (
    <motion.article
      data-ocid={`cake.item.${index + 1}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 shadow-cake hover:shadow-gold flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        {cake.imageUrl ? (
          <img
            src={cake.imageUrl}
            alt={cake.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-4xl">🎂</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-background/80 backdrop-blur-sm text-foreground border-0 font-body text-xs font-medium"
          >
            {cake.category}
          </Badge>
        </div>

        {/* Unavailable overlay */}
        {!cake.available && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
            <Badge
              variant="secondary"
              className="bg-destructive text-destructive-foreground font-heading font-bold text-sm"
            >
              Currently Unavailable
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg font-semibold text-foreground leading-tight mb-1 group-hover:text-gold transition-colors">
          {cake.name}
        </h3>
        <p className="text-xs text-muted-foreground font-body leading-relaxed line-clamp-2 flex-1">
          {cake.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-display text-xl font-bold text-gold">
            {formatPrice(cake.price)}
          </span>
          <Button
            data-ocid={`cake.add_to_cart_button.${index + 1}`}
            onClick={handleAddToCart}
            disabled={!cake.available}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold text-xs px-3 h-8 rounded-full transition-all hover:shadow-gold-sm disabled:opacity-50"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
