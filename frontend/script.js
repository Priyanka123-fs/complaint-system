// Data store
let complaints = [];
let nextId = 101;

// Sample initial data
const sampleData = [
  { id: 101, subject: "Faculty absent for 3 classes", category: "faculty", categoryLabel: "Faculty / Course", priority: "high", status: "review", date: "2026-04-12" },
  { id: 102, subject: "Projector not working - Room 204", category: "classroom", categoryLabel: "Classroom Facilities", priority: "medium", status: "pending", date: "2026-04-10" },
  { id: 103, subject: "Lab seating shortage", category: "lab", categoryLabel: "Laboratory", priority: "medium", status: "resolved", date: "2026-04-05" },
  { id: 104, subject: "Fee receipt not generated", category: "admin", categoryLabel: "Administrative", priority: "high", status: "pending", date: "2026-03-28" },
  { id: 105, subject: "Canteen food quality", category: "hostel", categoryLabel: "Hostel / Canteen", priority: "medium", status: "resolved", date: "2026-03-20" }
];

function loadData() {
  const stored = localStorage.getItem("complaint_system");
  if (stored) {
    complaints = JSON.parse(stored);
    nextId = Math.max(...complaints.map(c => c.id), 100) + 1;
  } else {
    complaints = sampleData.map(c => ({ ...c }));
    nextId = 106;
  }
}

function saveData() {
  localStorage.setItem("complaint_system", JSON.stringify(complaints));
}

function getCategoryLabel(cat) {
  const map = {
    faculty: "Faculty / Course",
    classroom: "Classroom Facilities",
    lab: "Laboratory",
    admin: "Administrative",
    hostel: "Hostel / Canteen",
    other: "Other"
  };
  return map[cat] || cat;
}

// Render Dashboard
function renderDashboard() {
  const pending = complaints.filter(c => c.status === "pending").length;
  const review = complaints.filter(c => c.status === "review").length;
  const resolved = complaints.filter(c => c.status === "resolved").length;
  
  document.getElementById("statsGrid").innerHTML = `
    <div class="stat-card"><div class="stat-label">Pending</div><div class="stat-num pending">${pending}</div></div>
    <div class="stat-card"><div class="stat-label">Under Review</div><div class="stat-num review">${review}</div></div>
    <div class="stat-card"><div class="stat-label">Resolved</div><div class="stat-num resolved">${resolved}</div></div>
  `;
  
  const recent = [...complaints].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  let notifHtml = "";
  if (recent.length === 0) notifHtml = "<div class='empty'>No notifications</div>";
  recent.forEach(c => {
    let msg = c.status === "resolved" ? `✅ "${c.subject}" resolved` : 
              (c.status === "review" ? `🔄 "${c.subject}" under review` : `⏳ "${c.subject}" pending`);
    notifHtml += `
      <div class="notif-item">
        <div class="notif-dot ${c.status === 'resolved' ? 'success' : 'info'}"></div>
        <div><div class="notif-text">${msg}</div><div class="notif-time">${c.date}</div></div>
      </div>
    `;
  });
  document.getElementById("notifications").innerHTML = notifHtml;
}

