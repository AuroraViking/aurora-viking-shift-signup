import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
    let tempComment = "";

    async function fetchSignups() {
      const snapshot = await getDocs(collection(window.db, "signups"));
      signupsData = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!signupsData[data.date]) {
          signupsData[data.date] = [];
        }
        signupsData[data.date].push({ id: doc.id, name: data.name, approved: data.approved || false });
      });
      console.log(signupsData);
    }

    // ... other functions stay the same ...

    window.approveSignup = async function(id) {
      const guideDiv = document.getElementById(`guide-${id}`);
      if (guideDiv) {
        guideDiv.style.color = "lightgreen";
      }
      const docRef = doc(window.db, "signups", id);
      await updateDoc(docRef, { approved: true });
    }

    // ... rest of the code remains unchanged ...

  }, 100);
};
