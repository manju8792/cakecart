import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
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

  type OldOrder = {
    id : OrderId;
    customerName : Text;
    deliveryAddress : Text;
    items : [OrderItem];
    totalPrice : Nat;
    status : Text;
    timestamp : Int;
  };

  type NewOrder = {
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

  type OldActor = {
    nextCakeId : Nat;
    nextOrderId : Nat;
    cakes : Map.Map<CakeId, Cake>;
    orders : Map.Map<OrderId, OldOrder>;
    userProfiles : Map.Map<Principal, { username : Text; address : Text }>;
  };

  type NewActor = {
    nextCakeId : Nat;
    nextOrderId : Nat;
    cakes : Map.Map<CakeId, Cake>;
    orders : Map.Map<OrderId, NewOrder>;
    userProfiles : Map.Map<Principal, { username : Text; address : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<OrderId, OldOrder, NewOrder>(
      func(_orderId, oldOrder) {
        {
          oldOrder with
          userId = null;
          deliveryDate = "1970-01-01"
        };
      }
    );
    {
      old with
      orders = newOrders;
    };
  };
};
