// DOM Elements
const usernameInput = document.getElementById("usernameInput");
const addUsernameBtn = document.getElementById("addUsernameBtn");
const usernameSelect = document.getElementById("usernameSelect");
const hoursInput = document.getElementById("hoursInput");
const minutesInput = document.getElementById("minutesInput");
const confirmBtn = document.getElementById("confirmBtn");
const manualExpInput = document.getElementById("manualExpInput");
const addManualExpBtn = document.getElementById("addManualExpBtn");
const userListUl = document.getElementById("userListUl");

// Load users from localStorage or initialize an empty object
let users = JSON.parse(localStorage.getItem("users")) || {};

// Add Username Event Listener
addUsernameBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (username && !users[username]) {
    users[username] = { exp: 0 }; // Initialize user with 0 EXP
    saveToLocalStorage();
    updateUI();
    usernameInput.value = ""; // Clear input field
  } else {
    alert("Please enter a valid username or username already exists.");
  }
});

// Confirm and Calculate EXP
confirmBtn.addEventListener("click", () => {
  const username = usernameSelect.value;
  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;

  if (username) {
    let exp = hours * 2 + Math.floor(minutes / 30); // Calculate basic EXP based on hours and minutes
    const bonusExp = getBonusExp(hours); // Get bonus EXP based on hours
    exp += bonusExp; // Add the bonus EXP to the total

    users[username].exp += exp;
    saveToLocalStorage();
    updateUI();
    hoursInput.value = "";
    minutesInput.value = "";
  } else {
    alert("Please select a username.");
  }
});

// Add Manual EXP
addManualExpBtn.addEventListener("click", () => {
  const username = usernameSelect.value;
  const manualExp = parseInt(manualExpInput.value) || 0;

  if (username) {
    users[username].exp += manualExp; // Add manual EXP
    saveToLocalStorage();
    updateUI();
    manualExpInput.value = "";
  } else {
    alert("Please select a username.");
  }
});

// Remove Username
function removeUsername(username) {
  if (confirm(`Are you sure you want to remove ${username}?`)) {
    delete users[username]; // Remove the username from the object
    saveToLocalStorage();
    updateUI();
  }
}

// Get Rank Based on EXP
function getRank(exp) {
  if (exp >= 3100) return "S";
  if (exp >= 2100) return "A";
  if (exp >= 1300) return "B";
  if (exp >= 700) return "C";
  if (exp >= 300) return "D";
  if (exp >= 100) return "E";
  return "";
}

// Get Bonus EXP based on the number of hours
function getBonusExp(hours) {
  let bonusExp = 0;

  // Calculate the bonus EXP based on the hours
  if (hours >= 10) bonusExp += 5; // 10+ hours = +5 EXP
  if (hours >= 20) bonusExp += 5; // 20+ hours = +10 EXP (cumulative)
  if (hours >= 30) bonusExp += 5; // 30+ hours = +15 EXP (cumulative)
  if (hours >= 40) bonusExp += 5; // 40+ hours = +20 EXP (cumulative)
  // Add more bonus levels if needed

  return bonusExp;
}

// Update User List and Dropdown
function updateUI() {
  // Update Dropdown
  usernameSelect.innerHTML = `<option value="" disabled selected>Select Username</option>`;
  for (const username in users) {
    const option = document.createElement("option");
    option.value = username;
    option.textContent = username;
    usernameSelect.appendChild(option);
  }

  // Update User List
  userListUl.innerHTML = "";
  for (const [username, { exp }] of Object.entries(users)) {
    const rank = getRank(exp);
    const li = document.createElement("li");

    // Add user details and remove button
    li.innerHTML = `
      <span>${rank} (${exp} EXP) ${username}</span>
      <button class="remove-btn" onclick="removeUsername('${username}')">Remove</button>
    `;
    userListUl.appendChild(li);
  }
}

// Save to localStorage
function saveToLocalStorage() {
  localStorage.setItem("users", JSON.stringify(users));
}

// Load data on page load
window.onload = () => {
  updateUI();
};