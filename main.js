import { collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
    };

    let selectedMonth = "September";
    let selectedDays = [];
    let signupsData = {};
    let viewingMyShifts = false;

    async function fetchSignups() {
      const snapshot = await getDocs(collection(window.db, "signups"));
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

        if (count >= 5) {
          div.classList.add("full");
        }

        let touchTimer;
        div.onclick = () => {
          if (viewingMyShifts) {
            showDaySignups(dateKey);
          } else {
            toggleDay(day, div);
          }
        };

        div.ondblclick = () => {
          showDaySignups(dateKey);
        };

        div.ontouchstart = () => {
          touchTimer = setTimeout(() => {
            showDaySignups(dateKey);
          }, 500);
        };

        div.ontouchend = () => {
          clearTimeout(touchTimer);
        };

        cal.appendChild(div);
      }
    }

    function showDaySignups(dateKey) {
      const guides = signupsData[dateKey] || [];
      if (guides.length === 0) {
        alert("No guides signed up for this date.");
        return;
      }
      const popup = document.createElement("div");
      popup.style.position = "fixed";
      popup.style.top = "50%";
      popup.style.left = "50%";
      popup.style.transform = "translate(-50%, -50%)";
      popup.style.background = "#222";
      popup.style.padding = "20px";
      popup.style.border = "2px solid #00ffe1";
      popup.style.zIndex = "999";
      popup.innerHTML = `
        <h3>Guides for ${dateKey}</h3>
        ${guides.map(g => `
          <div style="margin:10px;">
            ${g.name}
            <button onclick="removeSignup('${g.id}')" style="margin-left:10px;">Remove</button>
          </div>
        `).join('')}
        <br>
        <button onclick="this.parentElement.remove()">Close</button>
      `;
      document.body.appendChild(popup);
    }

    window.removeSignup = async function(id) {
      await deleteDoc(doc(window.db, "signups", id));
      alert("Guide removed!");
      document.location.reload();
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

    async function submitSignup() {
      const name = document.getElementById("name").value.trim();
      const comment = document.getElementById("comment").value.trim();
      if (!name) return;

      for (let day of selectedDays) {
        const dateKey = `${selectedMonth}-${day}`;
        await addDoc(collection(window.db, "signups"), {
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
