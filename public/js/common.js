var cropper, timer, selectedUsers = [];

$(document).ready(() =>{
    refreshMessageBade();
    refreshNotificationsBade()
})

$("#postTextarea, #replyTextarea").keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();

    var isModal = textbox.parents(".modal").length == 1;
    
    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})


$("#submitPostButton, #submitReplyButton").click(() => {
    var button = $(event.target);

    var isModal = button.parents(".modal").length == 1;
    var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    if (isModal) {
        var id = button.data().id;
        if(id == null) return alert("Button id is null");
        data.replyTo = id;
    }

    $.post("/api/posts", data, postData => {

        if(postData.replyTo) {
            emitNotification(postData.replyTo.postedBy)
            location.reload();
        }
        else {
            var html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true);
        }
    })
})

$("#replyModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);

    $.get("/api/posts/" + postId, results => {
        outputPosts(results.postData, $("#originalPostContainer"));
    })
})

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""));


$(document).on("click", ".likeButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            
            button.find("span").text(postData.likes.length || "");

            if(postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
                emitNotification(postData.postedBy)
            }
            else {
                button.removeClass("active");
            }
        }
    })
})

$("#deleteModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitdeleteButton").data("id", postId);
    
})

$("#confirmPinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitconfirmPinModalButton").data("id", postId);
    
})

$('#submitconfirmPinModalButton').click((event)=>{ // on delete on the button delete inside the pop up
    var id = $(event.target).data("id");
    
    $.ajax({
        url: `/api/posts/${id}`,
        type: "PUT",
        data: {pinned: true},
        success: () => {            
            location.reload();
        }
    })
})


$("#unpinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitUnPinPostModalButton").data("id", postId);
    
})

$('#submitUnPinPostModalButton').click((event)=>{ // on delete on the button delete inside the pop up
    var id = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${id}`,
        type: "PUT",
        data: {pinned: false},
        success: () => {            
            location.reload();
        }
    })
})

$('#submitdeleteButton').click((event)=>{ // on delete on the button delete inside the pop up
    var id = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${id}`,
        type: "DELETE",
        success: () => {            
            location.reload();
        }
    })
})

$("#filePhoto").change(function(){
    if(this.files && this.files[0]){ //to check that the first item on the array not equal to zero
        var reader = new FileReader();  //built in a js object allow us to log read files
        reader.onload = (e)=>{
            var image = document.getElementById("imagePreview")
            image.src = e.target.result;

            // $("#imagePreview").attr("src", e.target.result)  //the same thing to image.src the same result
            if(cropper !== undefined){
                cropper.destroy();
            }
            cropper = new Cropper(image, {
                aspectRation: 1/1,  //size height and width
                background: false
            })
        }
        reader.readAsDataURL(this.files[0])
    }
})

$("#coverPhoto").change(function(){
    if(this.files && this.files[0]){ 
        var reader = new FileReader();  
        reader.onload = (e)=>{
            var image = document.getElementById("coverPreview")
            image.src = e.target.result;

            if(cropper !== undefined){
                cropper.destroy();
            }
            cropper = new Cropper(image, {
                aspectRation: 16 / 9, 
                background: false
            })
        }
        reader.readAsDataURL(this.files[0])
    }
})

$("#submitimageUpLoadButton").click(() =>{

    var canvas = cropper.getCroppedCanvas(); //to take the image after crop

    if(canvas == null ){
        alert("")
        return ;
    }
    canvas.toBlob((blob) =>{
        var formData = new FormData();
        formData.append("croppedImage", blob)

        $.ajax({
            url : "/api/users/profilePicture",
            type: 'POST',
            processData: false,
            contentType: false,
            data: formData,
            success: () =>{
                location.reload();
            }
        })
    }) // to store media  and convert to binary 
})


$("#submitCoverUpLoadButton").click(() =>{

    var canvas = cropper.getCroppedCanvas();

    if(canvas == null ){
        alert("")
        return ;
    }
    canvas.toBlob((blob) =>{
        var formData = new FormData();
        formData.append("croppedImage", blob)

        $.ajax({
            url : "/api/users/coverPicture",
            type: 'POST',
            processData: false,
            contentType: false,
            data: formData,
            success: () =>{
                location.reload();
            }
        })
    }) // to store media  and convert to binary 
})


$("#createChatButton").click(() =>{
    var data = JSON.stringify((selectedUsers)) //send the array to the server + convert to strin

    $.post("/api/chats", { users: data }, chat=>{
        if(!chat || !chat._id) return alert("Invalid response from server.")
        window.location.href = `/messages/${chat._id}`;
    })
})


$("#userSearchTextbox").keydown((event) => {
    clearTimeout(timer);
    var textbox = $(event.target);
    var value = textbox.val();

    if(value == "" && (event.which ==8 || event.keyCode == 8)){
        selectedUsers.pop();
        updateSelectedUserHtml();
        $(".resultsContainer").html("");

        if(selectedUsers.length == 0){
            $('#createChatButton').prop("disabled", true)
        }
        return;
    }
    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == "") {
            $(".resultsContainer").html("");
        }
        else {
            searchUsers(value)
            // console.log(value)
        }
    }, 1000)

})

