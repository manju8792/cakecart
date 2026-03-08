import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Loader2,
  LogIn,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Cake } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCake,
  useDeleteCake,
  useGetCakes,
  useGetOrders,
  useIsAdmin,
  useToggleCakeAvailability,
  useUpdateCake,
  useUpdateOrderStatus,
} from "../hooks/useQueries";
import { ORDER_STATUSES, formatPrice } from "../utils/sampleCakes";

interface CakeFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
}

const EMPTY_FORM: CakeFormData = {
  name: "",
  description: "",
  price: "",
  category: "Classic",
  imageUrl: "",
};

const CATEGORIES = ["Chocolate", "Vanilla", "Classic", "Fruit", "Special"];

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "secondary";
    case "confirmed":
      return "outline";
    case "delivered":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function AdminDashboard() {
  const { login, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: cakes, isLoading: cakesLoading } = useGetCakes();
  const { data: orders, isLoading: ordersLoading } = useGetOrders();

  const createCake = useCreateCake();
  const updateCake = useUpdateCake();
  const deleteCake = useDeleteCake();
  const toggleAvailability = useToggleCakeAvailability();
  const updateOrderStatus = useUpdateOrderStatus();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editCake, setEditCake] = useState<Cake | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cake | null>(null);
  const [formData, setFormData] = useState<CakeFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<CakeFormData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<CakeFormData> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (
      !formData.price.trim() ||
      Number.isNaN(Number.parseFloat(formData.price)) ||
      Number.parseFloat(formData.price) <= 0
    ) {
      errors.price = "Enter a valid price";
    }
    if (!formData.category) errors.category = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setEditCake(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (cake: Cake) => {
    setFormData({
      name: cake.name,
      description: cake.description,
      price: (Number(cake.price) / 100).toFixed(2),
      category: cake.category,
      imageUrl: cake.imageUrl ?? "",
    });
    setFormErrors({});
    setEditCake(cake);
    setIsAddDialogOpen(true);
  };

  const handleSaveCake = async () => {
    if (!validateForm()) return;

    const priceInCents = BigInt(
      Math.round(Number.parseFloat(formData.price) * 100),
    );
    const imageUrl = formData.imageUrl.trim() || null;

    try {
      if (editCake) {
        await updateCake.mutateAsync({
          id: editCake.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: priceInCents,
          category: formData.category,
          imageUrl,
        });
        toast.success("Cake updated successfully!");
      } else {
        await createCake.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: priceInCents,
          category: formData.category,
          imageUrl,
        });
        toast.success("Cake added to the menu!");
      }
      setIsAddDialogOpen(false);
      setFormData(EMPTY_FORM);
      setEditCake(null);
    } catch {
      toast.error("Failed to save cake. Please try again.");
    }
  };

  const handleDeleteCake = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCake.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.name} removed from the menu.`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete cake.");
    }
  };

  const handleToggleAvailability = async (cake: Cake) => {
    try {
      await toggleAvailability.mutateAsync(cake.id);
      toast.success(
        `${cake.name} is now ${cake.available ? "unavailable" : "available"}`,
      );
    } catch {
      toast.error("Failed to toggle availability.");
    }
  };

  const handleOrderStatusChange = async (orderId: bigint, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success("Order status updated!");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  // Loading state
  if (isAdminLoading || isInitializing) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div
          data-ocid="admin.loading_state"
          className="container mx-auto px-4 md:px-6 max-w-5xl"
        >
          <Skeleton className="h-10 w-64 bg-secondary mb-4" />
          <Skeleton className="h-4 w-96 bg-secondary mb-8" />
          <div className="space-y-3">
            <Skeleton className="h-14 bg-secondary rounded-xl" />
            <Skeleton className="h-14 bg-secondary rounded-xl" />
            <Skeleton className="h-14 bg-secondary rounded-xl" />
            <Skeleton className="h-14 bg-secondary rounded-xl" />
            <Skeleton className="h-14 bg-secondary rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  // Not admin — show login prompt
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm px-6"
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-gold" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Admin Access Required
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Please log in with an admin account to access the dashboard.
          </p>
          <Button
            onClick={login}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login to Continue
          </Button>
        </motion.div>
      </main>
    );
  }

  const isMutating =
    createCake.isPending || updateCake.isPending || deleteCake.isPending;

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
            Admin Dashboard
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Manage your cake menu and track orders
          </p>
        </motion.div>

        <Tabs defaultValue="cakes">
          <TabsList className="bg-secondary border border-border h-10 p-1 mb-6 gap-0.5">
            <TabsTrigger
              value="cakes"
              data-ocid="admin.cakes_tab"
              className="font-body text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md"
            >
              Cake Management
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              data-ocid="admin.orders_tab"
              className="font-body text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md"
            >
              Orders
              {orders && orders.length > 0 && (
                <Badge className="ml-1.5 h-4 px-1.5 text-[10px] bg-primary/30 text-primary-foreground font-bold">
                  {orders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Cakes Tab ──────────────────────────────────────────────────── */}
          <TabsContent value="cakes">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg text-foreground">
                {cakes?.length ?? 0} Cakes on Menu
              </h2>
              <Button
                data-ocid="admin.add_cake.open_modal_button"
                onClick={handleOpenAdd}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Cake
              </Button>
            </div>

            {cakesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 bg-secondary rounded-xl" />
                <Skeleton className="h-16 bg-secondary rounded-xl" />
                <Skeleton className="h-16 bg-secondary rounded-xl" />
                <Skeleton className="h-16 bg-secondary rounded-xl" />
              </div>
            ) : !cakes || cakes.length === 0 ? (
              <div
                data-ocid="admin.cakes.empty_state"
                className="text-center py-16 bg-card rounded-xl border border-border"
              >
                <p className="font-display text-lg text-muted-foreground mb-2">
                  No cakes yet
                </p>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Add your first cake to the menu
                </p>
                <Button
                  onClick={handleOpenAdd}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Cake
                </Button>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider w-12 pl-4">
                        Image
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                        Name
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                        Price
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider text-center">
                        Available
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider text-right pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cakes.map((cake, index) => (
                      <TableRow
                        key={cake.id.toString()}
                        data-ocid={`admin.cake.item.${index + 1}`}
                        className="border-border hover:bg-secondary/50 transition-colors"
                      >
                        <TableCell className="pl-4 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            {cake.imageUrl ? (
                              <img
                                src={cake.imageUrl}
                                alt={cake.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-base">
                                🎂
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div>
                            <p className="font-heading font-semibold text-sm text-foreground">
                              {cake.name}
                            </p>
                            <p className="font-body text-xs text-muted-foreground line-clamp-1 hidden md:block max-w-[220px]">
                              {cake.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className="font-body text-xs border-border text-muted-foreground"
                          >
                            {cake.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="font-heading font-bold text-sm text-gold">
                            {formatPrice(cake.price)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-center">
                          <Switch
                            checked={cake.available}
                            onCheckedChange={() =>
                              handleToggleAvailability(cake)
                            }
                            className="data-[state=checked]:bg-primary"
                            aria-label={`Toggle availability for ${cake.name}`}
                          />
                        </TableCell>
                        <TableCell className="py-3 pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              data-ocid={`admin.cake.edit_button.${index + 1}`}
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(cake)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                              aria-label={`Edit ${cake.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              data-ocid={`admin.cake.delete_button.${index + 1}`}
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(cake)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              aria-label={`Delete ${cake.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ── Orders Tab ────────────────────────────────────────────────── */}
          <TabsContent value="orders">
            <h2 className="font-heading font-bold text-lg text-foreground mb-4">
              {orders?.length ?? 0} Orders
            </h2>

            {ordersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 bg-secondary rounded-xl" />
                <Skeleton className="h-16 bg-secondary rounded-xl" />
                <Skeleton className="h-16 bg-secondary rounded-xl" />
              </div>
            ) : !orders || orders.length === 0 ? (
              <div
                data-ocid="admin.orders.empty_state"
                className="text-center py-16 bg-card rounded-xl border border-border"
              >
                <p className="font-display text-lg text-muted-foreground">
                  No orders yet
                </p>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Orders will appear here when customers place them
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider pl-4">
                        Order
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                        Customer
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        Items
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        Delivery Date
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                        Total
                      </TableHead>
                      <TableHead className="font-body text-xs text-muted-foreground uppercase tracking-wider pr-4">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, index) => (
                      <TableRow
                        key={order.id.toString()}
                        data-ocid={`admin.order.item.${index + 1}`}
                        className="border-border hover:bg-secondary/50 transition-colors"
                      >
                        <TableCell className="py-3 pl-4">
                          <div>
                            <p className="font-heading font-semibold text-sm text-foreground">
                              #{order.id.toString()}
                            </p>
                            <p className="font-body text-xs text-muted-foreground hidden sm:block">
                              {new Date(
                                Number(order.timestamp / BigInt(1_000_000)),
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 hidden sm:table-cell">
                          <div>
                            <p className="font-body text-sm text-foreground">
                              {order.customerName}
                            </p>
                            <p className="font-body text-xs text-muted-foreground line-clamp-1 max-w-[160px]">
                              {order.deliveryAddress}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 hidden md:table-cell">
                          <span className="font-body text-sm text-muted-foreground">
                            {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 hidden md:table-cell">
                          <span className="font-body text-sm text-muted-foreground">
                            {order.deliveryDate
                              ? new Date(
                                  order.deliveryDate,
                                ).toLocaleDateString()
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="font-heading font-bold text-sm text-gold">
                            {formatPrice(order.totalPrice)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 pr-4">
                          <Select
                            value={order.status}
                            onValueChange={(val) =>
                              handleOrderStatusChange(order.id, val)
                            }
                          >
                            <SelectTrigger
                              data-ocid={`admin.order.status.select.${index + 1}`}
                              className="h-8 w-36 bg-secondary border-border font-body text-xs focus:ring-primary"
                            >
                              <SelectValue>
                                <Badge
                                  variant={
                                    getStatusColor(order.status) as
                                      | "default"
                                      | "secondary"
                                      | "destructive"
                                      | "outline"
                                  }
                                  className="font-body text-xs capitalize"
                                >
                                  {order.status}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="font-body text-xs capitalize cursor-pointer"
                                >
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ── Add/Edit Cake Dialog ──────────────────────────────────────── */}
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditCake(null);
            }
          }}
        >
          <DialogContent
            data-ocid="admin.add_cake.dialog"
            className="bg-card border-border sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-foreground">
                {editCake ? "Edit Cake" : "Add New Cake"}
              </DialogTitle>
              <DialogDescription className="font-body text-sm text-muted-foreground">
                {editCake
                  ? "Update the cake details below"
                  : "Fill in the details to add a new cake to the menu"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name *
                </Label>
                <Input
                  placeholder="e.g. Chocolate Delight"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="bg-secondary border-border font-body text-sm h-9 focus-visible:ring-primary"
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive font-body">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description *
                </Label>
                <Textarea
                  placeholder="Describe the cake..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  className="bg-secondary border-border font-body text-sm resize-none focus-visible:ring-primary min-h-[70px]"
                />
                {formErrors.description && (
                  <p className="text-xs text-destructive font-body">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price ($) *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 45.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, price: e.target.value }))
                    }
                    className="bg-secondary border-border font-body text-sm h-9 focus-visible:ring-primary"
                  />
                  {formErrors.price && (
                    <p className="text-xs text-destructive font-body">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, category: val }))
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border font-body text-sm h-9 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {CATEGORIES.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="font-body text-sm cursor-pointer"
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Image URL (optional)
                </Label>
                <Input
                  placeholder="/assets/generated/my-cake.jpg"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  className="bg-secondary border-border font-body text-sm h-9 focus-visible:ring-primary"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                data-ocid="admin.add_cake.cancel_button"
                className="border-border font-body text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCake}
                data-ocid="admin.add_cake.save_button"
                disabled={isMutating}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold text-sm"
              >
                {isMutating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Saving...
                  </>
                ) : editCake ? (
                  "Update Cake"
                ) : (
                  "Add Cake"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete confirmation dialog ────────────────────────────────── */}
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-xl text-foreground">
                Delete Cake?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-body text-sm text-muted-foreground">
                Are you sure you want to remove{" "}
                <strong className="text-foreground">
                  {deleteTarget?.name}
                </strong>{" "}
                from the menu? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="admin.delete_cake.cancel_button"
                className="border-border font-body text-sm bg-secondary hover:bg-secondary/80"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="admin.delete_cake.confirm_button"
                onClick={handleDeleteCake}
                disabled={deleteCake.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-heading font-semibold"
              >
                {deleteCake.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
