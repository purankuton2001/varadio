/* eslint-disable require-jsdoc */
/* eslint-disable new-cap */
const functions = require("firebase-functions");
const serviceAccount = require("./config/service_account.json");
const path = require("path");
const os = require("os");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const algoliasearch = require("algoliasearch");
const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
const ALGOLIA_INDEX_NAME = "Varadio";
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

const UUID = require("uuid-v4");

const Moralis = require("moralis/node");
const serverUrl ="https://ddb0jtowzik9.usemoralis.com:2053/server";
const appId = "PDP4ImPSjTjyRufcSgNNVreBmZ5m7Bqw0BKdxMHV";
Moralis.start({serverUrl, appId});
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const {Storage} = require("@google-cloud/storage");
const storage = new Storage({keyFilename: "./config/service_account.json"});
const messaging = admin.messaging();
admin.firestore().settings({timestampsInSnapshots: true});
const firestore = admin.firestore();
function sendNotification(type,
    from,
    to,
    where = {}) {
  switch (type) {
    case "like": {
      where.artist = to;
      const message = {
        notification: {
          data: {
            type,
            where: JSON.stringify(where),
          },
          title: "あなたの投稿にいいねがつきました！",
          body: `${from.name}さんがあなたの投稿にいいねをしました。`,
          imageUrl: from.profileImage,
        }, tokens: to.tokens};
      firestore.collection(`users/${to.id}/notification`).add({
        notification: message.notification,
        createdAt: new Date(),
        where,
        type,
      });
      messaging.sendMulticast(message);
      break;}
    case "disLike": {
      where.artist = to;
      const message = {
        data: {
          type,
          where: JSON.stringify(where),
        },
        notification: {
          title: "あなたの投稿に悪いねがつきました！",
          body: `${from.name}さんがあなたの投稿に悪いねをしました。`,
          imageUrl: from.profileImage,
        }, tokens: to.tokens};
      firestore.collection(`users/${to.id}/notification`).add({
        notification: message.notification,
        createdAt: new Date(),
        where,
        type,
      });
      messaging.sendMulticast(message);
      break;}
    case "comment": {
      where.artist = to;
      const message = {
        notification: {
          data: {
            type, where: JSON.stringify(where)},
          title: `${from.name}さんがあなたの投稿にコメントをしました！`,
          body: where.comment,
          imageUrl: from.profileImage,
        }, tokens: to.tokens};
      firestore.collection(`users/${to.id}/notification`).add({
        notification: message.notification,
        createdAt: new Date(),
        where,
        type,
      });
      messaging.sendMulticast(message);
      break;}
    case "reply": {
      const message = {
        data: {type, where: JSON.stringify(where)},
        notification: {
          title: `${from.name}さんがあなたのコメントに返信しました！`,
          body: where.comment,
          imageUrl: from.profileImage,
        }, tokens: to.tokens};
      firestore.collection(`users/${to.id}/notification`).add({
        notification: message.notification,
        createdAt: new Date(),
        where,
        type,
      });
      messaging.sendMulticast(message);
      break;}
    case "sell": {
      where.artist = to;
      const message = {
        data: {type, where: JSON.stringify(where)},
        notification: {
          title: "レコードが売れました！",
          body: `${from.name}さんがあなたのレコードを購入しました。`,
          imageUrl: from.profileImage,
        }, tokens: to.tokens};
      firestore.collection(`users/${to.id}/notification`).add({
        notification: message.notification,
        createdAt: new Date(),
        where,
        type,
      });
      messaging.sendMulticast(message);
      break;}
    case "follow": {
      const message = {
        data: {
          type,
          userId: from.id,
        },
        notification: {
          title: "フォローされました！",
          body: `${from.name}さんがあなたをフォローしました。`,
          imageUrl: from.profileImage,
        }, tokens: to.tokens};
      firestore.collection(`users/${to.id}/notification`).add({
        notification: message.notification,
        createdAt: new Date(),
        where,
        type,
        userId: from.id,
      });
      messaging.sendMulticast(message);
      break;}
  }
}
exports.onUsersAcountCreate = functions.firestore
    .document("users/{userId}")
    .onCreate((snapshot, context) => {
      const userId = context.params.userId;
      firestore.collection("ranking").get().then((posts) => {
        posts.forEach((post) => {
          const data = post.data();
          firestore.collection(`users/${userId}/recommends`)
              .doc(post.id).set(data);
        });
      });
    });
