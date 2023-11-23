import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

const checkAuth = (redirectingURL1) => {
  try {
    if (!window.localStorage.getItem("user_id")) {
      window.location.href = redirectingURL1;
    }
    var usernames = document.querySelectorAll(".user-name");
    usernames.forEach((username) => {
      username.innerHTML = window.localStorage.getItem("username");
    });
    document.querySelector(".email").innerHTML =
      window.localStorage.getItem("email");
  } catch (error) {
    console.log(error);
  }
};
checkAuth("index.html");

async function fetchImages() {
  try {
    const response = await fetch("http://localhost:3000/getUserPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: window.localStorage.getItem("user_id") }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.posts || !Array.isArray(data.posts)) {
      console.error(
        "Invalid or missing 'posts' property in server response:",
        data
      );
      return [];
    }

    return data.posts;
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
}

async function renderImages() {
  const postsContainer = document.querySelector(".posts");
  postsContainer.innerHTML = ""; // Clear existing content

  const images = await fetchImages();
  images.forEach((post) => {
    const imgElement = document.createElement("img");
    imgElement.src = post.path; // Assuming 'path' is the property containing the image URL
    postsContainer.appendChild(imgElement);
  });
}

// Call the renderImages function to initiate rendering
renderImages();

const signout = document.querySelectorAll(".logout");
signout.forEach((so) => {
  so.addEventListener("click", () => {
    window.localStorage.removeItem("email");
    window.localStorage.removeItem("user_id");
    checkAuth("index.html", "dashboard.html");
  });
});

const expand_btn = document.querySelector(".expand-btn");

let activeIndex;

expand_btn.addEventListener("click", () => {
  document.body.classList.toggle("collapsed");
  let main = document.querySelector(".main");
  main.classList.toggle("mainChange");
});

const current = window.location.href;

const allLinks = document.querySelectorAll(".sidebar-links a");

allLinks.forEach((elem) => {
  elem.addEventListener("click", function () {
    const hrefLinkClick = elem.href;

    allLinks.forEach((link) => {
      if (link.href == hrefLinkClick) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });
});

const searchInput = document.querySelector(".search__wrapper input");

searchInput.addEventListener("focus", (e) => {
  document.body.classList.toggle("collapsed");
  let main = document.querySelector(".main");
  main.classList.toggle("mainChange");
});

const imageButton = document.getElementById("image");
imageButton.addEventListener("change", async (event) => {
  const firebaseConfig = {
    apiKey: "AIzaSyAwStmtuMxPROe_OBywc2yrU8K-qgdHmfI",
    authDomain: "vanilla-javascript-5d273.firebaseapp.com",
    projectId: "vanilla-javascript-5d273",
    storageBucket: "vanilla-javascript-5d273.appspot.com",
    messagingSenderId: "459451456157",
    appId: "1:459451456157:web:8993871ca030b00492d274",
    measurementId: "G-JHMTNNHWP6",
  };

  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  const file = event.target.files[0];

  console.table("File", file);

  if (!file) {
    console.error("No file selected.");
    return;
  }

  try {
    // Create a reference to the storage bucket and the file path
    const storageRef = ref(storage, file.name);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log("File uploaded successfully!", snapshot);

    // Get the download URL of the uploaded file
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL:", downloadURL);

    // Send data to the server

    const res = await fetch("http://localhost:3000/createPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: downloadURL,
        user_id: window.localStorage.getItem("user_id"),
      }),
    });

    console.log("Server response status:", res.status);

    const data = await res.json();
    console.log("Server response data:", data);

    if (data.success === false) {
      console.log("Post Failed Uploading");
      return;
    }

    console.log("Post updated successfully");

    // Now that the file is uploaded and server responded successfully,
    // call renderImages to update the UI
    renderImages();
  } catch (error) {
    console.error("Error:", error);
  }
});

const sideBar = document.querySelector(".sidebar__profile");
sideBar.addEventListener("click", () => {
  window.location.href = "profile.html";
});

const editBtn = document.getElementById("Edit");
editBtn.addEventListener("click", () => {
  window.location.href = "edit.html";
});
