import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Specify migration in with-clause to automatically run migration logic on upgrade
(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type CakeId = Nat;
  type OrderId = Nat;

  type Cake = {
    id : CakeId;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    imageUrl : ?Text;
    available : Bool;
  };

  type OrderItem = {
    cakeId : CakeId;
    quantity : Nat;
  };

  type Order = {
    id : OrderId;
    userId : ?Principal;
    customerName : Text;
    deliveryAddress : Text;
    items : [OrderItem];
    totalPrice : Nat;
    status : Text;
    timestamp : Int;
    deliveryDate : Text;
  };

  public type UserProfile = {
    username : Text;
    address : Text;
  };

  module Cake {
    public func compareByPrice(a : Cake, b : Cake) : Order.Order {
      Nat.compare(a.price, b.price);
    };
  };

  var nextCakeId = 1;
  var nextOrderId = 1;

  let cakes = Map.empty<CakeId, Cake>();
  let orders = Map.empty<OrderId, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCakes() : async [Cake] {
    let availableCakes = cakes.values().toArray().filter(func(cake) { cake.available });
    availableCakes.sort(Cake.compareByPrice);
  };

  public query ({ caller }) func getCakeById(id : CakeId) : async ?Cake {
    cakes.get(id);
  };

  public shared ({ caller }) func createCake(
    name : Text,
    description : Text,
    price : Nat,
    category : Text,
    imageUrl : ?Text,
  ) : async CakeId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Access denied. Admins only");
    };

    let cake : Cake = {
      id = nextCakeId;
      name;
      description;
      price;
      category;
      imageUrl;
      available = true;
    };

    cakes.add(nextCakeId, cake);
    let newCakeId = nextCakeId;
    nextCakeId += 1;
    newCakeId;
  };

  public shared ({ caller }) func updateCake(
    id : CakeId,
    name : Text,
    description : Text,
    price : Nat,
    category : Text,
    imageUrl : ?Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Access denied. Admins only");
    };

    switch (cakes.get(id)) {
      case (null) { Runtime.trap("Cake not found") };
      case (?_existingCake) {
        let updatedCake : Cake = {
          id;
          name;
          description;
          price;
          category;
          imageUrl;
          available = true;
        };
        cakes.add(id, updatedCake);
      };
    };
  };

  public shared ({ caller }) func toggleCakeAvailability(id : CakeId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Access denied. Admins only");
    };

    switch (cakes.get(id)) {
      case (null) { Runtime.trap("Cake not found") };
      case (?cake) {
        let updatedCake : Cake = {
          id = cake.id;
          name = cake.name;
          description = cake.description;
          price = cake.price;
          category = cake.category;
          imageUrl = cake.imageUrl;
          available = not cake.available;
        };
        cakes.add(id, updatedCake);
      };
    };
  };

  public shared ({ caller }) func deleteCake(id : CakeId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Access denied. Admins only");
    };

    if (not cakes.containsKey(id)) {
      Runtime.trap("Cake not found");
    };
    cakes.remove(id);
  };

  public shared ({ caller }) func placeOrder(
    customerName : Text,
    deliveryAddress : Text,
    items : [OrderItem],
    deliveryDate : Text,
  ) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    var totalPrice : Nat = 0;

    for (item in items.values()) {
      switch (cakes.get(item.cakeId)) {
        case (null) { Runtime.trap("Cake not found: " # item.cakeId.toText()) };
        case (?cake) {
          if (not cake.available) {
            Runtime.trap("Cake is not available: " # item.cakeId.toText());
          };
          totalPrice += cake.price * item.quantity;
        };
      };
    };

    let order : Order = {
      id = nextOrderId;
      userId = ?caller;
      customerName;
      deliveryAddress;
      items;
      totalPrice;
      status = "pending";
      timestamp = Time.now();
      deliveryDate;
    };

    orders.add(nextOrderId, order);
    let newOrder = order;
    nextOrderId += 1;
    newOrder;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let allOrders = Array.fromIter(orders.values());
    
    // Admins can see all orders, regular users only see their own
    if (AccessControl.isAdmin(accessControlState, caller)) {
      allOrders;
    } else {
      allOrders.filter(func(order : Order) : Bool {
        switch (order.userId) {
          case (?userId) { userId == caller };
          case (null) { false };
        };
      });
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Access denied. Admins only");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          userId = order.userId;
          customerName = order.customerName;
          deliveryAddress = order.deliveryAddress;
          items = order.items;
          totalPrice = order.totalPrice;
          status;
          timestamp = order.timestamp;
          deliveryDate = order.deliveryDate;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };
};