$(document).on("click", ".retweetButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {            
            button.find("span").text(postData.retweetUsers.length || "");

            if(postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
                emitNotification(postData.postedBy)
            }
            else {
                button.removeClass("active");
            }

        }
    })

})

$(document).on("click", ".post", (event) => {
    var element = $(event.target);
    var postId = getPostIdFromElement(element);

    if(postId !== undefined && !element.is("button")) {
        window.location.href = '/posts/' + postId;
    }
});

$(document).on("click", ".followButton", (event) => {
    var button = $(event.target);
    var userId = button.data().user; //because it is a data-userin the front
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {       //the return from the router function result       
            if(xhr.status === 404) {
                alert("user not found");
                return;
            }
            
            var difference  = 1;
            if(data.following && data.following.includes(userId)){
                button.addClass("following")
                button.text("following")
                emitNotification(userId)
            } else{
                button.removeClass("following")
                button.text("follow")
                difference = -1;
            }
            // location.reload();
            var followersLabel = $("#followersValue");
            if(followersLabel.length !=0){
                var followersText = followersLabel.text();
                followersText = parseInt(followersText)
                followersLabel.text(followersText + difference)
            }
        }
    })

});

$(document).on("click", ".notification.active", (event) => {
    var container = $(event.target);
    var notificationId = container.data().id;

    var href = container.attr("href");
    event.preventDefault();

    var callback = () => window.location = href;
    markNotificationsAsOpened(notificationId, callback);
})

function getPostIdFromElement(element) {
    var isRoot = element.hasClass("post");
    var rootElement = isRoot == true ? element : element.closest(".post");
    var postId = rootElement.data().id;

    if(postId === undefined) return alert("Post id undefined");

    return postId;
}

function createPostHtml(postData, largeFont = false) {

    if(postData == null) return alert("post object is null");

    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;
    
    var postedBy = postData.postedBy;

    if(postedBy._id === undefined) {
        return console.log("User object not populated");
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    var largeFontClass = largeFont ? "largeFont" : "";

    var retweetText = '';
    if(isRetweet) {
        retweetText = `<span>
                        <i class='fas fa-retweet'></i>
                        Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>    
                    </span>`
    }

    var replyFlag = "";
    if(postData.replyTo && postData.replyTo._id) {
        
        if(!postData.replyTo._id) {
            return alert("Reply to is not populated");
        }
        else if(!postData.replyTo.postedBy._id) {
            return alert("Posted by is not populated");
        }

        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;

    }
    var buttons ="", pinnedPostText = "", dataTarget = "#confirmPinModal";
    if(postData.postedBy._id == userLoggedIn._id) //post belongs to u
    {
        var pinnedClass = "";
        if(postData.pinned == true){
            pinnedClass = "active";
            dataTarget = "#unpinModal"
            pinnedPostText = '<i class="fas fa-thumbtack"></i><span>Pinned Post</span>'
        }
        buttons = `<button class='pinButton ${pinnedClass}' data-id ="${postData._id}" data-toggle='modal' data-target='${dataTarget}'><i class="fas fa-thumbtack"></i></button>
                    <button class='deletebutton' data-id ="${postData._id}" data-toggle='modal' data-target='#deleteModal'><i class="fas fa-trash-alt"></i></button>`
    }
    

    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class = 'pinnedPost'>${pinnedPostText}</div>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";
        
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container) {
    container.html("");

    if(!Array.isArray(results)) {
        results = [results];
    }

    results.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function outputPostsWithReplies(results, container) {
    container.html("");

    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo)
        container.append(html);
    }

    var mainPostHtml = createPostHtml(results.postData, true)
    container.append(mainPostHtml);

    results.replies.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });
}

