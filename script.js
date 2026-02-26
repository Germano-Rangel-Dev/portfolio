const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const images = document.querySelectorAll(".item img");
const closeBtn = document.querySelector(".close");

images.forEach(img => {
  img.addEventListener("click", () => {
    modal.style.display = "block";
    modalImg.src = img.src;
  });
});

closeBtn.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function openSection(id){
    document.querySelectorAll('.content').forEach(sec=>{
        sec.style.display = "none";
    });
    document.getElementById(id).style.display = "block";
}

function playClick(){
    const sound = document.getElementById("click-sound");
    sound.currentTime = 0;
    sound.play();
}