exports.onUsersAcountUpdate = functions.firestore
    .document("users/{userId}")
    .onUpdate((snapshot, context) => {
      const userId = context.params.userId;
      const profile = snapshot.after.data();
      firestore.collection(`users/${userId}/likes`).get().then((likes) => {
        likes.forEach((like) => {
          firestore.collection(`posts/${like.id}/likes`)
              .doc(userId).set(profile);
        });
      });
      firestore
          .collection(`users/${userId}/dislikes`)
          .get()
          .then((dislikes) => {
            dislikes.forEach((dislike) => {
              firestore.collection(`posts/${dislike.id}/dislikes`)
                  .doc(userId).set(profile);
            });
          });
      firestore.collection(`users/${userId}/follows`).get().then((follows) => {
        follows.forEach((follow) => {
          firestore.collection(`users/${follow.id}/followers`)
              .doc(userId).set(profile);
        });
      });
      firestore
          .collection(`users/${userId}/followers`)
          .get()
          .then((followers) => {
            followers.forEach((follower) => {
              firestore.collection(`users/${follower.id}/follows`)
                  .doc(userId).set(profile);
            });
          });
    });
exports.onUsersCommentsCreate = functions.firestore
    .document("users/{userId}/comments/{commentId}")
    .onCreate((snapshot, context) => {
      const userId = context.params.userId;
      const commentId = context.params.commentId;
      const comment = snapshot.data();
      firestore.doc(`users/${userId}`).get().then((doc) => {
        const from = doc.data();
        const {to} = comment;
        if (!comment.replyId) {
          const ref = firestore
              .doc(`posts/${comment.itemId}/comment/${commentId}`);
          ref.set(comment);
          comment.id=commentId;
          sendNotification("comment",
              from,
              to,
              comment);
        } else {
          const ref = firestore
              .collection(`posts/${comment.itemId}/comment`)
              .doc(`/${comment.replyId}/reply/${commentId}`);
          ref.set(comment);
          comment.id=commentId;
          sendNotification("reply",
              from,
              to,
              comment);
        }
      });
    });
exports.onUsersCommentsDelete = functions.firestore
    .document("users/{userId}/comments/{commentId}")
    .onDelete((snapshot, context) => {
      const commentId = context.params.commentId;
      const comment = snapshot.data();
      const ref = firestore
          .doc(`posts/${comment.itemId}/comment/${commentId}`);

      ref.delete();
    });
exports.onUsersfollowsCreate = functions.firestore
    .document("users/{userId}/follows/{followId}")
    .onCreate((snapshot, context) => {
      const userId = context.params.userId;
      const followId = context.params.followId;
      const profile = snapshot.data();
      firestore.doc(`users/${userId}`)
          .get()
          .then((user) => {
            const userProfile = user.data();
            sendNotification("follow",
                userProfile,
                profile);
            firestore.collection(`users/${followId}/followers`)
                .doc(userId).set(userProfile);
          });
    });
exports.onUsersfollowsDelete = functions.firestore
    .document("users/{userId}/follows/{followId}")
    .onDelete((snapshot, context) => {
      const userId = context.params.userId;
      const followId = context.params.followId;
      firestore.collection(`users/${followId}/followers`)
          .doc(userId).delete();
    });

exports.onUsersplayListsCreate = functions.firestore
    .document("users/{userId}/playLists/{playListId}")
    .onCreate((snapshot, context) => {
      const playListId = context.params.playListId;
      const playList = snapshot.data();
      firestore.collection("playLists")
          .doc(playListId).set(playList);
    });
exports.onUsersplayListsUpdate = functions.firestore
    .document("users/{userId}/playLists/{playListId}")
    .onUpdate((snapshot, context) => {
      const playListId = context.params.playListId;
      const prePlayList = snapshot.before.data();
      const playList = snapshot.after.data();
      if (playList.posts.length > prePlayList.posts.length) {
        const posts = playList.posts
            .filter((i) => prePlayList.posts.indexOf(i) == -1);
        posts.forEach((post) => {
          firestore.doc(`posts/${post}`)
              .get()
              .then((posDoc) => {
                const posData = posDoc.data();
                posData.artist.collection("posts").doc(post).update({
                  playLists: admin.firestore.FieldValue.arrayUnion(playListId),
                });
              });
        });
      }
      if (playList.posts.length < prePlayList.posts.length) {
        const posts = prePlayList.posts
            .filter((i) => playList.posts.indexOf(i) == -1);
        posts.forEach((post) => {
          firestore.doc(`posts/${post}`)
              .get()
              .then((posDoc) => {
                const posData = posDoc.data();
                posData.artist.collection("posts").doc(post).update({
                  playLists: admin.firestore.FieldValue.arrayRemove(playListId),
                });
              });
        });
      }
      firestore.collection("playLists")
          .doc(playListId).set(playList);
    });
exports.onUsersplayListsDelete = functions.firestore
    .document("users/{userId}/playLists/{playListId}")
    .onDelete((snapshot, context) => {
      const playListId = context.params.playListId;
      const playList = snapshot.data();
      firestore.collection("playLists")
          .doc(playListId).delete();

      playList.posts.forEach((post) => {
        firestore.doc(`posts/${post}`)
            .get()
            .then((posDoc) => {
              const posData = posDoc.data();
              posData.artist.collection("posts").doc(post).update({
                playLists: admin.firestore.FieldValue.arrayRemove(playListId),
              });
            });
      });
    });
