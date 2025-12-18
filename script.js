const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("userInput");
let isProcessing = false;

// Handle Enter key press
function handleKeyPress(event) {
  if (event.key === "Enter" && !isProcessing) {
    event.preventDefault(); // Prevent form submission
    sendMessage();
  }
}

// Add shake animation to button on empty message
function shakeButton() {
  const button = document.querySelector("button");
  button.style.animation = "shake 0.5s";
  setTimeout(() => {
    button.style.animation = "";
  }, 500);
}

// Add message to chat box with animation
function addMessage(type, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.style.opacity = "0";
  messageDiv.style.transform = type === "user" ? "translateX(30px)" : "translateX(-30px)";
  
  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = type === "user" ? "You" : "AI Assistant";
  
  const content = document.createElement("div");
  content.className = "message-content";
  
  // Typewriter effect for AI messages
  if (type === "ai") {
    content.textContent = "";
    chatBox.appendChild(messageDiv);
    messageDiv.appendChild(label);
    messageDiv.appendChild(content);
    
    // Fade in message container
    setTimeout(() => {
      messageDiv.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
      messageDiv.style.opacity = "1";
      messageDiv.style.transform = "translateX(0)";
    }, 10);
    
    // Typewriter effect
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        content.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 20); // Adjust speed here
        
        // Scroll as text appears
        chatBox.scrollTo({
          top: chatBox.scrollHeight,
          behavior: 'smooth'
        });
      }
    };
    setTimeout(typeWriter, 400);
    
  } else {
    content.textContent = text;
    messageDiv.appendChild(label);
    messageDiv.appendChild(content);
    chatBox.appendChild(messageDiv);
    
    // Fade in user message
    setTimeout(() => {
      messageDiv.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      messageDiv.style.opacity = "1";
      messageDiv.style.transform = "translateX(0)";
    }, 10);
  }
  
  // Smooth scroll to bottom
  setTimeout(() => {
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: 'smooth'
    });
  }, 100);
}

// Show typing indicator
function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "message ai";
  typingDiv.id = "typing-indicator";
  
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.innerHTML = "<span></span><span></span><span></span>";
  
  typingDiv.appendChild(indicator);
  chatBox.appendChild(typingDiv);
  
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });
}

// Remove typing indicator
function removeTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}

// Main send message function
async function sendMessage() {
  const message = userInput.value.trim();

  if (!message) {
    shakeButton();
    userInput.focus();
    return;
  }
  
  if (isProcessing) return;

  // Set processing state
  isProcessing = true;
  const button = document.querySelector("button");
  button.disabled = true;
  const originalText = button.textContent;
  
  // Animate button text
  button.style.transform = "scale(0.95)";
  button.textContent = "Sending...";
  setTimeout(() => {
    button.style.transform = "scale(1)";
  }, 100);

  // Add user message with slide animation
  addMessage("user", message);
  
  // Clear input with fade effect
  userInput.style.opacity = "0.5";
  setTimeout(() => {
    userInput.value = "";
    userInput.style.opacity = "1";
  }, 150);

  // Show typing indicator
  setTimeout(() => {
    showTypingIndicator();
  }, 300);

  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      throw new Error(`Server responded with status: ${res.status}`);
    }

    const data = await res.json();
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add AI response with typewriter effect
    addMessage("ai", data.reply);

  } catch (error) {
    console.error("Error:", error);
    removeTypingIndicator();
    addMessage("ai", "Sorry, I'm having trouble connecting to the server. Please try again later.");
  } finally {
    // Reset processing state with animation
    setTimeout(() => {
      isProcessing = false;
      button.disabled = false;
      button.textContent = originalText;
      userInput.focus();
    }, 500);
  }
}

// Welcome message on load
window.addEventListener("load", () => {
  setTimeout(() => {
    addMessage("ai", "Hi! I'm Neel's AI assistant. Feel free to ask me anything about Neel's skills, projects, or experience!");
  }, 500);
  
  // Add Enter key listener as backup
  userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !isProcessing) {
      event.preventDefault();
      sendMessage();
    }
  });
});