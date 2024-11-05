const urlsInput = document.getElementById("urls");
const addUrlButton = document.getElementById("addUrl");
const pdfFilesInput = document.getElementById("pdfFiles");
const uploadFiles = document.getElementById("uploadFiles");
const mainContent = document.getElementById("mainContent");
const logBox = document.getElementById("log")

let pdfFiles = [];
let selectedPDFForSummary = ''


addUrlButton.addEventListener("click", async (event) => {
  event.preventDefault()
  const url = urlsInput.value;
  try {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      const file = new File([blob], `${url}.pdf`, {
        type: "application/pdf",
      });
      insertPDF(file)
    } else {
      console.error(`Failed to download PDF from ${url}`);
    }
  } catch (error) {
    console.log(`Error fetching PDF from ${url}`, error);
  }
  updatePDF()
  urlsInput.value = ""; // Clear URLs input after adding
});

// Handle file uploads
pdfFilesInput.addEventListener("change", () => {
  const files = pdfFilesInput.files;
  for (let file of files) {
    insertPDF(file)
  }
  console.log(pdfFiles);
  pdfFilesInput.value = "";
});

// Update selected pdf
function updatePDF() {
  const container = document.querySelector('.selected-files')
  container.innerHTML = ""
  if (pdfFiles.length == 0) container.innerHTML = "No PDFs Selected"
  else {
    for (i = 0; i < pdfFiles.length; i++) {
      container.innerHTML += `
        <div class="file">
        <button onclick="pdfPopup(event, '${pdfFiles[i].name}')" class="filename">${pdfFiles[i].name}</button>
        <button class="delete-file" onclick="deletePDF('${pdfFiles[i].name}')"><i class="fa-solid fa-trash"></i></button>
        </div>    
      `
    }
  }
}

function insertPDF(pdf) {
  const index = pdfFiles.findIndex(obj => obj.name === pdf.name);
  if (index !== -1) {
    pdfFiles[index] = pdf;
  } else {
    pdfFiles.push(pdf);
  }
  updatePDF()
}

function deletePDF(pdfName) {
  pdfFiles = pdfFiles.filter(obj => obj.name != pdfName)
  updatePDF()
}

// Function to submit all PDF files to Flask app
uploadFiles.addEventListener("click", (event) => {
  logBox.innerHTML = "Preparing for upload..."
  const formData = new FormData();

  for (let i = 0; i < pdfFiles.length; i++) {
    formData.append("files[]", pdfFiles[i]);
  }

  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % (10 + 1);
    logBox.innerHTML = "Uploading" + ".".repeat(dots);
  }, 500);

  logBox.innerHTML = "Uploading..."
  fetch("http://127.0.0.1:5000/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      clearInterval(interval);
      logBox.innerHTML = data.response
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

function pdfPopup(event, pdfName, pageNo = 1) {
  let isInSummarization = (document.querySelector("input[name='task']:checked").value=="summary")
  event.preventDefault();

  const index = pdfFiles.findIndex(obj => obj.name === pdfName);
  if (index === -1) {
    alert(`${pdfName} not found!`);
    return;
  }
  const fileURL = URL.createObjectURL(pdfFiles[index]);
  const pageHash = pageNo ? `#page=${pageNo}` : '';

  let pdfViewer = document.getElementById('pdfViewer');
  if(!isInSummarization){
    document.getElementById("pdf-name").innerHTML = pdfName
    document.getElementById('pdfPopup').style.display = 'block';
  }else{
    document.querySelector("#select-pdf-message").style.display="none";
    pdfViewer = document.getElementById('pdfViewer-summarization')
    pdfViewer.style.display = 'block'
    selectedPDFForSummary = pdfName
  }
  pdfViewer.src = fileURL + pageHash;
}

function closePopup() {
  document.getElementById('pdfPopup').style.display = 'none';
}

