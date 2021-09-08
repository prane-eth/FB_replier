import React from 'react'
import cookie from 'react-cookies'
import axios from "axios";
import socketio from "socket.io-client";
import { Redirect } from 'react-router-dom'
import { HiMenuAlt1 } from 'react-icons/hi'
import { HiUserCircle } from 'react-icons/hi'
import { IoMdRefresh } from 'react-icons/io'
import { IoMdCall } from 'react-icons/io'
import { BiSend } from 'react-icons/bi'
import { GoPrimitiveDot } from 'react-icons/go'

import Navbar from './modules/navbar'
import { loadPath, Conversation, Message } from './modules/functions'
import './ChatPage.css'


class ChatPage extends React.Component {
    constructor(props)  {
        super(props)
        this.interval = false;
        var conversations = {   // to store all conversations (comments and messages)
            // '365836151': {   // dummy data
            //     userReply: '2021-09-02T02:49:10+0000',
            //     pageReply: '2020-01-02T02:49:10+0000',
            //     lastReply: '2021-09-02T02:49:10+0000',
            //     firstName: 'Dummy',
            //     lastName: 'Chat',
            //     fullName: 'Dummy Chat',
            //     userEmail: 'user@email.com',
            //     userProfilePic: "/nopic.png",
            //     msgSource: 'Facebook Post',
            //     messages: [
            //         {from: 'user Name', message: 'this is comment'},
            //         {from: 'page', message: 'reply given by page'},
            //         {from: 'user Name', message: 'Got item replaced. Thank you.'},
            //         {from: 'page', message: 'Thank you for choosing Amazon'},
            //     ],
            // },
            commentCount: 0
        }
        this.state = {     // using dummy data to display before refreshing
            conversations: conversations || {},
            currIndex: -1, messages: []  // current user messages
        }
        this.fbDetails = ''
        this.pageToken = ''
        this.pageName = ''
        this.pageID = ''
        this.socket = null
        this.currUser = ''
        this.currConv = {}
        this.DMMessages = {}  // Facebook DM messages
        this.convIDs = {}  // conversation IDs for each user.   userID: convID
        // this.backendURL = 'localhost:5000'
        this.backendURL = 'rpanel-be.herokuapp.com'
    }
    componentDidMount = () => {
        if (!this.interval)  {
            this.interval = setInterval(() => {  // refresh at regular intervals
                this.refreshComments()
            }, 10000);  // 30 seconds - due to rate-limiting issue
        }

        if (!this.socket)   {   // if socket does not exist, create it
            this.socket = socketio.connect(this.backendURL)
        }
        this.socket.emit("connectSocket", this.pageID)
        this.socket.emit('requestOldMessages', this.pageID)  // get messages only 1 time from server
        this.socket.on('oldMessages', this.handleOldMessages)
        this.socket.on("newMessage", this.handleNewMessage)
    }
    componentWillUnmount() {
        if (this.interval)
            clearInterval(this.interval)
    }
    handleOldMessages = (msg) => {
        console.log('got old messages')
        this.DMMessages = msg || {};  // if no messages in database, use empty object
        if ('convIDs' in this.DMMessages)
            this.convIDs = this.DMMessages.convIDs
        this.refreshComments()  // refresh when page just loaded
    }
    newConvID = (convID, userID) => {
        if (convID.includes('.')) { // if there is a dot
            var convNum = convID.split('.')[1]  // last number of convID
            convNum = parseInt(convNum, 10) + 1   
            convID = userID + '.' + convNum
            // change '1234567.1' to '1234567.2' for the same userID
        }
        else    {
            convID = convID + '.1'
        }
        this.convIDs[userID] = convID;  // store new convID
        return convID
    }
    getConvID = (userID) => {
        if (!(userID in this.convIDs))  // if userID is not present, add it
            this.convIDs[userID] = userID
        return this.convIDs[userID]
    }
    handleNewMessage = async (userID, msgText, sendTime) => {
        console.log('got new message', userID, msgText, sendTime)
        var convID = this.getConvID(userID)
        var conversations = this.state.conversations
        console.log(conversations)
        
        if (convID in conversations) {  // user sent message earlier
            var conv = conversations[convID]

            // check last user reply time.    if no lastReply, use userReply
            var lastUserReply = conv.lastReply || conv.userReply
            var seconds = Math.floor((new Date(sendTime) - new Date(lastUserReply)) / 1000);
            var hours = seconds / 3600
            if (hours >= 24)  // if difference is 24 hours, create new conversation
                convID = this.newConvID(convID, userID)
            else  {
                var messageList = conversations[convID].messages
                // if exactly same message is already present, return
                if (msgText == messageList[messageList.length - 1].message)
                    return;
            }
        }
        if (!(convID in conversations))    {  // if user never sent message earlier
            var res = await loadPath(userID, this.pageToken)  // get user details
            res = res.data
            conversations[convID] = {
                userReply: sendTime,
                pageReply: '',
                lastReply: sendTime,
                firstName: res.first_name,
                lastName: res.last_name,
                fullName: res.first_name + ' ' + res.last_name,
                userID: userID,
                pageName: this.pageName,
                userEmail: 'user@email.com',
                userProfilePic: res.profile_pic,
                msgSource: 'Facebook DM',
                messages: [ ],
            }
            var conv = conversations[convID]
        }   
        conv.messages.push({
            from: conv.fullName, message: msgText
        })
        conv.userReply = sendTime  // update last reply time
        conv.lastReply = sendTime
        this.DMMessages[convID] = conv  // add to this.DMMessages
        this.DMMessages['convIDs'] = this.convIDs
        this.socket.emit('updateMessages', this.DMMessages, this.pageID)  // store in Database
        this.sleep(1000)
        this.addMessagesByIndex(this.state.currIndex)  // update messages on page
    }
    addMessagesByIndex = async (index) => {
        var messages = []
        var conversations = this.state.conversations
        if (index != -1)  {
            var key = Object.keys(conversations)[index]
            var conversation = conversations[key]
            this.currConv = conversation
            var messages = conversation.messages

            if (conversation.userProfilePic == '/nopic.png'
                    && conversation.userID) { 
                    // if there is no profile pic but there is userID, use it to get profile pic
                var res = await loadPath(conversation.userID, this.pageToken)
                conversation.userProfilePic = res.data.profile_pic
            }

            // console.log(conversation)
            document.getElementsByClassName('largetext')[1].innerText = conversation.fullName
            document.getElementsByClassName('detail-header')[0].innerText = conversation.fullName
            document.getElementsByClassName('detail-value')[0].innerText = conversation.userEmail
            document.getElementsByClassName('detail-value')[1].innerText = conversation.firstName
            document.getElementsByClassName('detail-value')[2].innerText = conversation.lastName
            document.getElementsByClassName('currUserProfileImage')[0].src = conversation.userProfilePic
        }
        this.setState({ messages: messages, currIndex: index, conversations: conversations })
    }
    getComments = async () =>  {
        var pageId = this.pageID, pageToken = this.pageToken, pageName = this.pageName;

        var posts = await loadPath(`${pageId}/posts`, pageToken)
        if (posts.hasOwnProperty('error')) { //'error' in posts) {  // && res.error.code == 190) {
            // console.log(posts)
            alert('Facebook session expired. Kindly logout and login again.')
            return <Redirect to="/logout" />;
        }
        var commentCount = 0;

        var conversations = {}   // to store conversations
        for (var post of posts.data.data) {
            // console.log(post)
            var comments = await loadPath(`${post.id}/comments`, pageToken)
            // console.log(comments)
            for (var comment of comments.data.data) {
                if ('from' in comment && comment.from.id == pageId)  // skip conversations by same page
                    continue;
                // if pageName is mentioned in comment  - checking is stopped because it is not mentioned in the document
                if (true) {   // comment.message.includes(pageName)) {
                    // console.log(comment)
                    if ('from' in comment)  {
                        var fullName = comment.from.name.split(' ')
                        var firstName = fullName[0]
                        var lastName = fullName[fullName.length - 1]
                        fullName = comment.from.name
                        var userID = comment.from.id
                    }
                    else    {  // if unable to get the name
                        var fullName = 'Unknown User'
                        var firstName = 'Unknown'
                        var lastName = 'User'
                        var userID = null
                    }
                    // remove pageName from mentioned comment
                    comment.message = comment.message.replace(pageName, '', 1).trim()
                    conversations[comment.id] = {
                        userReply: comment.created_time,  // time of last reply
                        pageReply: '',
                        lastReply: comment.created_time,  // when this conversation was last active
                        firstName: firstName,
                        lastName: lastName,
                        fullName: fullName,
                        userID: userID,
                        userEmail: 'user@email.com',
                        userProfilePic: '/nopic.png',
                        msgSource: 'Facebook Post',
                        messages: [
                            {from: fullName, message: comment.message}
                        ]
                    }
                    commentCount++
                    var replies = await loadPath(`${comment.id}/comments`, pageToken)
                    replies = replies.data.data
                    // console.log(replies)
                    for (var reply of replies)  {
                        // console.log(conversations)
                        // console.log(reply)
                        if ('from' in reply && reply.from.id === pageId)    {  // reply from page
                            conversations[comment.id]['messages'].push({
                                from: 'page', message: reply.message, time: reply.created_time
                            })
                            conversations[comment.id].pageReply = reply.created_time
                        }
                        else    {  // reply from user
                            conversations[comment.id]['messages'].push({
                                from: fullName, message: reply.message, time: reply.created_time
                            })
                            conversations[comment.id].userReply = reply.created_time
                        }
                        conversations[comment.id].lastReply = reply.created_time
                        commentCount++
                    }
                }
            }
        }
        conversations['commentCount'] = commentCount
        // console.log(conversations)
        return conversations
    }
    refreshComments = async () =>  {
        var conversations = await this.getComments()
        // console.log(conversations)
        if (conversations.commentCount > this.state.conversations.commentCount) {  // > what is last updated
            console.log('updated conversations')
            conversations = {
                ...conversations,
                ...this.DMMessages   // add FB DM messages
            }
            this.setState({ conversations: conversations })
        }
        else
            console.log('Checked conversations. Not updated')
    }
    findTimeDifference = (timestamp) => {
        timestamp = new Date(timestamp)
        var seconds = Math.floor((new Date() - timestamp) / 1000);
      
        var interval = seconds / 31536000;  // seconds in 1 year
        if (interval > 1)
          return Math.floor(interval) + "y";
        
        interval = seconds / 2592000;
        if (interval > 1)
          return Math.floor(interval) + "m";

        interval = seconds / 604800;
        if (interval > 1)
            return Math.floor(interval) + "w";  // weeks
        
        interval = seconds / 86400;
        if (interval > 1)
          return Math.floor(interval) + "d";  // days
        
        interval = seconds / 3600;
        if (interval > 1)
          return Math.floor(interval) + "h";  // hours
        
        interval = seconds / 60;
        if (interval > 1)
          return Math.floor(interval) + "m";  // minutes
        
        return "<1m";
    }
    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    sendMsgFromInput = () => {
        var msgbox = document.getElementById('msgbox')
        var msgText = msgbox.value
        if (!msgText)
            return;  // empty message
        var conversations = this.state.conversations
        // convID can be either comment ID (for FB posts), or user ID (for FB DMs)
        var convID = Object.keys(conversations)[this.state.currIndex]
        var conversation = conversations[convID];
        if (conversation.msgSource == 'Facebook Post') {  // if its FB post
            msgText = msgText.replaceAll(' ', '+')
            var path = `${convID}/comments?message=${msgText}`
            var url = `https://graph.facebook.com/${path}&access_token=${this.pageToken}`
            axios.post(url)
            this.sleep(3000)  // wait for some time. reload comments
            this.refreshComments()
        }
        else    {   // if it is Facebook Messenger DM
            console.log('replyMessage', conversation.userID, msgText)
            this.socket.emit('replyMessage', this.pageToken, conversation.userID, msgText)
            conversation.messages.push({
                from: 'page', message: msgText
            })
            var sendTime = new Date().toISOString()
            conversation.pageReply = sendTime  // update last reply time
            conversation.lastReply = sendTime
        }
        msgbox.value = ''  // clear existing value in the box
        this.DMMessages[conversation.userID] = conversation  // add to this.DMMessages and this.conversations
        this.state.conversations[conversation.userID] = conversation
        this.socket.emit('updateMessages', this.DMMessages, this.pageID)
        this.addMessagesByIndex(this.state.currIndex)  // load messages after sending new message
    }
    getPostEmbedCode = (postID) => {  // to embed post at starting of conversation
        // PostID is in the form of "pageID_postID"
        postID = postID.split('_')
        var currPageID = postID[0]
        postID = postID[1]
        var url = `https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3D${currPageID}%26id%3D${postID}&show_text=true&width=500`
        return (
            <iframe key={postID} src={url} width="500" height="213" scrolling="no" frameBorder="0"
                allow="encrypted-media; picture-in-picture; web-share" 
            />
        )  // on a post, click 'embed code' button to get code
        /*
        To embed a comment, https://www.facebook.com/${pageID}/posts/${postID}?comment_id=${commentID}
        https://www.facebook.com/101135272313869/posts/104673101960086?comment_id=104673101960086_104673418626721
        */
    }
    render()    {
        this.fbDetails = cookie.load('fbDetails', { path: '/' })
        this.pageToken = cookie.load('pageToken', { path: '/' })
        this.pageName = cookie.load('pageName', { path: '/' })
        this.pageID = cookie.load('pageId', { path: '/' })
        if (!this.fbDetails || !this.pageToken) { // if not logged in, go to login page
            // console.log(this.fbDetails)
            // console.log(this.pageToken)
            alert('Error: unable to find Page Token. Kindly login again.')
            return <Redirect to="/logout" />
        }
        // console.log(this.fbDetails)
        this.pageProfilePic = JSON.parse(this.fbDetails)['picture']['data']['url']
        // console.log(this.state.conversations)

        return (
            <div className="pageContainer">
                <Navbar />

                <div className="conv">
                    <div className="convHeader">
                        <HiMenuAlt1 style={{marginLeft: 10}} />
                        <h3 className="largetext"> Conversations </h3>
                        <div className="refreshBtn" onClick={() => this.refreshComments() }>
                            <IoMdRefresh style={{marginRight: 10, align:'right'}} />
                        </div>
                    </div>
                    {
                        Object.keys(this.state.conversations).map((key,index) => {
                            if (key.toString().startsWith('c') || key.toString() == '_id')
                                return <div key={index} />
                            var item = this.state.conversations[key]
                            // if a DM has different conversations (>24 hours apart), do nothing
                            if (item.conversations)
                                return <span />
                            return (<Conversation
                                key = {index}
                                isSelected = {index==this.state.currIndex}
                                fullName = {item.fullName}
                                msgSource = {item.msgSource}
                                text = {item.messages[0].message}
                                lastReply = { this.findTimeDifference(item.lastReply) }
                                onClick={() => { this.addMessagesByIndex(index) }}
                            />)
                        })
                    }
                </div>
                <div className="currConv">
                    <div className="currConvHeader">
                        <h3 className="largetext"> {'Unknown User'} </h3>
                    </div>
                    <div className="currConvContainer">
                        {
                            [1].map((_item, _index) => {
                                if (this.state.currIndex >= 0
                                        && this.currConv.msgSource == 'Facebook Post') {
                                    var postID = Object.keys(this.state.conversations)[this.state.currIndex]
                                    return this.getPostEmbedCode(postID)
                                }
                            })
                        }
                        {
                            this.state.messages.map((item, index) => {
                                return (<Message
                                    key = {item.from+item.message}  // because of Error: should every item have unique key
                                    from = {item.from}
                                    message = {item.message}
                                    index = {index}
                                    userProfilePic = {this.currConv.userProfilePic}
                                    pageProfilePic = {this.pageProfilePic}
                                    userReply = {this.currConv.userReply}
                                    pageReply = {this.currConv.pageReply}
                                    fullName = {this.currConv.fullName}
                                    pageName = {this.pageName}
                                    messages = {this.currConv.messages}
                                />)
                            })
                        }
                    </div>
                    <div className="newMsgCon">
                        <input
                            type="text" id="msgbox" placeholder="Enter your message"
                            className="msgInputBox"
                            onKeyDown={(event) => {  // send message when we press Enter
                                if (event.key === 'Enter') {
                                    this.sendMsgFromInput();
                                }
                            }}
                        />
                        <div className="msgSendBtn">
                            <BiSend 
                                onClick={() => {
                                    this.sendMsgFromInput();
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="currUser">
                    <div className="currUserProfile">
                        <img
                            src="/nopic.png"
                            className="currUserProfileImage"
                            alt="user-profile"
                        />
                        <h4 className="detail-header"> Unknown User </h4>
                        <h5 className="detail-grey">  <GoPrimitiveDot/> Offline </h5>
                        <div className="btnContainer">
                            <button onClick={() => alert('No option to call')}>
                                <IoMdCall color="#5c5f62" />  Call
                            </button>
                            <button className="rightBtn" onClick={() => alert('No option to view profile')}>
                                <HiUserCircle color="#5c5f62" /> Profile 
                            </button>
                        </div>
                    </div>
                    <div className="currUserProfileDetails">
                        <h4 className="detail-header">Customer Details</h4>
                        <div className="currUserProfileDetailsItem">
                            <h4 className="detail-key"> Email </h4>
                            <h4 className="detail-value"> unknown@user.com </h4>
                        </div>
                        <div className="currUserProfileDetailsItem">
                            <h4 className="detail-key"> First Name </h4>
                            <h4 className="detail-value"> Unknown </h4>
                        </div>
                        <div className="currUserProfileDetailsItem lastItem">
                            <h4 className="detail-key"> Last Name </h4>
                            <h4 className="detail-value"> User </h4>
                        </div>
                        <a href="#" className="details-link"> View more details </a>
                    </div>
                </div>
            </div>
        );
    }
}
export default ChatPage;