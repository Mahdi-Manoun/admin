/*document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

    try {
        const response = await fetch("https://b.sweetcuddlesboutique.com/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem("isLoggedIn", "true");
            window.location.href = "admin.html";
        } else {
            errorMsg.textContent = data.message || "Login failed.";
        }
    } catch (error) {
        console.error("Login error:", error);
        errorMsg.textContent = "An error occurred. Please try again.";
    }
});


function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "sweet-admin-login.html";
}
window.logout = logout;
document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const errorMsg = document.getElementById("errorMsg");

    try {
        const response = await fetch("https://b.sweetcuddlesboutique.com/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "sweet_cuddles_admin",
                password: "swc_admin_123!"
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem("isLoggedIn", "true");
            window.location.href = "admin.html";
        } else {
            errorMsg.textContent = data.message || "Login failed.";
        }
    } catch (error) {
        console.error("Login error:", error);
        errorMsg.textContent = "An error occurred. Please try again.";
    }
});*/
/*function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "404.html";
}
window.logout = logout;
document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const errorMsg = document.getElementById("errorMsg");
    const enteredUsername = document.getElementById("username").value;
    const enteredPassword = document.getElementById("password").value;

    // Strict check for allowed credentials
    if (enteredUsername !== "sweet_cuddles_admin" || enteredPassword !== "swc_admin_123!") {
        errorMsg.textContent = "Invalid username or password.";
        return;
    }

    console.log("Login form submitted");
    try {
        const response = await fetch("https://b.sweetcuddlesboutique.com/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "sweet_cuddles_admin",
                password: "swc_admin_123!"
            })
        });

        const data = await response.json();
        console.log("Login response data:", data);


        if (response.ok && data.success) {
            const token = data.token || data.data?.token;
            if (!token) {
                errorMsg.textContent = "Login succeeded but no token was returned.";
                console.error("No token in response:", data);
                return;
            }
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("authToken", data.token);
            window.location.href = "admin.html";
        } else {
            errorMsg.textContent = data.message || "Login failed.";
        }
    } catch (error) {
        console.error("Login error:", error);
        errorMsg.textContent = "An error occurred. Please try again.";
    }
});*/
/*window.onload = function () {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        console.log("Login form submitted");
  
        const errorMsg = document.getElementById("errorMsg");
        const enteredUsername = document.getElementById("username").value;
        const enteredPassword = document.getElementById("password").value;
  
        if (enteredUsername !== "sweet_cuddles_admin" || enteredPassword !== "swc_admin_123!") {
          errorMsg.textContent = "Invalid username or password.";
          return;
        }
  
        try {
          const response = await fetch("https://b.sweetcuddlesboutique.com/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: enteredUsername,
              password: enteredPassword
            })
          });
  
          const data = await response.json();
          console.log("Login response data:", data); 
  
          if (response.ok && data.success) {
            const token = data.token || data.data?.token;
            if (!token) {
              errorMsg.textContent = "Login succeeded but no token was returned.";
              console.error("No token in response:", data);
              return;
            }
  
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("authToken", token);
            window.location.href = "admin.html";
          } else {
            errorMsg.textContent = data.message || "Login failed.";
          }
        } catch (error) {
          console.error("Login error:", error);
          errorMsg.textContent = "An error occurred. Please try again.";
        }
      });
    }
  };
  */
  function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "404.html";
}
window.logout = logout;
  window.onload = function () {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        console.log("Login form submitted");
  
        const errorMsg = document.getElementById("errorMsg");
        const enteredUsername = document.getElementById("username").value;
        const enteredPassword = document.getElementById("password").value;
  
        if (enteredUsername !== "sweet_cuddles_admin" || enteredPassword !== "swc_admin_123!") {
          errorMsg.textContent = "Invalid username or password.";
          return;
        }
  
        try {
          const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: enteredUsername,
              password: enteredPassword
            })
          });
  
          const data = await response.json();
          console.log("Login response data:", data); 
  
          if (response.ok && data.success) {
            const token = data.token || data.data?.token;
            if (!token) {
              errorMsg.textContent = "Login succeeded but no token was returned.";
              console.error("No token in response:", data);
              return;
            }
  
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("authToken", token);
            window.location.href = "admin.html";
          } else {
            errorMsg.textContent = data.message || "Login failed.";
          }
        } catch (error) {
          console.error("Login error:", error);
          errorMsg.textContent = "An error occurred. Please try again.";
        }
      });
    }
  };
  