exports.onUsersLikesCreate = functions.firestore
    .document("users/{userId}/likes/{postId}")
    .onCreate((snapshot, context) => {
      const {postId, userId} = context.params;
      const post = snapshot.data();
      firestore.doc(`users/${userId}`).get().then((doc) => {
        const profile = doc.data();
        firestore.doc(`users/${post.artist.id}`).get().then((res) => {
          const to = res.data();
          firestore
              .collection("posts")
              .doc(postId)
              .collection("likes")
              .doc(userId)
              .set(profile);
          post.id = postId;
          sendNotification("like",
              profile,
              to,
              post);
        });
      });
    });
exports.onUsersLikesDelete = functions.firestore
    .document("users/{userId}/likes/{postId}")
    .onDelete((snapshot, context) => {
      const {postId, userId} = context.params;
      firestore
          .collection("posts")
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
      firestore.doc(`users/${userId}`).get().then((doc) => {
        const profile = doc.data();
        firestore.doc(`users/${post.artist.id}`).get().then((res) => {
          const to = res.data();
          firestore
              .collection("posts")
              .doc(postId)
              .collection("dislikes")
              .doc(userId)
              .set(profile);
          post.id = postId;
          sendNotification("disLike",
              profile,
              to,
              post);
        });
      });
    });
exports.onUsersDisLikesDelete = functions.firestore
    .document("users/{userId}/dislikes/{postId}")
    .onDelete((snapshot, context) => {
      const {postId, userId} = context.params;
      firestore
          .collection("posts")
          .doc(postId)
          .collection("dislikes")
          .doc(userId)
          .delete();
    });
exports.onUsersSellsCreate = functions.firestore
    .document("users/{userId}/sells/{sellId}").onCreate((snapshot, context) => {
      const userId = context.params.userId;
      const sellId = context.params.sellId;
      const sell = snapshot.data();
      const {transactionId} = sell;
      const MarketItemSellAdd = Moralis.Object.extend("MarketItemSellAdd");
      const query = new Moralis.Query(MarketItemSellAdd);
      query.equalTo("transaction_hash", transactionId);
      setTimeout(() => {
        query.find().then((result) => {
          const itemId = result[0].get("sellId");
          firestore
              .collection("users")
              .doc(userId)
              .collection("sells")
              .doc(sellId)
              .update({sellId: itemId});
        });
      }, 30000);
    });
exports.onUsersSellsUpdate = functions.firestore
    .document("users/{userId}/sells/{sellId}").onUpdate((snapshot, context) => {
      const sellId = context.params.sellId;
      const sell = snapshot.after.data();
      firestore
          .collection("sells")
          .doc(sellId)
          .set(sell)
          .catch((error) => {
            console.log(error);
          });
      firestore
          .collection("records")
          .doc(sell.recordId)
          .collection("sells")
          .doc(sellId)
          .set(sell)
          .catch((error) => {
            console.log(error);
          });
    });
exports.onUsersSellsDelete = functions.firestore
    .document("users/{userId}/sells/{sellId}").onDelete((snapshot, context) => {
      const sellId = context.params.sellId;
      const sell = snapshot.after.data();
      firestore
          .collection("sells")
          .doc(sellId)
          .delete()
          .catch((error) => {
            console.log(error);
          });
      firestore
          .collection("records")
          .doc(sell.recordId)
          .collection("sells")
          .delete()
          .catch((error) => {
            console.log(error);
          });
    });

exports.onUsersBuyCreate = functions.firestore.
    document("users/{userId}/buys/{buyId}").onCreate((snapshot, context) => {
      const userId = context.params.userId;
      const data = snapshot.data();
      const {item, amount, record} = data;
      firestore.doc(`users/${userId}`).get().then((x) => {
        const from = x.data();
        firestore.doc(`users/${item.seller.id}`).get().then((y) => {
          const to = y.data();
          const ref = firestore
              .collection("users")
              .doc(item.seller.id)
              .collection("sells")
              .doc(item.id);
          const newAmount = item.amount - amount;
          newAmount > 0 ? ref.update({amount: newAmount}) : ref.delete();
          sendNotification("sell", from, to, record);
        }
        );
      }
      );
    });

exports.onPostsWrite = functions.firestore
    .document("posts/{postId}").onWrite((snapshot, context) => {
      const post = snapshot.after.data();
      const postId = context.params.postId;
      post.objectID = postId;
      const index = client.initIndex(ALGOLIA_INDEX_NAME);
      index.saveObject(post);
    });

