# CakeCart

## Current State

CakeCart is a full-stack cake delivery app with:
- A catalog page displaying available cakes
- A shopping cart drawer
- A checkout page collecting customer name and delivery address
- An order confirmation page
- An admin dashboard for cake management and order status tracking

The `Order` type currently stores: id, customerName, deliveryAddress, items, totalPrice, status, timestamp.

The `placeOrder` backend function accepts: customerName, deliveryAddress, items.

## Requested Changes (Diff)

### Add
- `deliveryDate` field (Text) to the `Order` type in the backend, storing the requested delivery date/time as an ISO string
- A delivery date/time picker on the checkout page (date input, minimum tomorrow, required field)
- Display of the scheduled delivery date on the order confirmation page
- Display of the delivery date column in the admin Orders table

### Modify
- `placeOrder` backend function to accept a `deliveryDate : Text` parameter and store it on the order
- `updateOrderStatus` backend function's Order construction to preserve the new `deliveryDate` field
- CheckoutPage: add deliveryDate state, validation, and pass it to placeOrder call
- OrderConfirmationPage: show "Delivery Scheduled For" with the deliveryDate
- AdminDashboard Orders table: add a Delivery Date column

### Remove
- Nothing removed

## Implementation Plan

1. **Backend (main.mo)**
   - Add `deliveryDate : Text` to the `Order` type
   - Add `deliveryDate` parameter to `placeOrder` function; store on order
   - Preserve `deliveryDate` in `updateOrderStatus` when constructing updatedOrder

2. **backend.d.ts**
   - Add `deliveryDate: string` to `Order` interface
   - Update `placeOrder` signature to include `deliveryDate: string`

3. **CheckoutPage.tsx**
   - Add `deliveryDate` state and `deliveryDateError` state
   - Add a date input field (min = tomorrow) in the Delivery Details section
   - Validate that deliveryDate is selected
   - Pass deliveryDate to `placeOrder.mutateAsync`

4. **OrderConfirmationPage.tsx**
   - Add a "Delivery Scheduled For" row in the order header, displaying `order.deliveryDate`

5. **AdminDashboard.tsx**
   - Add a "Delivery Date" column in the Orders table showing `order.deliveryDate`
