// QA Service
let canSendMessage = true; // Variable to limit too many questions till AI gives its response
function sendMessage() {
    if (canSendMessage) {
        const userInput = document.getElementById("user-input");
        const chatBox = document.getElementById("chat-box");
        const advanceMode = document.getElementById("check-advance")
        console.log(advanceMode.value);
        
        if (userInput.value != '') {
            canSendMessage = false;
            // Create user message
            const userMessage = document.createElement("div");
            userMessage.classList.add("message", "user-message");
            userMessage.innerText = userInput.value;
            chatBox.appendChild(userMessage);

            const botMessage = document.createElement("div");
            botMessage.classList.add("message", "bot-message");
            botMessage.innerHTML = "Wait AI is responding...";
            chatBox.appendChild(botMessage);
            chatBox.scrollTop = chatBox.scrollHeight;

            // Send user input to Flask API
            fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userInput.value, advanceMode: advanceMode.checked}),
            })
                .then((response) => response.json())
                .then((data) => {
                    const converter = new showdown.Converter({tables: true});
                    let res = parseJson(data.response)
                    
                    let htmlContent = converter.makeHtml(res['answer']);
                    
                    if (res['most_relevant_file_name'] != '-1' || res['most_relevant_page_number'] != '-1') {
                        htmlContent += `<button onclick="pdfPopup(event, '${res['most_relevant_file_name']}', ${res['most_relevant_page_number']})">View source </button>`
                    }
                    botMessage.innerHTML = htmlContent;
                    // Scroll to bottom
                    chatBox.scrollTop = chatBox.scrollHeight;
                    canSendMessage = true;
                })
                .catch((error) => {
                    botMessage.innerHTML = 'Error! Something wrong happening in AI World.';
                    console.log(error)
                    canSendMessage = true;
                });

            // Clear input field
            userInput.value = "";
        }
    }
}