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
      this.state = { //fbDetails: false, pageToken: false,
                    conversations: {}, commentCount: 0, currentSelected: -1,
                    messages: []
                }
      // this.setState = this.setState.bind(this)
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
            console.log(messages)
            this.setState({ messages: messages, currentSelected: index })
        }
        const getConversations = async (pageId, pageToken, pageName) =>  {
            var posts = await loadPath(`${pageId}/posts`, pageToken)
            if ('error' in posts) {  // && res.error.code == 190) {
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
                            if ('from' in reply && reply.from === pageId)    {  // reply from page
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
            conversations['count'] = commentCount  // unused for now
            // console.log(conversations)
            return conversations
        }
        const refreshConversations = async (pageId, pageToken, pageName) =>  {
            var conversations = await getConversations(pageId, pageToken, pageName)
            // console.log(conversations)
            if (conversations.count !== this.state.commentCount) {  // != what is last updated
                console.log('updated conversations')
                this.setState({ conversations: conversations, commentCount: conversations.count })
            }
            // else
            //     console.log('Checked conversations. Not updated')
        }

        refreshConversations(pageId, pageToken, pageName)  // refresh when page just loaded
        this.interval = setInterval(() => {  // refresh every 10 seconds
            refreshConversations(pageId, pageToken, pageName)
        }, 10000);
        
        return (
            <div className="mainWrapperHome">
                <Navbar />

                <div className="homeConversationsTab">
                    <div className="homeConversationsTabHeader">
                        <HiMenuAlt1 style={{marginLeft: 10}} />
                        <h3> Conversations </h3>
                        <div className="homeConversationsTabHeaderRefresh" onClick={() => {
                                    //window.document.location.reload()
                                    refreshConversations(pageId, pageToken, pageName)
                                }}>
                            <IoMdRefresh style={{marginRight: 10}} />
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
                <div className="homeCurrentConversation">
                    <div className="homeCurrentConversationHeader">
                        <h3> {'Unknown User'} </h3>
                    </div>
                    <div className="homeCurrentConversationContainer">
                        {
                            this.state.messages.map(item => {
                                // return (<div> {index} </div>);
                                return (<Message
                                    from={item.from}
                                    message={item.message}
                                />)
                            })
                        }
                    </div>
                    <div className="homeCurrentConversationNewMessage">
                        <input
                            type="text" id="msgbox" placeholder="Enter your message"
                            className="homeCurrentConversationNewMessageInput"
                        />
                        <div className="homeCurrentConversationNewMessageSend">
                            <BiSend onClick={() => {
                                var msgbox = document.getElementById('msgbox')
                                var text = msgbox.value
                                if (!text)
                                    alert('You forgot to type a message!');
                                
                            }} />
                        </div>
                    </div>
                </div>
                <div className="homeCurrentUser">
                    <div className="homeCurrentUserProfile">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyb_QltThW67ODgBYOo4qFR8n7Xai2JLQhIVEDQ2cpJ8S2Hs5eDmlU9R3JMnvrVn99gkw&usqp=CAU"
                            className="homeCurrentUserProfileImage"
                            alt="user-profile"
                        />
                        <h4 className="detail0"> {'Unknown User'} </h4>
                        <h5 className="detail"> Online </h5>
                        <button onClick={() => alert('No option to call')}
                            > <IoMdCall />  Call </button>
                        <button onClick={() => alert('No option to view profile')}
                            > <HiUserCircle /> Profile </button>
                    </div>
                    <div className="homeCurrentUserProfileDetails">
                        <h4 className="detail0">Customer Details</h4>
                        <div className="homeCurrentUserProfileDetailsItem">
                            <h4 className="detail"> Email </h4>
                            <h4 className="detail1"> {'unknown@user.com'} </h4>
                        </div>
                        <div className="homeCurrentUserProfileDetailsItem">
                            <h4 className="detail"> First Name </h4>
                            <h4 className="detail1"> {'Unknown'} </h4>
                        </div>
                        <div className="homeCurrentUserProfileDetailsItem">
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