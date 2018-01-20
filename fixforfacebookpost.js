function sub(string, startIndex, numberOfCharsToChopOffTheEnd) {
  //Chop of specific number of characters from the start and the end of a string
  return string.substring(
    startIndex,
    string.length - numberOfCharsToChopOffTheEnd
  );
}

function maxLength(string, max) {
  //Shorten a string to a specific length
  if (string.length >= max) {
    return string.substring(0, max) + "...";
  } else {
    return string;
  }
}

function formatDate(date) {
  //Convert a timestamp in millis to a formatted date
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  return day + " " + monthNames[monthIndex] + " " + year;
}

function formatLinks(text) {
  //Convert plain text link to a html anchor
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  var text1 = text.replace(exp, "<a href='$1'>$1</a>");
  var exp2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  return text1.replace(exp2, '$1<a target="_blank" href="http://$2">$2</a>');
}

function printPost(post) {
  //Take a post object and apply it to an html template on the page
  var portraitUrl = post.portraitUrl;
  var subject = post.subject;
  var plaintext = post.plaintext;
  var text = post.text;
  var author = post.author;
  var millis = post.millis;
  var containerId = post.containerId;
  var template = document
    .getElementById("journodoPostTemplate")
    .content.cloneNode(true);
  template.querySelector("#journodoPostPortrait").src = portraitUrl;
  template.querySelector("#journodoPostPortrait").alt = author;
  template.querySelector("#journodoPostAuthorName").innerHTML = author;
  template.querySelector("#journodoPostTimestamp").innerHTML = formatDate(
    new Date(parseInt(millis))
  );
  template.querySelector("#journodoPostText").innerHTML = text;
  //template.querySelector("#journodoPostFacebookShareIcon").href = "http://www.facebook.com/sharer.php?u=" + "this is a test";
  buildFacebookLink(template, plaintext);
  template.querySelector("#journodoPostGooglePlusShareIcon").href =
    "https://plus.google.com/share?url=" + plaintext;
  template.querySelector("#journodoPostLinkedInShareIcon").href =
    "http://www.linkedin.com/shareArticle?mini=true&amp;url=" + plaintext;
  template.querySelector("#journodoPostRedditShareIcon").href =
    "http://reddit.com/submit?url=" + plaintext + "&amp;title=" + subject;
  template.querySelector("#journodoPostTwitterShareIcon").href =
    "https://twitter.com/share?url=" + plaintext + "&amp;text=" + plaintext;
  template.querySelector("#journodoPostVKShareIcon").href =
    "http://vkontakte.ru/share.php?url=" + plaintext;
  template.querySelector("#journodoPostEmailShareIcon").href =
    "mailto:?Subject=" + subject + "&amp;Body=" + plaintext;
  document.getElementById(containerId).appendChild(template);
}
function buildFacebookLink(template, data) {
  /*
    <a href="#" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(location.href),'facebook-share-dialog','width=626,height=436');return false;">Share on Facebook</a>
  */
  var url = "http://www.facebook.com/sharer.php?u=";
  var encodedURL = encodeURIComponent(url + data);
  template.querySelector(
    "#journodoPostFacebookShareIcon"
  ).onclick = function() {
    window.open(
      "https://www.facebook.com/sharer/sharer.php?u=" + encodedURL,
      "facebook-share-dialog",
      "width=626,height=436"
    );
    return false;
  };
}

function populatePage(followingUrl) {
  //This method is called from an html page the url specified is used to gather posts from each profile being followed
  var following = 0;
  var processedFollowing = 0;
  var unsortedPosts = [];
  var sortedPosts = [];

  followingHandler = function(err, json) {
    //Take json from journodo-following.json and fetch json data from each profile
    if (err !== null) {
      alert(err);
    } else {
      following = json.profiles.length;
      for (var h = 0; h < following; h++) {
        getJSON(json.profiles[h], sortHandler);
      }
    }
  };

  sortHandler = function(err, json) {
    //Join json data from each profile and sort it all by timestamp descending and then print it on the page
    if (err !== null) {
      alert(err);
    } else {
      var author = json.author;
      var portrait = json.portrait;
      for (var i = 0; i < json.posts.length; i++) {
        var text = json.posts[i].text;
        var timestamp = json.posts[i].timestamp;
        var post = {
          portraitUrl: sub(JSON.stringify(portrait), 1, 1),
          subject: maxLength(sub(JSON.stringify(text), 1, 1), 20),
          plaintext: sub(JSON.stringify(text), 1, 1),
          text: formatLinks(sub(JSON.stringify(text), 1, 1)),
          author: sub(JSON.stringify(author), 1, 1),
          millis: JSON.stringify(timestamp),
          containerId: "journodoPostsContainer"
        };
        unsortedPosts.push(post);
      }
      processedFollowing++;
      if (processedFollowing === following) {
        sortedPosts = unsortedPosts.sort(function(a, b) {
          return a.millis > b.millis;
        });
        for (var j = 0; j < sortedPosts.length; j++) {
          printPost(sortedPosts[j]);
        }
      }
    }
  };

  var getJSON = function(url, jsonHandler) {
    //Get json from a remote json file and then pass it to a handler to be processed
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        jsonHandler(null, xhr.response);
      } else {
        jsonHandler(status);
      }
    };
    xhr.send();
  };

  getJSON(followingUrl, followingHandler); //Trigger the first json call which will use followingHandler that creates handlers to process json for each profile
}