// Render History
function renderHistory() {
  const container = document.getElementById("complaintsList");
  if (complaints.length === 0) {
    container.innerHTML = "<div class='empty'>No complaints filed yet.</div>";
    return;
  }
  let html = "";
  complaints.slice().reverse().forEach(c => {
    let statusClass = "", statusText = "";
    if (c.status === "pending") { statusClass = "badge-pending"; statusText = "Pending"; }
    else if (c.status === "review") { statusClass = "badge-review"; statusText = "Under Review"; }
    else { statusClass = "badge-resolved"; statusText = "Resolved"; }
    const priorityLabel = { low: "Low", medium: "Medium", high: "High" }[c.priority] || "Medium";
    html += `
      <div class="complaint-row">
        <div>
          <div class="complaint-title">${escapeHtml(c.subject)}</div>
          <div class="complaint-meta">${c.categoryLabel || getCategoryLabel(c.category)} · ${c.date} · Priority: ${priorityLabel}</div>
        </div>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>
    `;
  });
  container.innerHTML = html;
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Dynamic fields for categories
const dynConfig = {
  faculty: `<div class="dyn-block"><div class="row2"><div><label>Course</label><input id="dyn_course" placeholder="Course name"></div><div><label>Faculty</label><input id="dyn_faculty" placeholder="Faculty name"></div></div></div>`,
  classroom: `<div class="dyn-block"><div class="row2"><div><label>Room No.</label><input id="dyn_room" placeholder="Room number"></div><div><label>Issue type</label><select id="dyn_type"><option>Projector</option><option>Seating</option><option>AC/Fan</option></select></div></div></div>`,
  lab: `<div class="dyn-block"><div class="row2"><div><label>Lab name</label><input id="dyn_lab" placeholder="Lab name"></div><div><label>Equipment</label><input id="dyn_equip" placeholder="Equipment ID"></div></div></div>`,
  admin: `<div class="dyn-block"><div><label>Reference No.</label><input id="dyn_ref" placeholder="Receipt/Reference number"></div></div>`,
  hostel: `<div class="dyn-block"><div class="row2"><div><label>Location</label><select id="dyn_loc"><option>Boys Hostel</option><option>Girls Hostel</option><option>Canteen</option></select></div><div><label>Room/Block</label><input id="dyn_block" placeholder="Block/Room"></div></div></div>`,
  other: `<div class="dyn-block"><div><label>Additional info</label><input id="dyn_other" placeholder="Any extra details"></div></div>`
};

function updateDynamicFields() {
  const cat = document.getElementById("category").value;
  const container = document.getElementById("dynamicFields");
  if (cat && dynConfig[cat]) {
    container.innerHTML = dynConfig[cat];
  } else {
    container.innerHTML = "";
  }
}

// Priority selection
let selectedPriority = "medium";
document.querySelectorAll("[data-prio]").forEach(btn => {
  btn.addEventListener("click", function() {
    selectedPriority = this.getAttribute("data-prio");
    document.querySelectorAll("[data-prio]").forEach(b => {
      b.classList.remove("sel-low", "sel-medium", "sel-high");
      if(b.getAttribute("data-prio") === "low") b.classList.add("sel-low");
      if(b.getAttribute("data-prio") === "medium") b.classList.add("sel-medium");
      if(b.getAttribute("data-prio") === "high") b.classList.add("sel-high");
    });
  });
});
// default medium active
document.querySelector("[data-prio='medium']").classList.add("sel-medium");

// Submit complaint
function submitComplaint() {
  const subject = document.getElementById("subject").value.trim();
  const cat = document.getElementById("category").value;
  const desc = document.getElementById("description").value.trim();
  if (!subject || !cat || !desc) {
    alert("Please fill subject, category, and description.");
    return;
  }
  
  const today = new Date().toISOString().slice(0,10);
  const newComplaint = {
    id: nextId++,
    subject: subject,
    category: cat,
    categoryLabel: getCategoryLabel(cat),
    description: desc,
    priority: selectedPriority,
    status: "pending",
    date: today
  };
  complaints.unshift(newComplaint);
  saveData();
  
  // Show success and reset
  const msgDiv = document.getElementById("successMsg");
  msgDiv.style.display = "block";
  msgDiv.textContent = "✓ Complaint submitted!";
  setTimeout(() => {
    msgDiv.style.display = "none";
    document.getElementById("subject").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
    document.getElementById("dynamicFields").innerHTML = "";
    selectedPriority = "medium";
    document.querySelectorAll("[data-prio]").forEach(b => b.classList.remove("sel-low","sel-medium","sel-high"));
    document.querySelector("[data-prio='medium']").classList.add("sel-medium");
    // Switch to history page
    document.querySelector("[data-page='history']").click();
  }, 1500);
  
  renderDashboard();
  renderHistory();
}

// Navigation
function showPage(pageId, btn) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (pageId === "dashboard") renderDashboard();
  if (pageId === "history") renderHistory();
}

// Event listeners
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showPage(btn.getAttribute("data-page"), btn);
  });
});
document.getElementById("quickComplaintBtn")?.addEventListener("click", () => {
  document.querySelector("[data-page='complaint']").click();
});
document.getElementById("cancelBtn")?.addEventListener("click", () => {
  document.querySelector("[data-page='dashboard']").click();
});
document.getElementById("submitBtn")?.addEventListener("click", submitComplaint);
document.getElementById("category")?.addEventListener("change", updateDynamicFields);

// Initialize
loadData();
renderDashboard();
renderHistory();