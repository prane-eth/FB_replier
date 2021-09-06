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
            //     pageReply: '2021-09-02T02:49:10+0000',
            //     lastReply: '2021-09-02T02:49:10+0000',
            //     firstName: 'Dummy',
            //     lastName: 'Chat',
            //     fullName: 'Dummy Chat',
            //     userEmail: 'user@email.com',
            //     userProfilePic: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyb_QltThW67ODgBYOo4qFR8n7Xai2JLQhIVEDQ2cpJ8S2Hs5eDmlU9R3JMnvrVn99gkw&usqp=CAU",
            //     msgSource: 'Facebook Post',
            //     messages: [
            //         {from: 'user Name', message: 'this is comment'},
            //         {from: 'page', message: 'reply given by page'},
            //         {from: 'user Name', message: 'Got item replaced. Thank you.'},
            //         {from: 'page', message: 'Thank you for choosing Amazon'},
            //     ]
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
        this.messages = {}  // Facebook DM messages
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
        this.socket.on("newMessage", this.handleNewMessage)
        this.socket.emit('requestOldMessages', this.pageID)  // get messages only 1 time from server
        this.socket.on('oldMessages', this.handleOldMessages)
    }
    handleOldMessages = (msg) => {
        console.log('got old messages')
        this.messages = msg;
        this.refreshComments()  // refresh when page just loaded
    }
    handleNewMessage = async (userID, msgText, sendTime) => {
        console.log('got new message', userID, msgText, sendTime)
        var conversations = this.state.conversations
        if (userID in conversations) {  // user sent message earlier
            var messageList = conversations[userID].messages
            // if same message is already present, return
            if (msgText == messageList[messageList.length - 1].message)
                return;
        }
        else    {  // if user never sent message earlier
            var res = await loadPath(userID, this.pageToken)
            res = res.data
            conversations[userID] = {}  // create object for user
            conversations[userID] = {
                userReply: sendTime,
                pageReply: '',
                lastReply: sendTime,
                firstName: res.first_name,
                lastName: res.last_name,
                fullName: res.first_name + ' ' + res.last_name,
                userEmail: 'user@email.com',
                userProfilePic: res.profile_pic,
                msgSource: 'Facebook DM',
                messages: [ ],
            }
        }
        conversations[userID].messages.push({
            from: conversations[userID].fullName, message: msgText
        })
        conversations[userID].userReply = sendTime  // update last reply time
        conversations[userID].lastReply = sendTime
        console.log(this.messages)
        this.messages[userID] = conversations[userID]  // add to this.messages
        this.socket.emit('updateMessages', this.messages, this.pageID)
        this.sleep(1000)
        this.addMessagesByIndex(this.state.currIndex)  // update messages on page
    }
    componentWillUnmount() {
        if (this.interval)
            clearInterval(this.interval)
    }
    addMessagesByIndex = (index) => {
        var messages = []
        var conversations = this.state.conversations
        if (index != -1)  {
            var key = Object.keys(conversations)[index]
            var conversation = conversations[key]
            var messages = conversation.messages

            console.log(conversation)
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
            console.log(posts)
            alert('Facebook session expired. Kindly logout and login again.')
            return <Redirect to="/logout" />;
        }
        // console.log(posts)
        var commentCount = 0;

        var conversations = {}   // to store conversations
        for (var post of posts.data.data) {
            // console.log(post)
            var comments = await loadPath(`${post.id}/comments`, pageToken)
            // console.log(comments)
            for (var comment of comments.data.data) {
                if ('from' in comment && comment.from.id == pageId)  // skip conversations by same page
                    continue;
                if (comment.message.includes(pageName)) {  // if pageName is mentioned in comment
                    // console.log(comment)
                    if ('from' in comment)  {
                        var fullName = comment.from.name.split(' ')
                        var firstName = fullName[0]
                        var lastName = fullName[fullName.length - 1]
                        fullName = comment.from.name
                    }
                    else    {
                        var fullName = 'Unknown User'
                        var firstName = 'Unknown'
                        var lastName = 'User'
                    }
                    // remove pageName from mentioned comment
                    comment.message = comment.message.replace(pageName, '', 1).trim()
                    conversations[comment.id] = {}  // creating value in object
                    conversations[comment.id] = {
                        userReply: comment.created_time,  // time of last reply
                        pageReply: '',
                        lastReply: comment.created_time,  // when this conversation was last active
                        firstName: firstName,
                        lastName: lastName,
                        fullName: fullName,
                        userEmail: 'user@email.com',
                        userProfilePic: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyb_QltThW67ODgBYOo4qFR8n7Xai2JLQhIVEDQ2cpJ8S2Hs5eDmlU9R3JMnvrVn99gkw&usqp=CAU',
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
                                from: 'page', message: reply.message,
                                time: reply.created_time
                            })
                            conversations[comment.id].pageReply = reply.created_time
                        }
                        else    {  // reply from user
                            conversations[comment.id]['messages'].push({
                                from: fullName, message: reply.message,
                                time: reply.created_time
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
                ...this.messages   // add FB DM messages
            }
            this.setState({ conversations: conversations })
        }
        else
            console.log('Checked conversations. Not updated')
    }
    convertTime = (lastTime) => {
        var time = new Date(lastTime);
        time = time.toString().split(' ')
        var time_min = time[4]
        time_min = time_min.split(':')
        time_min = time_min[0] + ':' + time_min[1]
        time[4]=  time_min
        time = [time[4], time[1], time[2]]  // , time[3]
        time = time.join(' ')
        return time
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
            console.log('replyMessage', this.pageToken, convID, msgText)
            this.socket.emit('replyMessage', this.pageToken, convID, msgText)
            conversation.messages.push({
                from: 'page', message: msgText
            })
            var sendTime = new Date().toISOString()
            conversation.userReply = sendTime  // update last reply time
            conversation.lastReply = sendTime
        }
        msgbox.value = ''  // clear existing value in the box
        this.messages[convID] = conversation  // add to this.messages and this.conversations
        this.state.conversations[convID] = conversation
        this.socket.emit('updateMessages', this.messages, this.pageID)
        this.addMessagesByIndex(this.state.currIndex)  // load messages after sending new message
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
            return <Redirect to="/logout" />;
        }

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
                            if (key.toString() == 'commentCount' || key.toString() == '_id')
                                return <div key={index} />
                            var item = this.state.conversations[key]
                            return (<Conversation
                                key={index}
                                isSelected = {index==this.state.currIndex}
                                fullName = {item.fullName}
                                msgSource = {item.msgSource}
                                text = {item.messages[0].message}
                                lastReply = { this.convertTime(item.lastReply) }
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
                            this.state.messages.map(item => {
                                return (<Message
                                    key = {item.from+item.message}  // because of Error: should every item have unique key
                                    from = {item.from}
                                    message = {item.message}
                                />)
                            })
                        }
                    </div>
                    <div className="newMsgCon">
                        <input
                            type="text" id="msgbox" placeholder="Enter your message"
                            className="msgInputBox"
                            onKeyDown={(event) => {
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
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyb_QltThW67ODgBYOo4qFR8n7Xai2JLQhIVEDQ2cpJ8S2Hs5eDmlU9R3JMnvrVn99gkw&usqp=CAU"
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