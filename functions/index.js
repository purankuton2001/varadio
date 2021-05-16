const functions = require("firebase-functions");
const serviceAccount = require("./config/service_account.json");

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const firestore = admin.firestore();

exports.onUsersplayListsUpdate = functions.firestore
    .document("users/{userId}/playLists/{playListId}")
    .onUpdate((snapshot, context) => {
      const playListId = context.params.playListId;
      const playList = snapshot.after.data();
      firestore.collection("playLists")
          .doc(playListId).set(playList);
    });
exports.onUsersplayListsCreate = functions.firestore
    .document("users/{userId}/playLists/{playListId}")
    .onCreate((snapshot, context) => {
      const playListId = context.params.playListId;
      const playList = snapshot.data();
      firestore.collection("playLists")
          .doc(playListId).set(playList);
    });
exports.onUsersplayListsDelete = functions.firestore
    .document("users/{userId}/playLists/{playListId}")
    .onCreate((snapshot, context) => {
      const playListId = context.params.playListId;
      firestore.collection("playLists")
          .doc(playListId).delete();
    });
exports.onUsersLikesCreate = functions.firestore
    .document("users/{userId}/likes/{postId}")
    .onCreate((snapshot, context) => {
      const {postId, userId} = context.params;
      const post = snapshot.data();
      const artist = post.artist.data();
      const id = artist.id;
      firestore.doc(`users/${userId}`).get().then((doc) => {
        firestore.collection("users")
            .doc(id).collection("posts")
            .doc(postId)
            .collection("likes")
            .doc(userId)
            .set(doc);
      });
    });
exports.onUsersLikesDelete = functions.firestore
    .document("users/{userId}/likes/{postId}")
    .onCreate((snapshot, context) => {
      const {postId, userId} = context.params;
      const post = snapshot.data();
      const artist = post.artist.data();
      const id = artist.id;
      firestore.collection("users")
          .doc(id).collection("posts")
          .doc(postId)
          .collection("likes")
          .doc(userId)
          .delete();
    });
exports.onUsersDisLikesCreate = functions.firestore
    .document("users/{userId}/dislikes/{postId}")
    .onCreate((snapshot, context) => {
      const {postId, userId} = context.params;
      const post = snapshot.data();
      const artist = post.artist.data();
      const id = artist.id;
      firestore.doc(`users/${userId}`).get().then((doc) => {
        firestore.collection("users")
            .doc(id).collection("posts")
            .doc(postId)
            .collection("dislikes")
            .doc(userId)
            .set(doc);
      });
    });
exports.onUsersDisLikesDelete = functions.firestore
    .document("users/{userId}/likes/{postId}")
    .onCreate((snapshot, context) => {
      const {postId, userId} = context.params;
      const post = snapshot.data();
      const artist = post.artist.data();
      const id = artist.id;
      firestore.collection("users")
          .doc(id).collection("posts")
          .doc(postId)
          .collection("dislikes")
          .doc(userId)
          .delete();
    });

exports.onUsersPostsCreate = functions.firestore
    .document("users/{userId}/posts/{postId}").onCreate((snapshot, context) => {
      const userId = context.params.userId;
      const postId = context.params.postId;
      const post = snapshot.data();
      const {tags, playLists} = post;
      tags.forEach((tag) => {
        firestore.collection("tags").doc(tag)
            .collection("posts").doc(postId).set(post);
      });
      playLists.forEach((playList) => {
        firestore.collection("users").doc(userId)
            .collection("playLists").doc(playList).update({
              posts: admin.firestore.FieldValue.arrayUnion(postId),
            });
      });
      firestore.collection("posts").doc(postId).set(post);
    });
exports.onUsersPostsDelete = functions.firestore
    .document("users/{userId}/posts/{postId}").onDelete((snapshot, context) => {
      const userId = context.params.userId;
      const postId = context.params.postId;
      const post = snapshot.data();
      const {tags, playLists} = post;
      firestore.collection("users/{userId}/posts/{postId}/likes")
          .get().then((snapshot) => {
            snapshot.forEach((doc) => {
              firestore.collection(`users/${doc.id}/likes`)
                  .doc(postId).delete();
            });
          });
      firestore.collection("users/{userId}/posts/{postId}/dislikes")
          .get().then((snapshot) => {
            snapshot.forEach((doc) => {
              firestore.collection(`users/${doc.id}/dislikes`)
                  .doc(postId).delete();
            });
          });
      tags.forEach((tag) => {
        firestore.collection("tags").doc(tag)
            .collection("posts").doc(postId).delete(post);
      });
      playLists.forEach((playList) => {
        firestore.collection("users").doc(userId)
            .collection("playLists").doc(playList).update({
              posts: admin.firestore.FieldValue.arrayRemove(postId),
            });
      });
      firestore.collection("posts").doc(postId).delete(post);
    });
exports.onUsersPostsUpdate = functions.firestore
    .document("users/{userId}/posts/{postId}").onUpdate((snapshot, context) => {
      const userId = context.params.userId;
      const postId = context.params.postId;
      const prePost = snapshot.before.data();
      const post = snapshot.after.data();
      if (post.tags.length > prePost.tags.length) {
        const tags = post.tags.filter((i) => prePost.tags.indexOf(i) == -1);
        tags.forEach((tag) => {
          firestore.collection("tags").doc(tag)
              .collection("posts").doc(postId).set(post);
        });
      }
      if (post.tags.length < prePost.tags.length) {
        const tags = prePost.tags.filter((i) => post.tags.indexOf(i) == -1);
        tags.forEach((tag) => {
          firestore.collection("tags").doc(tag)
              .collection("posts").doc(postId).delete();
        });
      }
      if (post.playLists.length > prePost.playLists.length) {
        const playLists = post.playLists
            .filter((i) => prePost.playLists.indexOf(i) == -1);
        playLists.forEach((playList) => {
          firestore.collection("users").doc(userId)
              .collection("playLists").doc(playList).update({
                posts: admin.firestore.FieldValue.arrayUnion(postId),
              });
        });
      }
      if (post.playLists.length < prePost.playLists.length) {
        const playLists = prePost.playLists
            .filter((i) => post.playLists.indexOf(i) == -1);
        playLists.forEach((playList) => {
          firestore.collection("users").doc(userId)
              .collection("playLists").doc(playList).update({
                posts: admin.firestore.FieldValue.arrayRemove(postId),
              });
        });
      }
      firestore.collection("posts").doc(postId).set(post);
    });


