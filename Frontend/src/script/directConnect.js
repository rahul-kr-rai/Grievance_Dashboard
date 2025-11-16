function initDirectConnect() {
    const modal = document.getElementById('connect-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const whatsappLink = document.getElementById('whatsapp-link');
    const phoneLink = document.getElementById('phone-link');

    // Chat elements
    const chatMessages = document.getElementById('chat-messages');
    const chatInputField = document.getElementById('chat-input-field');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatAttachment = document.getElementById('chat-attachment');

    // Attach to all connect buttons
    document.querySelectorAll('.connect-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedEntity = btn.textContent.trim();

            modal.style.display = 'block';
            overlay.style.display = 'block';

            // Set links dynamically
            whatsappLink.href = `https://wa.me/1234567890?text=Hello%20${selectedEntity}`;
            phoneLink.href = `tel:+1234567890`;

            // Clear chat on new open
            chatMessages.innerHTML = '';
            addMessage(`You are now connected with ${selectedEntity}.`, 'entity');
        });
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });

    // Chat feature
    function addMessage(text, sender = 'user', withTick = false) {
        const msg = document.createElement('div');
        msg.classList.add('chat-message', sender);

        const span = document.createElement('span');
        span.textContent = text;

        msg.appendChild(span);

        // Add ticks for user messages
        if (sender === 'user' && withTick) {
            const ticks = document.createElement('span');
            ticks.classList.add('ticks');
            ticks.textContent = '✓'; // single tick initially
            msg.appendChild(ticks);
        }

        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return msg; // return message element for later tick update
    }

    function sendMessage() {
        const text = chatInputField.value.trim();
        if (text) {
            const msgElement = addMessage(text, 'user', true);
            
            chatInputField.value = '';

            // Simulated reply
            setTimeout(() => {
                // Update ticks to double ✓✓
                const ticks = msgElement.querySelector('.ticks');
                if (ticks) ticks.textContent = '✓✓';
                

                addMessage(`Reply: "${text}"`, 'entity');
            }, 1000);
        }
    }

    chatSendBtn.addEventListener('click', sendMessage);

    // Enter key to send
    chatInputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // Handle file attachments
    chatAttachment.addEventListener('change', () => {
        const file = chatAttachment.files[0];
        if (file) {
            let msgElement;
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style.maxWidth = '150px';
                img.style.borderRadius = '4px';
                msgElement = addMessage('', 'user', true);
                msgElement.insertBefore(img, msgElement.firstChild);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.controls = true;
                video.style.maxWidth = '200px';
                msgElement = addMessage('', 'user', true);
                msgElement.insertBefore(video, msgElement.firstChild);
            } else {
                msgElement = addMessage(`📎 Attached: ${file.name}`, 'user', true);
            }

            // Simulated entity reply
            setTimeout(() => {
                const ticks = msgElement.querySelector('.ticks');
                if (ticks) ticks.textContent = '✓✓';
                addMessage(`Entity received your file: ${file.name}`, 'entity');
            }, 1000);
        }
    });
}

document.addEventListener('DOMContentLoaded', initDirectConnect);
