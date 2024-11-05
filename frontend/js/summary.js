// Summarization
function summarize(text) {
    if (!text) {
        text = document.querySelector("#long-content").value
    }
    const summarizeDiv = document.querySelector("#summary")
    if (text.length < 10) {
        summarizeDiv.innerHTML = 'Text is very short to summarize'
        return
    } else {
        summarizeDiv.innerHTML = 'Wait a while...'
    }
    fetch("http://127.0.0.1:5000/summarize", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }),
    })
        .then((response) => response.json())
        .then((data) => {
            const converter = new showdown.Converter();
            let htmlContent = converter.makeHtml(data.response);
            htmlContent += '<button class="summarize-btn" onclick="summarizeBack()">Summarize This Summary</button>'
            summarizeDiv.innerHTML = htmlContent
        })
        .catch((error) => {
            console.error("Error:", error);
            summarizeDiv.innerHTML = 'Error! Something wrong happening in AI World.'
        });
}


function summarize_pdf() {
    const summarizeDiv = document.querySelector("#summary")
    summarizeDiv.innerHTML = 'Wait a while...'

    const index = pdfFiles.findIndex(obj => obj.name === selectedPDFForSummary);
    if (index === -1) {
        summarizeDiv.innerHTML = "First select the pdf from the sidebar and do not delete selected PDF...";
        return;
    }
    const formData = new FormData();
    formData.append("file", pdfFiles[index]);
    fetch("http://127.0.0.1:5000/summarize_file", {
        method: "POST",
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            const converter = new showdown.Converter();
            let htmlContent = converter.makeHtml(data.response);
            htmlContent += '<button class="summarize-btn" onclick="summarizeBack()">Summarize This Summary</button>'
            summarizeDiv.innerHTML = htmlContent
        })
        .catch((error) => {
            summarizeDiv.innerHTML = 'Error! Something wrong happening in AI World.'
        });
}

function summarizeBack() {
    let currentSummary = document.querySelector('#summary').innerHTML
    summarize(currentSummary)
}