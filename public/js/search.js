//show the result of the search at realtime when stop typing

var timer;

$("#searchBox").keydown((event) => {
    clearTimeout(timer);
    var textbox = $(event.target);
    var value = textbox.val();
    var searchType = textbox.data().search;  //posts or users

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == "") {
            $(".resultsContainer").html("");
        }
        else {
            search(value, searchType)
            // console.log(value)
        }
    }, 1000)

})

function search(searchTerm, searchType){
    var url = searchType == "users" ? '/api/users': "/api/posts";

    $.get(url, {search: searchTerm}, (results)=>{ //cb
    // console.log(results);
        if(searchType == "users"){
            outputUsers(results, $('.resultsContainer'))
        }else{
        outputPosts(results, $(".resultsContainer"));
        }
    })
}