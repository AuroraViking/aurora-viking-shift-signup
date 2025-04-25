import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';

window.onload = function() {
  setTimeout(async function() {
    emailjs.init("NU05RrxOBPbELbbMe");

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
      const email = document.getElementById("email").value.trim();
      const comment = document.getElementById("comment").value.trim();
      if (!name || !email) return;

      for (let day of selectedDays) {
        const dateKey = `${selectedMonth}-${day}`;
        await db.collection("signups").add({
          date: dateKey,
          name,
          email,
          comment
        });
      }

      emailjs.send('service_thkd5yj', 'template_os5a0co', {
        guide_name: name,
        guide_email: email,
        selected_dates: selectedDays.map(day => `${selectedMonth}-${day}`).join(', '),
        comment: comment
      }).then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
      }, function(error) {
        console.log('FAILED...', error);
      });

      selectedDays = [];
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
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
