import React from 'react'
import cookie from 'react-cookies'
import { Redirect } from 'react-router-dom'
import { HiMenuAlt1 } from 'react-icons/hi'
import { HiUserCircle } from 'react-icons/hi'
import { IoMdRefresh } from 'react-icons/io'
import { IoMdCall } from 'react-icons/io'
import { BiSend } from 'react-icons/bi'

import Navbar from './modules/navbar'
import { getURL } from './modules/functions'
import './ChatPage.css'


class ChatPage extends React.Component {
    constructor(props){
      super(props)
      this.state = { fbDetails : false, conversations: [], current: -1}
      // this.setState = this.setState.bind(this)
    }
    render()    {
        const fbDetails = cookie.load('fbDetails', { path: '/' })
        const pageToken = cookie.load('pageToken', { path: '/' })
        const pageId = cookie.load('pageId', { path: '/' })
        // console.log(`Chat page: ${fbDetails}`)

        if (!fbDetails || !pageToken) { // if not logged in, go to login page
            return <Redirect to="/" />;
        }
        // useEffect(() => {
            var url = getURL(pageId, pageToken)
            var res = await axios.get(url)
            console.log(res)
        // }, []);
        
        return (
            <div className="mainWrapperHome">
                <Navbar />

                <div className="homeConversationsTab">
                    <div className="homeConversationsTabHeader">
                        <HiMenuAlt1 style={{marginLeft: 10}} />
                        <h2> Conversations </h2>
                        <div className="homeConversationsTabHeaderRefresh" onClick={() => window.document.location.reload()}>
                            <IoMdRefresh style={{marginRight: 10}} />
                        </div>
                    </div>
                </div>
                <div className="homeCurrentConversation">
                    <div className="homeCurrentConversationHeader">
                        <h3> {'Amit RG'} </h3>
                    </div>
                    <div className="homeCurrentConversationContainer">
                    </div>
                    <div className="homeCurrentConversationNewMessage">
                        <input
                            type="text" id="msgbox" placeholder="Enter your message"
                            className="homeCurrentConversationNewMessageInput"
                        />
                        <div className="homeCurrentConversationNewMessageSend">
                            <BiSend
                                onClick={() => {
                                    return alert('You forgot to type a message!');
                                }}
                            />
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
                        <h3 className="detail0"> {'Amit RG'} </h3>
                        <h5 className="detail"> Online </h5>
                        <button onClick={() => alert('No option to call')}
                            > <IoMdCall />  Call </button>
                        <button onClick={() => alert('No option to view profile')}
                            > <HiUserCircle /> Profile </button>
                    </div>
                    <div className="homeCurrentUserProfileDetails">
                        <h3 className="detail0">Customer Details</h3>
                        <div className="homeCurrentUserProfileDetailsItem">
                            <h4 className="detail"> Email </h4>
                            <h4 className="detail1"> {'someone@gmail.com'} </h4>
                        </div>
                        <div className="homeCurrentUserProfileDetailsItem">
                            <h4 className="detail"> First Name </h4>
                            <h4 className="detail1"> {'Amit'} </h4>
                        </div>
                        <div className="homeCurrentUserProfileDetailsItem">
                            <h4 className="detail"> Last Name </h4>
                            <h4 className="detail1"> {'RG'} </h4>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default ChatPage;