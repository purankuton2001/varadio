/* eslint-disable new-cap */
const functions = require("firebase-functions");
const serviceAccount = require("./config/service_account.json");
const path = require("path");
const os = require("os");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const UUID = require("uuid-v4");

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const {Storage} = require("@google-cloud/storage");
const storage = new Storage({keyFilename: "./config/service_account.json"});
admin.firestore().settings({timestampsInSnapshots: true});
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
    .onDelete((snapshot, context) => {
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
    .onDelete((snapshot, context) => {
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
    .onDelete((snapshot, context) => {
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
      const {tags, playLists, records} = post;
      const bucketName = "hitokoto-309511.appspot.com";
      const bucket = storage.bucket(bucketName);
      let command = ffmpeg();

      records.forEach((record) => {
        const filePath =
         `users/${record.artist}/records/${record.storageId}`;
        const fileName = filePath.split("/").pop();
        const tempFilePath = path.join(os.tmpdir(), fileName);
        const audioFile = bucket.file(filePath);
        audioFile.download({destination: tempFilePath}).then(() => {
          if (record.id !== records.length -1) {
            command =
              command
                  .addInput(tempFilePath)
                  .seekInput(record.start)
                  .toFormat("mp3");
          } else {
            const targetFilePath =
            `users/${userId}/posts/${postId}`;
            const targetFileName = targetFilePath.split("/").pop();
            const targetTempFileName = `${targetFileName.replace(/\.[^/.]+$/,
                "")}_output.mp3`;
            const targetTempFilePath =
              path.join(os.tmpdir(), targetTempFileName);
            command
                .addInput(tempFilePath)
                .seekInput(record.start)
                .toFormat("mp3")
                .complexFilter(
                    [`amix=inputs=${records.length}:duration=longest`])
                .output(targetTempFilePath)
                .on("error", function(err) {
                  console.log("An error occurred: " + err.message);
                })
                .on("end", function() {
                  const token = UUID();
                  const targetTranscodedFilePath = `posts/${
                    targetTempFileName}`;
                  const targetStorageFilePath = path.join(
                      path.dirname(targetTranscodedFilePath),
                      targetTempFileName
                  );
                  const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent((targetTranscodedFilePath))}?alt=media&token=${token}`;
                  post.url = downloadURL;
                  bucket.upload(targetTempFilePath, {
                    destination: targetStorageFilePath,
                    metadata: {
                      contentType: "audio/mp3",
                      metadata: {
                        firebaseStorageDownloadTokens: token,
                      },
                    },
                  }).then(() => {
                    tags.forEach((tag) => {
                      firestore.collection("tags").doc(tag)
                          .collection("posts").doc(postId).set(post);
                    });
                    playLists.forEach((playList) => {
                      firestore.collection("users").doc(userId)
                          .collection("playLists").doc(playList).update({
                            posts: admin
                                .firestore.FieldValue.arrayUnion(postId),
                          });
                    });
                    records.forEach((record) => {
                      firestore.collection("records").doc(record.recordId)
                          .collection("posts").doc(postId).set(post);
                    });
                    firestore.collection("posts").doc(postId).set(post);
                    firestore
                        .collection(`users/${userId}/posts`)
                        .doc(postId)
                        .set(post);
                  });
                  console.log("Finished processing");
                })
                .run();
          }
        });
      });
    });
exports.onUsersPostsDelete = functions.firestore
    .document("users/{userId}/posts/{postId}").onDelete((snapshot, context) => {
      const userId = context.params.userId;
      const postId = context.params.postId;
      const post = snapshot.data();
      const {tags, playLists, records} = post;
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
      records.forEach((record) => {
        firestore.collection("records").doc(record.recordId)
            .collection("posts").doc(postId).delete(post);
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
      if (post.records.length > prePost.records.length) {
        const records = post.records
            .filter((i) => prePost.records.indexOf(i) == -1);
        records.forEach((record) => {
          firestore.collection("records").doc(record)
              .collection("posts").doc(postId).set(post);
        });
      }
      if (post.tags.length > prePost.tags.length) {
        const tags = post.tags.filter((i) => prePost.tags.indexOf(i) == -1);
        tags.forEach((tag) => {
          firestore.collection("tags").doc(tag)
              .collection("posts").doc(postId).set(post);
        });
      }
      if (post.records.length < prePost.records.length) {
        const records = prePost.records
            .filter((i) => post.records.indexOf(i) == -1);
        records.forEach((record) => {
          firestore.collection("records").doc(record.recordId)
              .collection("posts").doc(postId).delete();
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
exports.onUsersRecordsCreate = functions.firestore
    .document("users/{userId}/records/{recordId}")
    .onCreate((snapshot, context) => {
      const userId = context.params.userId;
      const recordId = context.params.recordId;
      const post = snapshot.data();
      const {tags, playLists} = post;
      tags.forEach((tag) => {
        firestore.collection("tags").doc(tag)
            .collection("records").doc(recordId).set(post);
      });
      playLists.forEach((playList) => {
        firestore.collection("users").doc(userId)
            .collection("records").doc(playList).update({
              posts: admin.firestore.FieldValue.arrayUnion(recordId),
            });
      });
      firestore.collection("records").doc(recordId).set(post);
    });


exports.onUsersRecordsDelete = functions.firestore
    .document("users/{userId}/records/{recordId}")
    .onDelete((snapshot, context) => {
      const userId = context.params.userId;
      const recordId = context.params.recordId;
      const post = snapshot.data();
      const {tags, playLists} = post;
      firestore.collection("users/{userId}/posts/{recordId}/likes")
          .get().then((snapshot) => {
            snapshot.forEach((doc) => {
              firestore.collection(`users/${doc.id}/likes`)
                  .doc(recordId).delete();
            });
          });
      firestore.collection("users/{userId}/posts/{recordId}/dislikes")
          .get().then((snapshot) => {
            snapshot.forEach((doc) => {
              firestore.collection(`users/${doc.id}/dislikes`)
                  .doc(recordId).delete();
            });
          });

      tags.forEach((tag) => {
        firestore.collection("tags").doc(tag)
            .collection("records").doc(recordId).delete(post);
      });
      playLists.forEach((playList) => {
        firestore.collection("users").doc(userId)
            .collection("playLists").doc(playList).update({
              records: admin.firestore.FieldValue.arrayRemove(recordId),
            });
      });
      firestore.collection("records").doc(recordId).delete(post);
    });
exports.onUsersRecordsUpdate = functions.firestore
    .document("users/{userId}/records/{recordId}")
    .onUpdate((snapshot, context) => {
      const userId = context.params.userId;
      const recordId = context.params.recordId;
      const prePost = snapshot.before.data();
      const post = snapshot.after.data();
      if (post.tags.length > prePost.tags.length) {
        const tags = post.tags.filter((i) => prePost.tags.indexOf(i) == -1);
        tags.forEach((tag) => {
          firestore.collection("tags").doc(tag)
              .collection("records").doc(recordId).set(post);
        });
      }
      if (post.tags.length < prePost.tags.length) {
        const tags = prePost.tags.filter((i) => post.tags.indexOf(i) == -1);
        tags.forEach((tag) => {
          firestore.collection("tags").doc(tag)
              .collection("records").doc(recordId).delete();
        });
      }
      if (post.playLists.length > prePost.playLists.length) {
        const playLists = post.playLists
            .filter((i) => prePost.playLists.indexOf(i) == -1);
        playLists.forEach((playList) => {
          firestore.collection("users").doc(userId)
              .collection("playLists").doc(playList).update({
                records: admin.firestore.FieldValue.arrayUnion(recordId),
              });
        });
      }
      if (post.playLists.length < prePost.playLists.length) {
        const playLists = prePost.playLists
            .filter((i) => post.playLists.indexOf(i) == -1);
        playLists.forEach((playList) => {
          firestore.collection("users").doc(userId)
              .collection("playLists").doc(playList).update({
                records: admin.firestore.FieldValue.arrayRemove(recordId),
              });
        });
      }
      firestore.collection("records").doc(recordId).set(post);
    });


