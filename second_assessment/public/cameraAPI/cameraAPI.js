// Select elements
const captureBtn = document.getElementById('capture-btn');
const canvas = document.getElementById('photo');
const context = canvas.getContext('2d');
const video = document.getElementById('camera');

// Start camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((error) => {
    console.error("Error accessing the camera: ", error);
  });

// Capture photo
captureBtn.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert canvas to base64
  const imageData = canvas.toDataURL('image/png');

  // Send to backend
  fetch('/reading/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData })
  })
  .then(res => res.json())
  .then(data => {
   console.log('Photo saved, server says:', data);
      // for now just log it
      // e.g. show a message:
      alert('Photo captured and sent!');
    })
    .catch(err => console.error(err));
});