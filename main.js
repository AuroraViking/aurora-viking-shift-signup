window.onload = function() {
  setTimeout(async function() {
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
    };window.onload = function() {
  setTimeout(async function() {
    const months = ["September", "Október", "Nóvember", "Desember", "Janúar", "Febrúar", "Mars", "Apríl"];
    const daysInMonth = {
      September: 30,
      Október: 31,
      Nóvember: 30,
      Desember: 31,
      Janúar: 31,
      Febrúar: 29,
      Mars: 31,
      Apríl: 30,
    };

    let selectedMonth = "September";
    let selectedDays = [];
    let signupsData = {};
    let viewingMyShifts = false;

    async function fetchSignups() {
      const snapshot = await db.collection("signups").get();
      signupsData = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!signupsData[data.date]) {
          signupsData[data.date] = [];
        }
        signupsData[data.date].push({ id: doc.id, name: data.name });
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
        if (month === selectedMonth && !viewingMyShifts) {
          btn.classList.add("selected");
        }
        btn.onclick = async () => {
          selectedMonth = month;
          viewingMyShifts = false;
          renderTabs();
          await fetchSignups();
          renderCalendar();
        };
        tabDiv.appendChild(btn);
      });

      const myShiftsBtn = document.createElement("button");
      myShiftsBtn.textContent = "Vaktir mínar";
      myShiftsBtn.className = "month-tab";
      if (viewingMyShifts) {
        myShiftsBtn.classList.add("selected");
      }
      myShiftsBtn.onclick = () => {
        viewingMyShifts = true;
        renderTabs();
        renderMyShiftsView();
      };
      tabDiv.appendChild(myShiftsBtn);
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
        div.onclick = () => showDaySignups(dateKey);
        cal.appendChild(div);
      }
    }

    function renderMyShiftsView() {
      const cal = document.getElementById("calendar");
      cal.innerHTML = '';

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Nafn þitt";
      input.style.marginBottom = "10px";
      cal.appendChild(input);

      const button = document.createElement("button");
      button.textContent = "Finna vaktir";
      button.style.display = "block";
      button.style.margin = "10px auto";
      cal.appendChild(button);

      const resultsDiv = document.createElement("div");
      cal.appendChild(resultsDiv);

      button.onclick = () => {
        const name = input.value.trim();
        if (!name) return;

        const myShifts = [];
        for (const [date, entries] of Object.entries(signupsData)) {
          if (entries.some(e => e.name === name)) {
            myShifts.push(date);
          }
        }

        resultsDiv.innerHTML = myShifts.length > 0 ?
          `<h3>Vaktir þínar:</h3><ul>${myShifts.map(d => `<li>${d}</li>`).join('')}</ul>` :
          `<p>Engar vaktir fundust fyrir ${name}.</p>`;
      };
    }

    async function showDaySignups(dateKey) {
      const guides = signupsData[dateKey] || [];
      if (guides.length === 0) {
        alert("Engir leiðsögumenn skráðir á þennan dag.");
        return;
      }

      const list = guides.map(g => `${g.name} <button onclick=\"removeSignup('${g.id}')\">Fjarlægja</button>`).join('<br>');
      const popup = document.createElement("div");
      popup.innerHTML = `<div style='background:#222; padding:20px; border:2px solid #00ffe1; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:999;'>
        <h3>Leiðsögumenn á ${dateKey}</h3>
        ${list}
        <br><br><button onclick=\"this.parentElement.remove()\">Loka</button>
      </div>`;
      document.body.appendChild(popup);
    }

    window.removeSignup = async function(id) {
      await db.collection("signups").doc(id).delete();
      alert("Leiðsögumaður fjarlægður!");
      document.location.reload();
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
  }, 100);
};

    let selectedMonth = "September";
    let selectedDays = [];
    let signupsData = {};
    let viewingMyShifts = false;

    async function fetchSignups() {
      const snapshot = await db.collection("signups").get();
      signupsData = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!signupsData[data.date]) {
          signupsData[data.date] = [];
        }
        signupsData[data.date].push({ id: doc.id, name: data.name });
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
        if (month === selectedMonth && !viewingMyShifts) {
          btn.classList.add("selected");
        }
        btn.onclick = async () => {
          selectedMonth = month;
          viewingMyShifts = false;
          renderTabs();
          await fetchSignups();
          renderCalendar();
        };
        tabDiv.appendChild(btn);
      });

      const myShiftsBtn = document.createElement("button");
      myShiftsBtn.textContent = "My Shifts";
      myShiftsBtn.className = "month-tab";
      if (viewingMyShifts) {
        myShiftsBtn.classList.add("selected");
      }
      myShiftsBtn.onclick = () => {
        viewingMyShifts = true;
        renderTabs();
        renderMyShiftsView();
      };
      tabDiv.appendChild(myShiftsBtn);
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
        div.onclick = () => showDaySignups(dateKey);
        cal.appendChild(div);
      }
    }

    function renderMyShiftsView() {
      const cal = document.getElementById("calendar");
      cal.innerHTML = '';

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Enter your name";
      input.style.marginBottom = "10px";
      cal.appendChild(input);

      const button = document.createElement("button");
      button.textContent = "Find My Shifts";
      button.style.display = "block";
      button.style.margin = "10px auto";
      cal.appendChild(button);

      const resultsDiv = document.createElement("div");
      cal.appendChild(resultsDiv);

      button.onclick = () => {
        const name = input.value.trim();
        if (!name) return;

        const myShifts = [];
        for (const [date, entries] of Object.entries(signupsData)) {
          if (entries.some(e => e.name === name)) {
            myShifts.push(date);
          }
        }

        resultsDiv.innerHTML = myShifts.length > 0 ?
          `<h3>Your Shifts:</h3><ul>${myShifts.map(d => `<li>${d}</li>`).join('')}</ul>` :
          `<p>No shifts found for ${name}.</p>`;
      };
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

    async function showDaySignups(dateKey) {
      const guides = signupsData[dateKey] || [];
      if (guides.length === 0) {
        alert("No guides signed up for this date.");
        return;
      }

      const list = guides.map(g => `${g.name} <button onclick=\"removeSignup('${g.id}')\">Remove</button>`).join('<br>');
      const popup = document.createElement("div");
      popup.innerHTML = `<div style='background:#222; padding:20px; border:2px solid #00ffe1; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:999;'>
        <h3>Guides for ${dateKey}</h3>
        ${list}
        <br><br><button onclick=\"this.parentElement.remove()\">Close</button>
      </div>`;
      document.body.appendChild(popup);
    }

    window.removeSignup = async function(id) {
      await db.collection("signups").doc(id).delete();
      alert("Guide removed!");
      document.location.reload();
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
  }, 100);
};
