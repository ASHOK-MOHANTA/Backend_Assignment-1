const API_URL = "http://localhost:5000/api"; // Change to deployed backend

// --- Register ---
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      document.getElementById("registerMsg").innerText = data.message || "Registered!";
    } catch (err) {
      document.getElementById("registerMsg").innerText = "Error: " + err;
    }
  });
}

// --- Login ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
      } else {
        document.getElementById("loginMsg").innerText = data.message || "Login failed";
      }
    } catch (err) {
      document.getElementById("loginMsg").innerText = "Error: " + err;
    }
  });
}

// --- Dashboard ---
if (window.location.pathname.endsWith("dashboard.html")) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "index.html";

  document.getElementById("welcome").innerText = `Welcome, ${user.name} (${user.roles.join(", ")})`;

  // Load profile
  fetch(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("profile").innerText = `Name: ${data.name}, Email: ${data.email}`;
    });

  // Resource CRUD
  const resForm = document.getElementById("resourceForm");
  resForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("resTitle").value;
    await fetch(`${API_URL}/resources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });
    loadResources();
  });

  async function loadResources() {
    try {
      const res = await fetch(`${API_URL}/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      const ul = document.getElementById("resourceList");
      ul.innerHTML = "";
      list.forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `${r.title} <button onclick="deleteResource('${r._id}')">Delete</button>`;
        ul.appendChild(li);
      });
    } catch (e) {
      console.log("Not allowed to view resources", e);
    }
  }
  window.deleteResource = async (id) => {
    await fetch(`${API_URL}/resources/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadResources();
  };
  loadResources();

  // Admin: view all users
  if (user.roles.includes("admin")) {
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(users => {
        document.getElementById("users").innerHTML =
          users.map(u => `<p>${u.name} - ${u.email} [${u.roles.join(", ")}]</p>`).join("");
      });
  } else {
    document.getElementById("users").innerHTML = "Not an admin.";
  }
}

// --- Logout ---
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
