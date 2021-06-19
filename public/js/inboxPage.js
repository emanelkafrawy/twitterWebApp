$(document).ready(() => {
    $.get("api/chats",(data, status, xhr) =>{
        if(xhr.status == 400){
            alert("coludn't get hte chat list")
        }
        else{
            outputChatList(data, $('.resultContainer'))
        }
    })
})

function outputChatList(chatList, container) {
    chatList.forEach(chat => {
        var html = createChatHtml(chat);
        container.append(html);
    })

    if(chatList.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>");
    }
}
