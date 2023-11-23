const container = document.querySelector(".container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

const checkAuth = (redirectingURL1) => {
  try {
    if (window.localStorage.getItem("user_id")) {
      window.location.href = redirectingURL1;
    }
  } catch (error) {
    console.log(error);
  }
};
checkAuth("dashboard.html");

if (container && registerBtn && loginBtn) {
  registerBtn.addEventListener("click", () => {
    container.classList.add("active");
    console.log("active!");
  });

  loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
    console.log("inactive!");
  });
}

const signup = async () => {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  const result = await response.json();
  if (result.error) {
    document.getElementById("signupErrorMessage").innerHTML = result.error;
    setTimeout(() => {
      document.getElementById("signupErrorMessage").innerHTML = "";
    }, 2000);
  }
};

const login = async () => {
  const loginEmail = document.getElementById("loginEmail").value;
  const loginPassword = document.getElementById("loginPassword").value;

  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: loginEmail,
      password: loginPassword,
    }),
  });

  const result = await response.json();

  if (result.success === true) {
    window.location.href = "dashboard.html";
    console.table(result);
    window.localStorage.setItem("email", loginEmail);
    window.localStorage.setItem("user_id", result.data.id);
    window.localStorage.setItem("username", result.data.username);
  } else {
    document.getElementById("loginErrorMessage").innerHTML = result.error;
    setTimeout(() => {
      loginErrorMessage.innerHTML = "";
    }, 2000);
  }
};
