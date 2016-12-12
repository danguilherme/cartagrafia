/**
 * - game
 *    - currentPlayer
 *    - currentCard
 *    - players (lista)
 *      - username
 *      - hand (lista)
 */

function createRoom() {
  
}

function createGame() {
  // A post entry.
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    starCount: 0,
    authorPic: picture
  };

  // Get a key for a new Post.
  var gameKey = firebase.database().ref().child('games').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/games/' + gameKey] = postData;

  return firebase.database().ref().update(updates);
}