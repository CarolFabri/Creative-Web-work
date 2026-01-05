document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const ringLoader = document.getElementById("ringLoader");
  const startContent = document.getElementById("startContent");
  const startMain = document.getElementById("startMain");

  if (!startBtn) return; // safe

  startBtn.addEventListener("click", () => {
    startMain.classList.add("is-loading");
    ringLoader.hidden = false;
    startContent.hidden = true;

    setTimeout(() => {
      window.location.href = "/reading_start";
    }, 4000);
  });
});
