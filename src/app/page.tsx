"use client";
import { useEffect, useState } from "react";
import MOCK from "@/types/Mock.Reservation.json";
import axiosInstance, { setAuthToken } from "@/lib/axios";
import Reservation from "@/types/Reservation";

// Modal Component
const ChangeDateModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDate: string) => void;
}) => {
  const toDatetimeLocal = (date: Date): string => {
    const offsetDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return offsetDate.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:MM'
  };

  const [selectedDateTime, setSelectedDateTime] = useState<string>("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Change Reservation Time</h2>
        <input
          type="datetime-local"
          className="w-full border p-2 rounded-md"
          value={selectedDateTime}
          onChange={(e) => {
            setSelectedDateTime(e.target.value);
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              onSave(new Date(selectedDateTime).toISOString());
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [resvDate, setResvDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<Reservation[]>([]);
  const [currrentId, setCurrentId] = useState<string | null>(null);

  function LocalDate({ dateString }: { dateString: Date | null }) {
    const [local, setLocal] = useState("");
    if (!dateString) return;

    useEffect(() => {
      const localDate = new Date(dateString).toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      });
      setLocal(localDate);
    }, [dateString]);

    return <span>{local}</span>;
  }

  const getData = async () => {
    if (isLoggedIn) {
      try {
        const response = await axiosInstance.get("/reservations");
        console.log(response.data);
        setData(response.data.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    try {
      const response = await axiosInstance.post("/auth/shop-owner/login", {
        email,
        password,
      });
      setAuthToken(response.data.token);
      console.log(response.data.token);
      const user = await axiosInstance.get("/auth/me");
      console.log(user.data.data.name);
      setName(user.data.data.name);
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateReservation = async (
    id: string | null,
    newDate: string
  ) => {
    if (!id || !newDate) {
      return;
    }
    try {
      await axiosInstance.put(`/reservations/${id}`, {
        resvDate: newDate,
      });
      await getData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string | null) => {
    if (!id) {
      return;
    }
    try {
      await axiosInstance.delete(`/reservations/${id}`);
      await getData();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, [isLoggedIn]);

  return (
    <div className="relative flex flex-col items-center min-h-screen">
      <div className="sticky top-0 bg-blue-300 flex w-full h-15 items-center justify-between p-3 border-b-2 border-zinc-200">
        <p className="text-xl">
          Massage Reservation - <b>Group GenCom</b>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Email"
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 rounded-sm border-zinc-200 py-1 px-2 bg-white"
          />
          <input
            type="Password"
            placeholder="Password"
            value={password || ""}
            onChange={(e) => setPassword(e.target.value)}
            className="border-2 rounded-sm border-zinc-200 py-1 px-2 bg-white"
          />
          <button
            type="button"
            className="bg-blue-500 text-white rounded-sm py-1 px-2 hover:cursor-pointer hover:brightness-95"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
      <main className="flex flex-col p-3 w-full">
        <h1 className="text-4xl font-bold">
          {isLoggedIn
            ? `Hello, ${name}!! Welcome to massage reservation system.`
            : "Please log in first."}
        </h1>

        {isLoggedIn && (
          <div className="flex flex-col gap-3 mt-5">
            <p className="text-xl">Here are your customers' reservations</p>
            {data.map((reservation: Reservation) => (
              <div
                key={reservation._id}
                className="flex flex-col w-full bg-cyan-50 rounded-xl border-2 border-zinc-200 p-3"
              >
                <h4 className="text-xl font-bold">
                  {reservation.shop.name} -{" "}
                  <LocalDate dateString={reservation.resvDate} />
                </h4>
                <p className="text-lg">user: {reservation.user}</p>
                <p className="text-lg">
                  Service Time: {reservation.shop.openTime} -{" "}
                  {reservation.shop.closeTime}
                </p>
                <p className="text-lg">Shop Tel: {reservation.shop.tel}</p>
                <p className="text-lg">
                  Location: {reservation.shop.address},{" "}
                  {reservation.shop.district}, {reservation.shop.province},{" "}
                  {reservation.shop.postalcode}
                </p>
                <p className="text-lg">
                  Created At: <LocalDate dateString={reservation.createdAt} />
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    className="rounded-lg hover:cursor-pointer w-20 bg-green-500 px-2 py-1 font-semibold text-white hover:brightness-95"
                    onClick={() => {
                      setModalOpen(true);
                      setCurrentId(reservation._id);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(reservation._id)}
                    className="rounded-lg hover:cursor-pointer w-20 bg-red-500 px-2 py-1 font-semibold text-white hover:brightness-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ChangeDateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(newDate) => handleUpdateReservation(currrentId, newDate)}
      />
    </div>
  );
}
