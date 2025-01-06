import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with your API URL and anon key
const supabaseUrl = 'https://povwczlfayghyscovpes.supabase.co';  // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdndjemxmYXlnaHlzY292cGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNjY5NTcsImV4cCI6MjA1MTc0Mjk1N30.0RDIER4eVRMQ4BiWp2Gu13X-eWBET3rNN8SaAvmNH00';  // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

console.log(supabase);


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

// Add Username Event Listener
addUsernameBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  if (username) {
    const { data, error } = await supabase
      .from('users')  // Make sure the table name is 'users' in Supabase
      .select('id')
      .eq('id', username)
      .single();

    if (!data) {
      // Username does not exist, insert new user
      const { error } = await supabase
        .from('users')
        .insert([{ id: username, exp: 0 }]);

      if (error) {
        console.error("Error adding username:", error.message);
      } else {
        console.log("User added:", username);
        usernameInput.value = "";  // Clear input field
        updateUI();  // Update UI after adding user
      }
    } else {
      alert("Username already exists.");
    }
  } else {
    alert("Please enter a valid username.");
  }
});

// Confirm and Calculate EXP
confirmBtn.addEventListener("click", async () => {
  const username = usernameSelect.value;
  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;

  if (username) {
    let exp = hours * 2 + Math.floor(minutes / 30); // Calculate basic EXP
    const bonusExp = getBonusExp(hours); // Get bonus EXP
    exp += bonusExp; // Add bonus EXP

    // Update user's EXP in Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ exp: exp })
      .eq('id', username);

    if (error) {
      console.error("Error updating EXP:", error.message);
    } else {
      console.log("EXP updated for:", username);
      hoursInput.value = "";  // Clear inputs
      minutesInput.value = "";
    }
  } else {
    alert("Please select a username.");
  }
});

// Add Manual EXP
addManualExpBtn.addEventListener("click", async () => {
  const username = usernameSelect.value;
  const manualExp = parseInt(manualExpInput.value) || 0;

  if (username) {
    const { data, error } = await supabase
      .from('users')
      .select('exp')
      .eq('id', username)
      .single();

    if (data) {
      const newExp = data.exp + manualExp;
      const { error } = await supabase
        .from('users')
        .update({ exp: newExp })
        .eq('id', username);

      if (error) {
        console.error("Error updating manual EXP:", error.message);
      } else {
        console.log("Manual EXP updated for:", username);
        manualExpInput.value = "";  // Clear input field
      }
    }
  } else {
    alert("Please select a username.");
  }
});

// Remove Username
async function removeUsername(username) {
  if (confirm(`Are you sure you want to remove ${username}?`)) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', username);

    if (error) {
      console.error("Error removing user:", error.message);
    } else {
      console.log("User removed:", username);
    }
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

  if (hours >= 10) bonusExp += 5;
  if (hours >= 20) bonusExp += 5;
  if (hours >= 30) bonusExp += 5;
  if (hours >= 40) bonusExp += 5;

  return bonusExp;
}

// Update User List and Dropdown
async function updateUI() {
  const { data, error } = await supabase.from('users').select();

  if (error) {
    console.error("Error fetching users:", error.message);
    return;
  }

  usernameSelect.innerHTML = `<option value="" disabled selected>Select Username</option>`;
  userListUl.innerHTML = ""; // Clear the user list first before adding new users

  data.forEach(user => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.id;
    usernameSelect.appendChild(option);

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${getRank(user.exp)} (${user.exp} EXP) ${user.id}</span>
      <button class="remove-btn" onclick="removeUsername('${user.id}')">Remove</button>
    `;
    userListUl.appendChild(li);
  });
}

// Set up the real-time listener to listen for any changes to the users table
supabase
  .from('users')
  .on('*', payload => {
    console.log('Change received!', payload); // Logs any change made to the users table
    updateUI();  // Refresh the UI with updated data
  })
  .subscribe();

// Initial Load
window.onload = () => {
  updateUI();  // Load users on page load
};
