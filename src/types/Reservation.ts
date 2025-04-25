import Shop from "./Shop";

type Reservation = {
  _id: string;
  resvDate: Date;
  user: string;
  shop: Shop;
  createdAt: Date;
};

export default Reservation;
