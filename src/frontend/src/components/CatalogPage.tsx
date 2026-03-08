import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Sprout } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateCake, useGetCakes, useIsAdmin } from "../hooks/useQueries";
import { CATEGORIES, SAMPLE_CAKES, SEED_CAKES } from "../utils/sampleCakes";
import { CakeCard } from "./CakeCard";

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isSeeding, setIsSeeding] = useState(false);

  const { data: backendCakes, isLoading } = useGetCakes();
  const { data: isAdmin } = useIsAdmin();
  const createCake = useCreateCake();

  // Use backend cakes if available, fall back to sample data
  const cakes =
    backendCakes && backendCakes.length > 0 ? backendCakes : SAMPLE_CAKES;
  const isEmpty = backendCakes !== undefined && backendCakes.length === 0;

  const filteredCakes = useMemo(() => {
    return cakes.filter((cake) => {
      const matchesSearch =
        search === "" ||
        cake.name.toLowerCase().includes(search.toLowerCase()) ||
        cake.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || cake.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [cakes, search, category]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await Promise.all(
        SEED_CAKES.map((c) =>
          createCake.mutateAsync({
            name: c.name,
            description: c.description,
            price: c.price,
            category: c.category,
            imageUrl: c.imageUrl,
          }),
        ),
      );
      toast.success("Sample cakes added to the menu!", {
        description: "6 cakes have been seeded to your store.",
      });
    } catch {
      toast.error("Failed to seed cakes. Please try again.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden min-h-[420px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-banner.dim_1400x500.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-gold mb-3">
              Artisan Patisserie
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
              Handcrafted with <span className="text-gold italic">love</span>,
              delivered to your door
            </h1>
            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              Premium, artisan cakes made fresh daily. Each creation is a
              masterwork of flavor, texture, and visual artistry.
            </p>
            <a
              href="#catalog"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-heading font-bold text-sm px-6 py-3 rounded-full hover:bg-primary/90 transition-all shadow-gold hover:shadow-gold"
            >
              Explore Our Cakes
            </a>
          </motion.div>
        </div>
      </section>

      {/* Catalog section */}
      <section id="catalog" className="container mx-auto px-4 md:px-6 py-12">
        {/* Admin seed button */}
        {isAdmin && isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-3 p-4 bg-secondary rounded-lg border border-border"
          >
            <Sprout className="h-5 w-5 text-gold flex-shrink-0" />
            <div className="flex-1">
              <p className="font-heading font-semibold text-sm text-foreground">
                Your menu is empty
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Seed sample cakes to populate your store
              </p>
            </div>
            <Button
              data-ocid="admin.seed_button"
              onClick={handleSeed}
              disabled={isSeeding}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold flex-shrink-0"
            >
              {isSeeding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sprout className="h-4 w-4 mr-1" />
              )}
              Seed Sample Cakes
            </Button>
          </motion.div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-ocid="catalog.search_input"
              placeholder="Search cakes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border font-body text-sm h-10 focus-visible:ring-primary"
            />
          </div>

          <Tabs
            value={category}
            onValueChange={setCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-secondary border border-border h-10 p-1 gap-0.5 overflow-x-auto max-w-full">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  data-ocid="catalog.category.tab"
                  className="font-body text-xs font-medium px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md transition-all"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div
            data-ocid="catalog.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {(["c1", "c2", "c3", "c4", "c5", "c6"] as const).map((id) => (
              <div key={id} className="bg-card rounded-xl overflow-hidden">
                <Skeleton className="aspect-square w-full bg-secondary" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-secondary" />
                  <Skeleton className="h-3 w-full bg-secondary" />
                  <Skeleton className="h-3 w-5/6 bg-secondary" />
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton className="h-6 w-16 bg-secondary" />
                    <Skeleton className="h-8 w-24 rounded-full bg-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cake grid */}
        {!isLoading &&
          (filteredCakes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-ocid="catalog.empty_state"
              className="text-center py-20"
            >
              <p className="font-display text-2xl text-muted-foreground mb-2">
                No cakes found
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Try adjusting your search or filter
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={category + search}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredCakes.map((cake, i) => (
                  <CakeCard key={cake.id.toString()} cake={cake} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          ))}
      </section>
    </main>
  );
}
