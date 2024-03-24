console.log("Hello, World!");

function updatePost() {
  const request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      clearPostMain();
      const posts = JSON.parse(this.response);
      for (const post of posts) {
        displayPost(post);
      }
    }
  };
  request.open("GET", "/post"); //change path to whatever we are using
  request.send();
}

function clearPostMain() {
  const postMain = document.querySelector(".post-main");
  postMain.innerHTML = "";
}

function sendPost() {
  const postTextBox = document.querySelector(".chat-text-box"); // Corrected selector
  const message = postTextBox.value; // value of the post or message
  postTextBox.value = "";

  // Using AJAX
  const request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      console.log(this.response);
    }
  };
  const messageJSON = { content: message };
  request.open("POST", "/create_post"); // path for sending post
  console.log("wowzers");
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(messageJSON));
  postTextBox.focus();
}

// Add event listener to the "Post" button
document.addEventListener("DOMContentLoaded", function () {
  var postButton = document.getElementById("post-button");
  postButton.addEventListener("click", sendPost);
});

//handle the html and display of post here
function displayPost() {}
