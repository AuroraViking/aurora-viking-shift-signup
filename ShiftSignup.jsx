import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";

const months = ["September", "October", "November", "December", "January", "February", "March", "April"];

const daysInMonth = {
  September: 30,
  October: 31,
  November: 30,
  December: 31,
  January: 31,
  February: 29,
  March: 31,
  April: 30,
};

export default function ShiftSignup() {
  const [selectedMonth, setSelectedMonth] = useState("September");
  const [selectedDays, setSelectedDays] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [signups, setSignups] = useState({});

  useEffect(() => {
    fetchSignups();
  }, []);

  const fetchSignups = async () => {
    const snapshot = await getDocs(collection(db, "signups"));
    let data = {};
    snapshot.forEach((doc) => {
      const item = doc.data();
      data[item.date] = item;
    });
    setSignups(data);
  };

  const handleDayClick = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async () => {
    if (!name) return;
    for (let day of selectedDays) {
      const dateKey = `${selectedMonth}-${day}`;
      await addDoc(collection(db, "signups"), {
        date: dateKey,
        name,
        comment,
      });
    }
    setSelectedDays([]);
    setName("");
    setComment("");
    fetchSignups();
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
        <img src="/White.svg" alt="Aurora Viking Logo" className="mx-auto w-40 mb-4" />
        <h1 className="text-3xl font-bold">Aurora Viking Shift Signup</h1>
      </motion.div>

      <Tabs defaultValue="September" value={selectedMonth} onValueChange={setSelectedMonth}>
        <TabsList className="grid grid-cols-4 gap-2">
          {months.map((month) => (
            <TabsTrigger key={month} value={month} className="text-white">
              {month}
            </TabsTrigger>
          ))}
        </TabsList>

        {months.map((month) => (
          <TabsContent key={month} value={month}>
            <div className="grid grid-cols-7 gap-2 mt-4">
              {Array.from({ length: daysInMonth[month] }, (_, i) => i + 1).map((day) => {
                const dateKey = `${month}-${day}`;
                return (
                  <Card
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`p-2 cursor-pointer ${selectedDays.includes(day) ? "bg-green-600" : "bg-gray-800"}`}
                  >
                    <CardContent className="flex flex-col items-center">
                      <span className="font-bold">{day}</span>
                      {signups[dateKey] && <span className="text-xs mt-1">{signups[dateKey].name}</span>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-6 space-y-4">
        <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea placeholder="Optional comment" value={comment} onChange={(e) => setComment(e.target.value)} />
        <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">
          Sign Up for Selected Days
        </Button>
      </div>
    </div>
  );
}
