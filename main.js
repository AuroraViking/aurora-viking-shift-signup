import { db } from "./firebaseConfig.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

let selectedMonth = "September";
let selectedDays = [];

function renderTabs() {
  const tabDiv = document.getElementById("month-tabs");
  tabDiv.innerHTML = '';
  months.forEach(month => {
    const btn = document.createElement("button");
    btn.textContent = month;
    btn.onclick = () => {
      selectedMonth = month;
      renderCalendar();
    };
    tabDiv.appendChild(btn);
  });
}

function renderCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";
  for (let day = 1; day <= daysInMonth[selectedMonth]; day++) {
    const div = document.createElement("div");
    div.className = "day";
    div.textContent = day;
    div.onclick = () => toggleDay(day, div);
    cal.appendChild(div);
  }
}

function toggleDay(day, element) {
  if (selectedDays.includes(day)) {
    selectedDays = selectedDays.filter(d => d !== day);
    element.classList.remove("selected");
  } else {
    selectedDays.push(day);
    element.classList.add("selected");
  }
}

async function submitSignup() {
  const name = document.getElementById("name").value.trim();
  const comment = document.getElementById("comment").value.trim();
  if (!name) return;

  for (let day of selectedDays) {
    const dateKey = `${selectedMonth}-${day}`;
    await addDoc(collection(db, "signups"), {
      date: dateKey,
      name,
      comment
    });
  }

  selectedDays = [];
  document.getElementById("name").value = "";
  document.getElementById("comment").value = "";
  document.getElementById("calendar").innerHTML = "";
  document.getElementById("confirmation").style.display = "block";

  setTimeout(() => {
    document.getElementById("confirmation").style.display = "none";
    renderCalendar();
  }, 3000);
}

document.getElementById("submit").onclick = submitSignup;
renderTabs();
renderCalendar();
