import Shop from "./Shop";

type User = {
  id: string;
  name: string;
  email: string;
  tel: string;
  role: string; // "admin" | "user"
  createdAt: Date;
  shops: Shop[]; // Array of shop IDs
};

export default User;
