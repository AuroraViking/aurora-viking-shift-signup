window.onload = async function() {
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
  let signupsData = {};

  async function fetchSignups() {
    const snapshot = await db.collection("signups").get();
    signupsData = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!signupsData[data.date]) {
        signupsData[data.date] = [];
      }
      signupsData[data.date].push(data.name);
    });
    console.log(signupsData);
  }

  function renderTabs() {
    const tabDiv = document.getElementById("month-tabs");
    tabDiv.innerHTML = '';
    months.forEach(month => {
      const btn = document.createElement("button");
      btn.textContent = month;
      btn.className = "month-tab";
      if (month === selectedMonth) {
        btn.classList.add("selected");
      }
      btn.onclick = async () => {
        selectedMonth = month;
        renderTabs();
        await fetchSignups();
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
      const dateKey = `${selectedMonth}-${day}`;
      const count = signupsData[dateKey] ? signupsData[dateKey].length : 0;
      div.textContent = `${day} (${count})`;
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
      await db.collection("signups").add({
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

    await fetchSignups();
    renderCalendar();

    setTimeout(() => {
      document.getElementById("confirmation").style.display = "none";
    }, 3000);
  }

  document.getElementById("submit").onclick = submitSignup;
  await fetchSignups();
  renderTabs();
  renderCalendar();
};
