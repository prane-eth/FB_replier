// import React, { useEffect, useState } from 'react'
import React, { useState } from 'react'
import cookie from 'react-cookies'
import { Redirect } from 'react-router-dom'
// import Cookies from 'js-cookie'
import { HiMenuAlt1 } from 'react-icons/hi'
import { IoMdRefresh } from 'react-icons/io'
import { BiSend } from 'react-icons/bi'

import Navbar from './modules/navbar'
import SelectItem from './modules/selectItem'
import Message from './modules/message'
import sendMessage from './modules/sendMessage'
import './ChatPage.css'


const ChatPage = (props) => {
// class ChatPage extends React.Component {
    // constructor(props){
      // super(props)
      // this.state = { fbDetails : false }
      // this.setState = this.setState.bind(this)

      const [pageDetails, setPageDetails] = useState({
          accessToken: null,
          id: null
      });
      const [messages, setMessages] = useState([]);
      const [current, setCurrent] = useState(0);
      const [newMsg, setNewMsg] = useState("");
    // }
    // componentDidMount() {
      let response = cookie.load('fbDetails')
      console.log(`Cookie: ${response}`)
      // this.setState({ fbDetails: response })
    // }
    // render()    {
        // const { fbDetails } = this.state
        const fbDetails = cookie.load('fbDetails')
        console.log(`Chat page: ${fbDetails}`)

        const currentChat = messages.length !== 0 ? messages[current] : {messages: [], profile: {
            first_name: "",
            last_name: "",
            profile_pic: ""
        }};

        if (!fbDetails) { // if not logged in, go to login page
            return <Redirect to="/" />;
        }
        else
          return (
            <div className="mainWrapperHome">
              <Navbar />

              <div className="homeConversationsTab">
                  <div className="homeConversationsTabHeader">
                      <HiMenuAlt1 style={{marginLeft: 10}} />
                      <h2>Conversations</h2>
                      <div className="homeConversationsTabHeaderRefresh" onClick={console}>
                          {/* // TODO - refresh page */}
                          <IoMdRefresh style={{marginRight: 10}} />
                      </div>
                  </div>
                  {
                      messages.map((item, index) => {
                          return <SelectItem
                              isSelected={index === current}
                              name={`${item.profile.first_name} ${item.profile.last_name}`}
                              from={item.type}
                              onClick={() => setCurrent(index)}
                          />
                      })
                  }
                  <div className="homeCurrentConversation">
                      <div className="homeCurrentConversationHeader">
                          <h3>{currentChat.profile.first_name + " " + currentChat.profile.last_name}</h3>
                      </div>
                      <div className="homeCurrentConversationContainer">
                          {
                              currentChat.messages.map((item) => {
                                  return <Message
                                      key={item.mid}
                                      message={item.text}
                                      align={item.isCustomer ? "left" : "right"}
                                      icon={currentChat.profile.profile_pic}
                                  />
                              })
                          }
                      </div>
                      <div className="homeCurrentConversationNewMessage">
                          <input
                              type="text"
                              className="homeCurrentConversationNewMessageInput"
                              value={newMsg}
                              onChange={(e) => setNewMsg(e.target.value)}
                          />
                          <div className="homeCurrentConversationNewMessageSend">
                              <BiSend
                                  onClick={() => {
                                      if (newMsg === "") {
                                          return alert('You forgot to type a message!');
                                      }
                                      const recipId = currentChat.sender;
                                      const sendId = currentChat.recipient;
                                      const pageToken = pageDetails.accessToken
                                      sendMessage(recipId, sendId, newMsg, pageToken)
                                          .then(() => setNewMsg(""))
                                          .then(() => setCurrent(0))
                                          .catch((err) => console.log(err.message))
                                      }}
                              />
                          </div>
                      </div>
                  </div>
                  <div className="homeCurrentUser">
                      <div className="homeCurrentUserProfile">
                          <img
                              src="https://picsum.photos/200/200"
                              className="homeCurrentUserProfileImage"
                              alt="user-profile"
                          />
                          <h3 style={{margin: 0, marginTop: 20,}}>{currentChat.profile.first_name + " " + currentChat.profile.last_name}</h3>
                          <h5 style={{margin: 0,}}>Online</h5>
                      </div>
                      <div className="homeCurrentUserProfileDetails">
                          <h3 style={{margin: 0, marginBottom: 20,}}>Customer Details</h3>
                          <div className="homeCurrentUserProfileDetailsItem">
                              <h4 class="detail">Email</h4>
                              <h4 class="detail1">someone@gmail.com</h4>
                          </div>
                          <div className="homeCurrentUserProfileDetailsItem">
                              <h4 class="detail">First Name</h4>
                              <h4 class="detail1">{currentChat.profile.first_name}</h4>
                          </div>
                          <div className="homeCurrentUserProfileDetailsItem">
                              <h4 class="detail">Last Name</h4>
                              <h4 class="detail1">{currentChat.profile.last_name}</h4>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          );
    
}
export default ChatPage;