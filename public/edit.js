import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

const fileInput = document.querySelector(".file-input"),
  filterOptions = document.querySelectorAll(".filter button"),
  filterName = document.querySelector(".filter-info .name"),
  filterSlider = document.querySelector(".filter input"),
  filterValue = document.querySelector(".filter-info .value"),
  previewImg = document.querySelector(".preview-img img"),
  rotateOptions = document.querySelectorAll(".rotate .options button"),
  resetBtn = document.querySelector(".reset-filter"),
  saveBtn = document.querySelector(".save-img"),
  storeBtn = document.querySelector(".store-img"),
  chooseImgBtn = document.querySelector(".choose-img");

let brightness = 100,
  saturation = 100,
  inversion = 0,
  grayscale = 0;

let rotate = 0,
  flipHorizontal = 1,
  flipVertical = 1;

const loadImage = () => {
  let file = fileInput.files[0];
  if (!file) return;
  previewImg.src = URL.createObjectURL(file);
  previewImg.addEventListener("load", () => {
    resetBtn.click();
    document.querySelector(".container").classList.remove("disable");
  });
};

filterOptions.forEach((options) => {
  options.addEventListener("click", () => {
    filterOptions.forEach((option1) => {
      option1.classList.remove("active");
    });
    // document.querySelector(".filter button .active").classList.remove("active");
    options.classList.add("active");
    filterName.innerText = options.innerText;
    if (options.id === "brightness") {
      filterSlider.max = "200";
      filterSlider.value = brightness;
      filterValue.innerText = `${brightness}%`;
    } else if (options.id === "saturation") {
      filterSlider.max = "200";
      filterSlider.value = saturation;
      filterValue.innerText = `${saturation}%`;
    } else if (options.id === "inversion") {
      filterSlider.max = "100";
      filterSlider.value = inversion;
      filterValue.innerText = `${inversion}%`;
    } else {
      filterSlider.value = grayscale;
      filterSlider.max = "100";
      filterValue.innerText = `${grayscale}%`;
    }
  });
});

const applyFilter = () => {
  previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
  previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
};

const updateFilter = () => {
  filterValue.innerText = filterSlider.value + "%";
  const selectedFilter = document.querySelector(".filter .active");

  if (selectedFilter.id === "brightness") {
    brightness = filterSlider.value;
  } else if (selectedFilter.id === "saturation") {
    saturation = filterSlider.value;
  } else if (selectedFilter.id === "inversion") {
    inversion = filterSlider.value;
  } else {
    grayscale = filterSlider.value;
  }
  applyFilter();
};

rotateOptions.forEach((option) => {
  option.addEventListener("click", () => {
    if (option.id === "left") {
      rotate -= 90;
    } else if (option.id === "right") {
      rotate += 90;
    } else if (option.id === "vertical") {
      flipHorizontal = flipHorizontal === 1 ? -1 : 1;
    } else {
      flipVertical = flipVertical === 1 ? -1 : 1;
    }
    applyFilter();
  });
});

const resetImage = () => {
  (brightness = 100),
    (saturation = 100),
    (inversion = 0),
    (grayscale = 0),
    (rotate = 0),
    (flipHorizontal = 1),
    (flipVertical = 1);
  filterOptions[0].click();
  applyFilter();
};

const uploadImage = async (canvas) => {
  // Convert canvas content to Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    });
  }).then(async (blob) => {
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

    let file = fileInput.files[0];
    const storageRef = ref(
      storage,
      file === undefined ? "image.jpg" : file.name
    );
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

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
  });
};

const saveImage = async () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = previewImg.naturalWidth;
  canvas.height = previewImg.naturalHeight;
  ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rotate !== 0) {
    ctx.rotate((rotate * Math.PI) / 180);
  }
  ctx.scale(flipHorizontal, flipVertical);
  ctx.drawImage(
    previewImg,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );

  const upload = document
    .querySelector(".store-img")
    .classList.contains("upload");
  console.log(upload);
  if (upload === false) {
    const link = document.createElement("a");
    link.download = "image.jpg";
    link.href = canvas.toDataURL();
    link.click();
    return;
  }

  document.querySelector(".store-img").classList.remove("upload");
  uploadImage(canvas);
};

const storeImage = () => {
  document.querySelector(".store-img").classList.add("upload");
  saveImage();
};

fileInput.addEventListener("change", loadImage);
filterSlider.addEventListener("input", updateFilter);
resetBtn.addEventListener("click", resetImage);
saveBtn.addEventListener("click", saveImage);
storeBtn.addEventListener("click", storeImage);
chooseImgBtn.addEventListener("click", () => fileInput.click());
