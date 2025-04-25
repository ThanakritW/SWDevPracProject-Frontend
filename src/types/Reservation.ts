import Shop from "./Shop";

type Reservation = {
  _id: number;
  resvDate: Date;
  user: string;
  shop: Shop;
  createdAt: Date;
};

export default Reservation;
