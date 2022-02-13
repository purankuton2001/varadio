import React, {useContext, useState, useEffect, useRef} from 'react';
import {TouchableOpacity} from 'react-native';
import {StyleSheet, View, Text, Image, FlatList, Keyboard} from 'react-native';
import { Input } from 'react-native-elements';
import PostButton from '../Icon/PostButton';
import { PlayerContext } from '../../App';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import {dateToString} from '../utils';

export default function CommentListScreen() {
  let textInput;
  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
  }, []);

  const [keyboardStatus, setKeyboardStatus] = useState(undefined);
  const [firstTouch, setFirstTouch] = useState(undefined);
  const _keyboardDidShow = () => {
    setFirstTouch(true);
    setKeyboardStatus(true)};
  const _keyboardDidHide = () => setKeyboardStatus(false);

  const replyPress = item => {
    setReply(item);
    textInput.focus();
    setComment("");
  }
  function replyItem({item}) {
    return (
        <View style={styles.replyItem}>
          <Image
            source={{uri: item?.createdBy.profileImage}}
            style={styles.image}
          />
          <View style={styles.right}>
            <View style={styles.header}>
              <Text style={styles.username}>{item?.createdBy.name}</Text>
            </View>
            <View style={styles.center}>
              <Text style={styles.description}>
                <Text>{item?.comment}</Text>
              </Text>
              <View style = {styles.bottom}>
                <Text style={styles.info}>{dateToString(item?.createdAt)}</Text>
              </View>
            </View>
            <View>
            </View>
          </View>
        </View>
    );
  }
  function CommentItem({item}) {
    const [replyAll, setReplyAll] = useState(false);
    const [replyItems, setReplyItems] = useState([]);
    const [replyArray, setReplyArray] = useState([]);
    const [replyValue, setReplyValue] = useState(0);
    const replyRef = firestore()
    .collection(`posts/${post.id}/comment/${item.id}/reply`);
    let count = 0;

    useEffect(() => {
      const unsubscribe =
      replyRef
      .onSnapshot(replys => {
        setReplyValue(replys.size);
        const array = [];
        replys.forEach((rep) => {
          const data = rep.data();
          data.createdBy.get().then((doc) => {
            const createdBy = doc.data();
            array.push({...data, createdAt: data.createdAt.toDate(), createdBy});
            setReplyArray(array);
          });
        })
      });
      return unsubscribe;
    }, [item]);
    const replyDetail = () => {
      if(replyAll)
      {count = 0;
        setReplyItems([]);
       setReplyAll(false);
      }
      else {
        count++;
        if(replyArray.length > 5*count){
          setReplyItems(replyArray.slice(0, 5*count));
        }
        else{
          setReplyItems(replyArray);
          setReplyAll(true);
        }
      }
    }
    return (
      <View style={styles.itemContainer}>
        <View style={styles.item}>
          <Image
            source={{uri: item?.createdBy.profileImage}}
            style={styles.image}
          />
          <View style={styles.right}>
            <View style={styles.header}>
              <Text style={styles.username}>{item?.createdBy.name}</Text>
            </View>
            <View style={styles.center}>
              <Text style={styles.description}>
                <Text>{item?.comment}</Text>
              </Text>
              <View style = {styles.bottom}>
                <Text style={styles.info}>{dateToString(item?.createdAt)}</Text>
                <TouchableOpacity onPress={() => {replyPress(item)}}>
                  <Text style={styles.reply}>返信</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View>
            </View>
          </View>
        </View>
        <FlatList
          data={replyItems}
          listKey={item => item.id}
          renderItem={replyItem}
        />
        {replyValue !== 0 &&
        <TouchableOpacity onPress={replyDetail} style={{left: replyItems.length > 0 ? 132: 84}}>
          <Text style={styles.rateValue}>返信を{replyAll?"隠す":"見る"}({replyValue})</Text>
        </TouchableOpacity>}
      </View>
    );
  }

  useEffect(() => {
    const unsubscribe = firestore().collection(`posts/${post.id}/comment`)
    .onSnapshot(comments => {
      const postComments = [];
      comments.forEach((com) => {
        const data = com.data();
        data.createdBy.get().then(doc => {
          const createdBy = doc.data();
          postComments.push({...data, id:com.id, createdBy, createdAt: data.createdAt.toDate()});
          console.log(commentsList);
          setCommentsList(postComments);
        })
      });
    });
    return unsubscribe;
  },[post]);
  const {state} = useContext(PlayerContext);
  const {items, index} = state;
  const post = items[index];
  const [reply, setReply] = useState(false);
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState("");

  const emmitPress = () => {
    if(auth().currentUser)
    {
      firestore()
      .collection(`users/${auth().currentUser.uid}/comments`)
      .add({
          itemId: post.id,
          createdAt: new Date(),
          replyId: reply? reply.id : null,
          createdBy: firestore().doc(`users/${auth().currentUser.uid}`),
          comment,
          })
      setComment("");
      setReply(false);
    }
  }
  return (
    <View style={styles.container}>
      <FlatList
       data={commentsList}
       renderItem={({item}) => <CommentItem item={item} />}
       listKey={item => item.id}
       keyExtractor={item => item.id}
       />
      <View style={[styles.input, {bottom: firstTouch ? 316 : 68}]}>
        <Input
           ref={input => {textInput = input}}
           placeholder={reply? reply.createdBy.name + "にひとこと" : "何かひとこと!"}
           value={comment}
           containerStyle={styles.inputContainer}
           onChangeText={text => {
             if(firstTouch) setFirstTouch(false);
             setComment(text);}}/>
        <TouchableOpacity style={styles.emmit} onPress={emmitPress}>
          <PostButton size={40} color='#FFA800' />
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    paddingBottom: 144,
    flex: 1,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    position: 'relative',
  },
  input:{
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    backgroundColor: 'white',
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
  },
  inputContainer:{
    width: '100%',
  },
  emmit: {
    right: 16,
    position: 'absolute',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  replyItem: {
    flexDirection: 'row',
    width: '100%',
    marginLeft: 48,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  itemContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomColor: '#A7A7A7',
    borderBottomWidth: 0.5,
    },
  item: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  right: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    height: 24,
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  center: {
    justifyContent: 'space-between',
    marginTop: 8,
  },
  info: {
    height: 16,
    fontSize: 13,
    color: '#6B6B6B',
  },
  reply: {
    color: '#FFA800',
    fontSize: 13,
    marginLeft: 8,
  },
  bottom: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  description: {
    marginBottom: 8,
    width: '100%',
    fontSize: 14,
    color: '#6B6B6B',
  },
  rate: {
    alignItems: 'center',
  },
  rateValue: {
    fontSize: 12,
  },
  image: {
    marginRight: 8,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
});
