import React, { useEffect } from 'react'
import cookie from 'react-cookies'
import { Redirect } from 'react-router-dom'
import { HiMenuAlt1 } from 'react-icons/hi'
import { HiUserCircle } from 'react-icons/hi'
import { IoMdRefresh } from 'react-icons/io'
import { IoMdCall } from 'react-icons/io'
import { BiSend } from 'react-icons/bi'

import Navbar from './modules/navbar'
import { loadPath, Conversation, Message } from './modules/functions'
import './ChatPage.css'


class ChatPage extends React.Component {
    constructor(props)  {
        super(props)
        // this.setState = this.setState.bind(this)
        this.interval = null;
        var conversations = {   // dummy data
            '365836151': {
                userReply: '2021-09-02T02:49:10+0000',
                pageReply: '2021-09-02T02:49:10+0000',
                lastReply: '2021-09-02T02:49:10+0000',
                userName: 'user Name',
                messages: [
                    {from: 'user Name', message: 'this is comment'},
                    {from: 'page', message: 'reply given by page'},
                    {from: 'user Name', message: 'Got item replaced. Thank you.'},
                    {from: 'page', message: 'Thank you for choosing Amazon'},
                ]
            },
            '365836152': {
                userReply: '2021-09-02T02:49:10+0000',
                pageReply: '2021-09-02T02:49:10+0000',
                lastReply: '2021-09-02T02:49:10+0000',
                userName: 'user Name',
                messages: [
                    {from: 'user Name', message: 'this is other comment'},
                    {from: 'page', message: 'other reply given by page'},
                ]
            },
            '365836153': {
                userReply: '2021-09-02T02:49:10+0000',
                pageReply: '2021-09-02T02:49:10+0000',
                lastReply: '2021-09-02T02:49:10+0000',
                userName: 'user Name',
                messages: [
                    {from: 'user Name', message: 'this is 3rd comment'},
                    {from: 'page', message: 'yet another reply given by page'},
                ]
            },
            commentCount: 1
        }
        this.state = {
            //fbDetails: false, pageToken: false,
            conversations: conversations||{}, currentSelected: -1,
            messages: []
        }
    }
    componentWillUnmount() {
      if (this.interval)
        clearInterval(this.interval);
    }
    render()    {
        const fbDetails = cookie.load('fbDetails', { path: '/' })
        const pageToken = cookie.load('pageToken', { path: '/' })
        const pageName = cookie.load('pageName', { path: '/' })
        const pageId = cookie.load('pageId', { path: '/' })

        if (!fbDetails || !pageToken) { // if not logged in, go to login page
            alert('Error: unable to find Page Token. Kindly login again.')
            return <Redirect to="/" />;
        }

        const convertTime = (lastTime) => {
            var time = new Date(lastTime);
            time = time.toString().split(' ')
            time = [time[1], time[2], time[3], time[4]]
            time = time.join(' ')
            return time
        }
        const addMessages = (index) => {
            var conversations = this.state.conversations
            var key = Object.keys(conversations)[index];
            var messages = conversations[key].messages
            // console.log(messages)
            this.setState({ messages: messages, currentSelected: index })
        }
        const replyMessage = (index, message) => {
            var conversations = this.state.conversations
            var commentID = Object.keys(conversations)[index]
            // no option to reply to comments. permisson deprecated by Facebook for v7+
            // https://developers.facebook.com/docs/permissions/reference - publish_pages
            // try https://graph.facebook.com/v6.0/me?access_token= ...
        }
        const getConversations = async (pageId, pageToken, pageName) =>  {
            var posts = await loadPath(`${pageId}/posts`, pageToken)
            if ('error' in posts) {  // && res.error.code == 190) {
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
                            var senderName = comment.from.name
                            // var senderId = comment.from.id
                        }
                        else    {
                            var senderName = 'Unknown User'
                            // var senderId = 0
                        }
                        // console.log(comment)
                        // remove pageName from mentioned comment
                        comment.message = comment.message.replace(pageName, '', 1).trim()
                        conversations[comment.id] = {}  // creating value in object
                        conversations[comment.id] = {
                            userReply: comment.created_time,  // time of last reply
                            pageReply: '',
                            lastReply: comment.created_time,  // when this conversation was last active
                            userName: senderName,
                            messages: [
                                {from: senderName, message: comment.message}
                            ]
                        }
                        commentCount++
                        var replies = await loadPath(`${comment.id}/comments`, pageToken)
                        replies = replies.data.data
                        // console.log(replies)
                        for (var reply of replies)  {
                            // console.log(conversations)
                            console.log(reply)
                            if ('from' in reply && reply.from.id === pageId)    {  // reply from page
                                conversations[comment.id]['messages'].push({
                                    from: 'page', message: reply.message,
                                    time: reply.created_time
                                })
                                conversations[comment.id].pageReply = reply.created_time
                            }
                            else    {  // reply from user
                                conversations[comment.id]['messages'].push({
                                    from: senderName, message: reply.message,
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
            conversations['count'] = commentCount
            // console.log(conversations)
            return conversations
        }
        const refreshConversations = async (pageId, pageToken, pageName) =>  {
            var conversations = await getConversations(pageId, pageToken, pageName)
            // console.log(conversations)
            if (conversations.commentCount >= this.state.conversations.commentCount) {  // > what is last updated
                console.log('updated conversations')
                this.setState({ conversations: conversations })
            }
            // else
                // console.log('Checked conversations. Not updated')
        }

        // useEffect(() => {
        // refreshConversations(pageId, pageToken, pageName)  // refresh when page just loaded
        // this.interval = setInterval(() => {  // refresh every 10 seconds
        //     refreshConversations(pageId, pageToken, pageName)
        // }, 10000);  // 30 seconds - due to rate-limiting issue
        // return () => clearInterval(this.interval);
        // }, []);

        return (
            <div className="mainWrapperHome">
                <Navbar />

                <div className="conv">
                    <div className="convHeader">
                        <HiMenuAlt1 style={{marginLeft: 10}} />
                        <h3 className="largetext"> Conversations </h3>
                        <div className="refreshBtn" onClick={() => {
                                    //window.document.location.reload()
                                    refreshConversations(pageId, pageToken, pageName)
                                }}>
                            <IoMdRefresh style={{marginRight: 10, align:'right'}} />
                        </div>
                    </div>
                    {
                        Object.keys(this.state.conversations).map((item,index) => {
                            if (item.toString() == 'count')
                                return <br/>
                            item = this.state.conversations[item]
                            item.lastReply = convertTime(item.lastReply);
                            return (<Conversation
                                isSelected = {index==this.state.currentSelected}
                                name = {item.userName}
                                type = {'Facebook Post'}
                                text = {item.messages[0].message}
                                lastReply = {item.lastReply}
                                onClick={() => { addMessages(index) }}
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
                                    from = {item.from}
                                    message = {item.message}
                                />)
                            })
                        }
                    </div>
                    <div className="currConvNewMessage">
                        <input
                            type="text" id="msgbox" placeholder="Enter your message"
                            className="currConvNewMessageInput"
                        />
                        <div className="currConvNewMessageSend">
                            <BiSend 
                                onClick={() => {
                                    var msgbox = document.getElementById('msgbox')
                                    var text = msgbox.value
                                    if (!text)
                                        alert('Message cannot be empty');
                                    else
                                        alert('Sorry. FB does not allow to reply using API')
                                }}
                                // onKeyPress={event => {
                                //     if (event.key === 'Enter') {
                                //         var msgbox = document.getElementById('msgbox')
                                //         var text = msgbox.value
                                //         if (!text)
                                //             alert('You forgot to type a message!');
                                //     }
                                // }}
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
                        <h4 className="detail0"> {'Unknown User'} </h4>
                        <h5 className="detail"> Online </h5>
                        <button onClick={() => alert('No option to call')}
                            > <IoMdCall />  Call </button>
                        <button onClick={() => alert('No option to view profile')}
                            > <HiUserCircle /> Profile </button>
                    </div>
                    <div className="currUserProfileDetails">
                        <h4 className="detail0">Customer Details</h4>
                        <div className="currUserProfileDetailsItem">
                            <h4 className="detail"> Email </h4>
                            <h4 className="detail1"> {'unknown@user.com'} </h4>
                        </div>
                        <div className="currUserProfileDetailsItem">
                            <h4 className="detail"> First Name </h4>
                            <h4 className="detail1"> {'Unknown'} </h4>
                        </div>
                        <div className="currUserProfileDetailsItem">
                            <h4 className="detail"> Last Name </h4>
                            <h4 className="detail1"> {'User'} </h4>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default ChatPage;