function outputUsers(data, container){
    // console.log(data);
    container.html("");

    data.forEach(element => {
        var html = createUserHtml(element, true);
        container.append(html);
    });

    if(data.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

function createUserHtml(userData, showFollowButton){
    var name = userData.firstName + " " + userData.lastName;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    var text = isFollowing ? "Following" : "Follow"
    var buttonClass = isFollowing ? "followButton following" : "followButton"

    var followButton = "";
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}


function searchUsers(searchTerm){
    var url = '/api/users';
    $.get(url, {search: searchTerm}, (results)=>{ //cb
        outputSelectedUsers(results, $('.resultsContainer'))        
    })
}


function outputSelectedUsers(data, container){

    container.html("");  

    data.forEach(result => {
        
        if(result._id == userLoggedIn._id || selectedUsers.some(u =>u._id == result._id)){ //some function in array check if condition and  if it return 
            return ;
        }

        var html = createUserHtml(result, false); //false for not see following button
        var element = $(html);
        element.click(() => userSelected(result))

        container.append(element);
    });

    if(data.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

function userSelected(user) {
    selectedUsers.push(user);
    updateSelectedUserHtml()
    $("#userSearchTextbox").val("").focus();
    $(".resultsContainer").html("");
    $("#createChatButton").prop("disabled", false);
}

function updateSelectedUserHtml() {
    var elements = [];

    selectedUsers.forEach(user => {
        var name = user.firstName + " " + user.lastName;
        var userElement = $(`<span class='selectedUser'>${name}</span>`);
        elements.push(userElement);
    })

    $(".selectedUser").remove();
    $("#selectedUsers").prepend(elements);

}


function getChatName(chatData) {
    var chatName = chatData.chatName;

    if(!chatName) {
        var otherChatUsers = getOtherChatUsers(chatData.users);
        var namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
        chatName = namesArray.join(", ")
    }

    return chatName;
}

function getOtherChatUsers(users) {
    if(users.length == 1) return users;

    return users.filter(user => user._id != userLoggedIn._id);
}


function messageReceived(newMessage){
    if($(".chatContainer").length == 0) {//not opened the chat page
        //show pop up notification
        showMessagePopup(newMessage)
    }
    else{
        addChatMessageHtml(newMessage);
    }
    refreshMessageBade()
}

function markNotificationsAsOpened(notificationId , callback ){

    if(callback == null)callback =() => location.reload();

    var url = notificationId != null ? `api/notifications/${notificationId}/markAsOpened`: `api/notifications/ markAsOpened`;
    $.ajax({
        url: url,
        type: "PUT",
        success: () => callback()
        
    })
}

function refreshMessageBade(){
    $.get("/api/chats", { unreadOnly: true }, (data) => {
        
        var numResults = data.length;

        if(numResults > 0) {
            $("#messagesBadge").text(numResults).addClass("active");
        }
        else {
            $("#messagesBadge").text("").removeClass("active");
        }

    })
}


function refreshNotificationsBade(){
    $.get("/api/notifications", {unreadOnly: true}, (data)=>{ 

        var numResults = data.length;

        if(numResults > 0){
            $("#notificationBadge").text(numResults).addClass("active")
        }
        else{
            $("#notificationBadge").text(numResults).removeClass("active")

        }
    })
}

function showNotificationPopup(data){
    var html = createNotificationHtml(data);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => {
        element.fadeOut(400) 
    },5000);
}

function showMessagePopup(data){

    if(!data.chat.lastMessage._id){
        data.chat.lastMessage = data;
    }
    var html = createChatHtml(data.chat);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => {
        element.fadeOut(400) 
    },5000);
}


function outputNotificationList(notifications, container) {
    notifications.forEach(notification => {
        var html = createNotificationHtml(notification);
        container.append(html);
    })

    if(notifications.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>");
    }
}

function createNotificationHtml(notification) {
    var userFrom = notification.userFrom;
    var text = getNotificationText(notification);
    var href = getNotificationUrl(notification);
    var className = notification.opened ? "" : "active";
    return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'>${text}</span>
                </div>
            </a>`;
}

function getNotificationText(notification) {

    var userFrom = notification.userFrom;

    if(!userFrom.firstName || !userFrom.lastName) {
        return alert("user from data not populated");
    }

    var userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
    
    var text;

    if(notification.NotifiactionType == "retweet") {
        text = `${userFromName} retweeted one of your posts`;
    }
    else if(notification.NotifiactionType == "postLike") {
        text = `${userFromName} liked one of your posts`;
    }
    else if(notification.NotifiactionType == "reply") {
        text = `${userFromName} replied to one of your posts`;
    }
    else if(notification.NotifiactionType == "follow") {
        text = `${userFromName} followed you`;
    }

    return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationUrl(notification) { 
    var url = "#";

    if(notification.NotifiactionType == "retweet" || 
        notification.NotifiactionType == "postLike" || 
        notification.NotifiactionType == "reply") {
            
        url = `/posts/${notification.entityId}`;
    }
    else if(notification.NotifiactionType == "follow") {
        url = `/profile/${notification.entityId}`;
    }

    return url;
}


function createChatHtml(chatData) {
    var chatName = getChatName(chatData);
    var image = getChatImageElements(chatData); // TODO
    var latestMessage = getLatestMessage(chatData.lastMessage);
    var activeClass = !chatData.lastMessage || chatData.lastMessage.readBy.includes(userLoggedIn._id) ? "" : "active";

    // console.log(chatData.lastMessage);
    return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`;
}

function getLatestMessage(lastMessage){
    // console.log(lastMessage);
    if(lastMessage != null){
        var sender = lastMessage.sender;
        return `${sender.firstName} ${sender.lastName} : ${lastMessage.content}`
    }
    return "new Chat"
}

function getChatImageElements(chatData) {
    var otherChatUsers = getOtherChatUsers(chatData.users);

    var groupChatClass = "";
    var chatImage = getUserChatImageElement(otherChatUsers[0]);

    if(otherChatUsers.length > 1) {
        groupChatClass = "groupChatImage";
        chatImage += getUserChatImageElement(otherChatUsers[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
    if(!user || !user.profilePic) {
        return alert("User passed into function is invalid");
    }

    return `<img src='${user.profilePic}' alt='User's profile pic'>`;
}
