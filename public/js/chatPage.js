$(document).ready(()=>{

    socket.emit("join room", chatId);

    socket.on("typing", ()=>{
        $(".typingDots").show()
    });

    $.get(`/api/chats/${chatId}`, (data) =>{
        $("#chatName").text(getChatName(data));
    })
    
    $.get(`/api/chats/${chatId}/messages`, (data) =>{
        // console.log(data);
        var messages = [], lastSenderId= "";

        data.forEach((message, index) => {
            var html = createMessageHtml(message, data[index+ 1], lastSenderId);
            messages.push(html)
            lastSenderId = message.sender._id;
        });
        var messageHtml = messages.join("")
        addMessageHtmlToPage(messageHtml)
        scrollToBottom(false)
        $('.loadingSpinnerContainer').remove();
        $('.chatContainer').css("visibility", "visible")
    })
})


$('#submitchatNameModalButton').click(() =>{
    var name = $('#chatNameTextbox').val().trim();
    console.log(name);

    $.ajax({
        url: "/api/chats/" + chatId,
        type: "PUT",
        data: {chatName : name},
        success: (data, statua, xhr)=>{
            if(xhr.status !==204){
                alert("couldn't update")
            }
            else{
                location.reload();
            }
        }
    })
}) 

$(".sendMessageButton").click(() =>{
    messageSubmitted()
})

$(".inputTextbox").keydown((event) =>{ //when typing
    
    updateTyping();

    if(event.which === 13 && !event.shiftKey){ //if i press the enter keyyy
        messageSubmitted()
        return false;
    }
})

function updateTyping(){
    socket.emit("typing", chatId);
}

function addMessageHtmlToPage(html){

    $('.chatMessages').append(html);

    //scroll to button

}

function messageSubmitted(){
    var content = $(".inputTextbox").val().trim();
    if(content !== ""){
        $(".inputTextbox").val("")
        sendMessage(content)
    }
}

function sendMessage(content){
    $.post('/api/messages', {content: content, chatId: chatId}, (data, status, xhr)=>{
        // console.log(data);
        if(xhr.status !==201){
            alert("not send message")
            $(".inputTextbox").val(content)
        }
        addChatMessageHtml(data)
    })
}

function addChatMessageHtml(message){
    if(!message || !message._id){
        alert("message not valid")
        return;
    }
    var messageDiv = createMessageHtml(message, null, "")
    // $('.chatMessages').append(messageDiv);
    addMessageHtmlToPage(messageDiv)
    scrollToBottom(true)
}

function createMessageHtml(message, nextMessage, lastSenderId){

    var sender = message.sender;
    var senderName = sender.firstName + " " + sender.lastName;

    var currentSenderId = sender._id;
    var nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

    var isFirst = lastSenderId != currentSenderId;
    var isLast = nextSenderId != currentSenderId;

    var isMine = message.sender._id == userLoggedIn._id;
    var liClassName = isMine ? "mine" : "theirs";

    var nameElement = "";


    if(isFirst) {
        liClassName += " first";

        if(!isMine){
            nameElement = `<span class="senderName">${senderName}</span>`
        }
    }

    var profileImage = "";

    if(isLast) {
        liClassName += " last";
        profileImage = `<img src='${sender.profilePic}'/>`
    }

    var imageContainer = "";
    if(!isMine){
        imageContainer = `<div class="imageContainer">
                            ${profileImage}
                        </div>`
    }

    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated){
    var container = $(".chatMessages");
    var scrollHeight = container[0].scrollHeight;

    if(animated) {
        container.animate({ scrollTop: scrollHeight }, "slow");
    }
    else {
        container.scrollTop(scrollHeight);
    }
}