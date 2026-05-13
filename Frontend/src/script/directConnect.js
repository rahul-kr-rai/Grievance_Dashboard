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

    let currentEntity = "";
    const citizenName = localStorage.getItem('citizenName') 
        || localStorage.getItem('loggedInCitizenName') 
        || (localStorage.getItem('loggedInCitizenEmail') || '').split('@')[0] 
        || 'Citizen';
    let currentStoredMessageCount = 0;
    let chatPollInterval = null;

    // Personalized Questions Data
    const entityQuestions = {
        "Mukhiya": [
            { q: "Next Gram Sabha date?", a: "The next Gram Sabha is scheduled for coming Saturday at 10:00 AM in Panchayat Bhawan." },
            { q: "Panchayat road repair status?", a: "Road repairs for Ward 5 and 7 are approved and will start next week." },
            { q: "Street light installation request?", a: "Please share the pole location. We have a batch of new LED lights arriving this month." },
            { q: "New schemes for farmers?", a: "Yes, the Mukhyamantri Krishi Yojana registration is open. Please visit the office with your Aadhar and Land documents." },
            { q: "How to apply for a Ration Card?", a: "You can collect the application form from the Panchayat office. Bring your family ID and income certificate." },
            { q: "Primary school maintenance issue?", a: "Please report the specific school. We have a dedicated fund for school repairs this quarter." }
        ],
        "Sarpanch": [
            { q: "Dispute resolution hearing?", a: "Panchayat hearings are held every Tuesday. Please register your case at the office by Monday." },
            { q: "Land boundary issue?", a: "I can visit for inspection with the Amin on Friday. Please keep your documents ready." },
            { q: "Official seal for documents?", a: "I am available at the Panchayat Bhawan daily between 4 PM to 6 PM for signatures." },
            { q: "Next Jan Sunwai date?", a: "The next public hearing (Jan Sunwai) is on the 10th of next month at the block office." },
            { q: "Verification for Old Age Pension?", a: "Please bring the applicant's photo and passbook. I will verify and sign the forms today." },
            { q: "Property division legal process?", a: "We can mediate a mutual settlement. If it's a legal battle, you'll need to approach the Civil Court after a first hearing here." }
        ],
        "Ward Member": [
            { q: "Drainage cleaning in my lane?", a: "Noted. I'll send the cleaning staff to your lane tomorrow morning." },
            { q: "Drinking water supply timings?", a: "Water is supplied from 6-8 AM and 5-7 PM daily. Please report if there's no pressure." },
            { q: "Issue with street dustbins?", a: "New dustbins are being installed in our ward. I'll ensure one is placed near your corner." },
            { q: "Fogging schedule for mosquitoes?", a: "Fogging is scheduled for every Monday and Thursday evening. Please keep your windows open for a few minutes." },
            { q: "Water tank cleaning status?", a: "The overhead tank cleaning is scheduled for this Sunday. Water supply will be limited for 2 hours." },
            { q: "Request for new street name plate?", a: "Please provide the lane number. We are ordering a batch of new signage this month." }
        ],
        "BDO/CEO": [
            { q: "PM Awas Yojana status?", a: "Your application is currently at the verification stage. Expected approval in 2 weeks." },
            { q: "Caste/Income certificate delay?", a: "Please provide your Acknowledgement number. I will check the status with the RTPS counter." },
            { q: "Block level scheme eligibility?", a: "You can find detailed eligibility criteria for all current schemes on the notice board at Block HQ." },
            { q: "MNREGA Job Card apply process?", a: "You can apply via your Mukhiya or directly at the Block office. You'll need two photos and a bank account." },
            { q: "Disaster relief fund status?", a: "Fund disbursement for recent damages is in progress. Check your bank account linked to DBT." },
            { q: "Marriage certificate procedure?", a: "Submit the joint application form with age proof and marriage invitation at the block office counter." }
        ],
        "Nagar Nigam": [
            { q: "Garbage collection vehicle not coming?", a: "Please share your area. I will track the vehicle and ensure it covers your street today." },
            { q: "Birth/Death certificate process?", a: "You can apply online on the municipal portal or visit the Jan Suvidha Kendra." },
            { q: "Property tax calculation?", a: "Tax is calculated based on area and category. You can use the calculator on our website." },
            { q: "Stray animal removal request?", a: "Please provide the exact location. Our team will visit within 24 hours to address the issue." },
            { q: "Park maintenance issue?", a: "We are currently renovating local parks. Please share the park name for an update on the timeline." },
            { q: "Encroachment on main road?", a: "Report high-traffic encroachments directly. An anti-encroachment drive is planned for this Friday." }
        ],
        "Nagar Panchayat": [
            { q: "Trade license renewal?", a: "Renewal period is open. Please bring your old license and tax receipt to the office." },
            { q: "New shop allotment in market?", a: "Allotments are done via open auction. Notices are published in local newspapers." },
            { q: "Water tax payment online?", a: "Yes, online payment is now active on the town website. Use your consumer ID to login." },
            { q: "Applying for a new water connection?", a: "Fill out the online form and pay the connection fee. Our technician will visit for inspection." },
            { q: "Hoarding/Advertisement permit?", a: "Permits are issued based on size and location. Apply at the municipal desk with the billboard layout." },
            { q: "Community hall booking for events?", a: "Check availability on our portal. Bookings are open 3 months in advance." }
        ],
        "Default": [
            { q: "How to raise a new complaint?", a: "You can raise a new complaint by clicking on 'Raise New Complaint' in the sidebar menu." },
            { q: "How to track complaint status?", a: "To track your complaint, go to 'Track Complaint Status' and enter your complaint ID." },
            { q: "What is the timeline for resolution?", a: "The standard resolution time is 7-10 working days, depending on the severity of the issue." },
            { q: "Who is my local representative?", a: "Check the 'Direct Connect' section to see the listed representatives for your specific area." }
        ]
    };


    function showQuestions() {
        // Clear any existing questions container first
        const existing = chatMessages.querySelector('.common-questions');
        if (existing) existing.remove();

        const questionsContainer = document.createElement('div');
        questionsContainer.classList.add('common-questions');

        const questions = entityQuestions[currentEntity] || entityQuestions["Default"];

        questions.forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = item.q;
            btn.classList.add('question-btn');
            btn.onclick = () => {
                addMessage(item.q, 'user', true);
                setTimeout(() => {
                    addMessage(item.a, 'entity');
                    // Update ticks to double ✓✓
                    const allMsgs = chatMessages.querySelectorAll('.chat-message');
                    const lastUserMsg = allMsgs[allMsgs.length - 2];
                    if (lastUserMsg && lastUserMsg.classList.contains('user')) {
                        const ticks = lastUserMsg.querySelector('.ticks');
                        if (ticks) ticks.textContent = '✓✓';
                    }
                    // Show questions again after a short delay
                    setTimeout(showQuestions, 500);
                }, 800);
                questionsContainer.remove();
            };
            questionsContainer.appendChild(btn);
        });

        chatMessages.appendChild(questionsContainer);
        scrollToBottom();
    }


    // Attach to all connect buttons
    document.querySelectorAll('.connect-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentEntity = btn.textContent.trim();

            modal.style.display = 'flex';
            overlay.style.display = 'block';

            // Set links dynamically
            whatsappLink.href = `https://wa.me/1234567890?text=Hello%20${currentEntity}`;
            phoneLink.href = `tel:+1234567890`;

            loadChatHistory();

            if (chatPollInterval) clearInterval(chatPollInterval);
            chatPollInterval = setInterval(pollForNewMessages, 2000);
        });
    });

    function loadChatHistory() {
        chatMessages.innerHTML = '';

        let storageKey = currentEntity === 'Mukhiya' ? 'mukhiyaChats' : 'directChats_' + currentEntity;
        let chats = JSON.parse(localStorage.getItem(storageKey) || '{}');
        let messages = chats[citizenName] || [];

        currentStoredMessageCount = messages.length;

        if (messages.length === 0) {
            addMessage(`You are now connected with ${currentEntity}. How can I help you today?`, 'entity');
        } else {
            messages.forEach(m => {
                addMessage(m.text, m.sender === citizenName ? 'user' : 'entity', false, m.time);
            });
        }

        setTimeout(showQuestions, 500);
    }

    function pollForNewMessages() {
        if (modal.style.display !== 'flex' || !currentEntity) return;

        let storageKey = currentEntity === 'Mukhiya' ? 'mukhiyaChats' : 'directChats_' + currentEntity;
        let chats = JSON.parse(localStorage.getItem(storageKey) || '{}');
        let messages = chats[citizenName] || [];

        if (messages.length > currentStoredMessageCount) {
            // Append only the new messages
            for (let i = currentStoredMessageCount; i < messages.length; i++) {
                let m = messages[i];
                addMessage(m.text, m.sender === citizenName ? 'user' : 'entity', false, m.time);
            }
            currentStoredMessageCount = messages.length;

            // Re-show questions at the bottom after new messages arrive
            setTimeout(showQuestions, 500);
        }
    }

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
        if (chatPollInterval) clearInterval(chatPollInterval);
    });

    overlay.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
        if (chatPollInterval) clearInterval(chatPollInterval);
    });

    function scrollToBottom() {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Chat feature
    function addMessage(text, sender = 'user', withTick = false, timestamp = null) {
        const msg = document.createElement('div');
        msg.classList.add('chat-message', sender);

        const span = document.createElement('span');
        span.textContent = text;
        msg.appendChild(span);

        if (timestamp) {
            const timeSpan = document.createElement('div');
            timeSpan.style.fontSize = '10px';
            timeSpan.style.marginTop = '4px';
            timeSpan.style.color = sender === 'user' ? '#e0e0e0' : '#888';
            timeSpan.textContent = timestamp;
            msg.appendChild(timeSpan);
        }

        // Add ticks for user messages
        if (sender === 'user' && withTick) {
            const ticks = document.createElement('span');
            ticks.classList.add('ticks');
            ticks.textContent = '✓'; // single tick initially
            msg.appendChild(ticks);
        }

        chatMessages.appendChild(msg);
        scrollToBottom();

        return msg; // return message element for later tick update
    }

    function sendMessage() {
        const text = chatInputField.value.trim();
        if (text) {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msgElement = addMessage(text, 'user', true, timeStr);
            chatInputField.value = '';

            // Save to real chat
            let storageKey = currentEntity === 'Mukhiya' ? 'mukhiyaChats' : 'directChats_' + currentEntity;
            let chats = JSON.parse(localStorage.getItem(storageKey) || '{}');
            if (!chats[citizenName]) chats[citizenName] = [];

            chats[citizenName].push({
                sender: citizenName,
                text: text,
                time: timeStr
            });
            localStorage.setItem(storageKey, JSON.stringify(chats));
            currentStoredMessageCount = chats[citizenName].length; // Update local count so we don't duplicate

            setTimeout(() => {
                // Update ticks to double ✓✓ indicating it was sent to db
                const ticks = msgElement.querySelector('.ticks');
                if (ticks) ticks.textContent = '✓✓';

                // Optional generic reply if not Mukhiya (Mukhiya has real dashboard)
                if (currentEntity !== 'Mukhiya') {
                    const replyText = `Thank you for reaching out. The ${currentEntity} office has received your message.`;
                    const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    chats = JSON.parse(localStorage.getItem(storageKey) || '{}');
                    chats[citizenName].push({
                        sender: currentEntity,
                        text: replyText,
                        time: replyTime
                    });
                    localStorage.setItem(storageKey, JSON.stringify(chats));

                    // We don't render it manually here, the poller will pick it up, 
                    // but we can call pollForNewMessages immediately
                    pollForNewMessages();
                } else {
                    // For Mukhiya, just show questions again
                    setTimeout(showQuestions, 500);
                }
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
                addMessage(`The ${currentEntity} office has received your file: ${file.name}`, 'entity');
                setTimeout(showQuestions, 500);
            }, 1000);
        }
    });
}

document.addEventListener('DOMContentLoaded', initDirectConnect);