exports.onUsersPostsCreate = functions.firestore
    .document("users/{userId}/posts/{postId}").onCreate((snapshot, context) => {
      const userId = context.params.userId;
      const postId = context.params.postId;
      const post = snapshot.data();
      const {tags, playLists, records, transactionId} = post;
      const bucketName = "hitokoto-309511.appspot.com";
      const bucket = storage.bucket(bucketName);
      const MarketItemPosted = Moralis.Object.extend("MarketItemPosted");
      const query = new Moralis.Query(MarketItemPosted);
      query.equalTo("transaction_hash", transactionId);
      query.find().then((result) => {
        const itemId = result[0].get("postId");
        firestore
            .doc(`users/${userId}/posts/${postId}`)
            .update({postId: itemId});
      });
      let command = ffmpeg();

      records.forEach((record) => {
        console.log(record);
        const filePath =
         `users/${record.artist}/records/${record.storageId}`;
        const fileName = filePath.split("/").pop();
        const tempFilePath = path.join(os.tmpdir(), fileName);
        const audioFile = bucket.file(filePath);
        audioFile
            .download({destination: tempFilePath})
            .then(() => {
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
                const targetTempFileName =
                `${targetFileName.replace(/\.[^/.]+$/, "")}_output.mp3`;
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
                      })
                          .then(() => {
                            tags.forEach((tag) => {
                              firestore.collection("tags").doc(tag)
                                  .collection("posts")
                                  .doc(postId)
                                  .set(post);
                            });
                            playLists.forEach((playList) => {
                              firestore.collection("users").doc(userId)
                                  .collection("playLists")
                                  .doc(playList)
                                  .update(
                                      {
                                        posts: admin
                                            .firestore
                                            .FieldValue
                                            .arrayUnion(postId),
                                      });
                            });
                            records.forEach((record) => {
                              firestore
                                  .collection("records")
                                  .doc(record.recordId)
                                  .collection("posts")
                                  .doc(postId)
                                  .set(post);
                            });
                            firestore
                                .collection(`users/${userId}/posts`)
                                .doc(postId)
                                .update({url: downloadURL});
                          })
                          .catch(() => {
                            console.log("failed post upload");
                          });
                      console.log("Finished processing");
                    })
                    .run();
              }
            })
            .catch(() => {
              console.log("failed audioFile downlowd");
            });
      });
    });
exports.onUsersPostsDelete = functions.firestore
    .document("users/{userId}/posts/{postId}").onDelete((snapshot, context) => {
      const userId = context.params.userId;
      const postId = context.params.postId;
      const post = snapshot.data();
      const {tags, playLists, records} = post;
      firestore.collection(`posts/${postId}/likes`)
          .get().then((snapshot) => {
            snapshot.forEach((doc) => {
              firestore.collection(`users/${doc.id}/likes`)
                  .doc(postId).delete();
            });
          });
      firestore.collection(`posts/${postId}/dislikes`)
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
      const postId = context.params.postId;
      const post = snapshot.after.data();
      post.records.forEach((record) => {
        firestore.collection("records").doc(record.recordId)
            .collection("posts").doc(postId).set(post);
      });
      post.tags.forEach((tag) => {
        firestore.collection("tags").doc(tag)
            .collection("posts").doc(postId).set(post);
      });
      firestore.collection("posts").doc(postId).collection("likes")
          .get()
          .then((snapshot) => {
            snapshot.forEach((user) => {
              firestore
                  .collection("users")
                  .doc(user.id)
                  .collection("likes")
                  .doc(postId)
                  .set(post);
            });
          });
      firestore.collection("posts").doc(postId).collection("dislikes")
          .get()
          .then((snapshot) => {
            snapshot.forEach((user) => {
              firestore
                  .collection("users")
                  .doc(user.id)
                  .collection("likes")
                  .doc(postId)
                  .set(post);
            });
          });
      firestore.collection("posts").doc(postId).set(post);
    });
exports.onUsersRecordsCreate = functions.firestore
    .document("users/{userId}/records/{recordId}")
    .onCreate((snapshot, context) => {
      const userId = context.params.userId;
      const recordId = context.params.recordId;
      const post = snapshot.data();
      const {tags, playLists, transactionId} = post;
      const MarketItemCreated = Moralis.Object.extend("MarketItemCreated");
      const query = new Moralis.Query(MarketItemCreated);
      query.equalTo("transaction_hash", transactionId);
      query.find().then((result) => {
        const itemId = result[0].get("itemId");
        firestore
            .doc(`users/${userId}/records/${recordId}`)
            .update({itemId});
      });
      tags.forEach((tag) => {
        firestore.collection("tags").doc(tag)
            .collection("records").doc(recordId).set(post);
      });
      playLists.forEach((playList) => {
        firestore.collection("users").doc(userId)
            .collection("playLists").doc(playList).update({
              records: admin.firestore.FieldValue.arrayUnion(recordId),
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


