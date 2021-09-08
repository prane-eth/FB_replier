import FacebookLogin from 'react-facebook-login'
import cookie from 'react-cookies'
import React from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import ChatPage from './ChatPage.js'
import { getURL } from './modules/functions'
import './App.css'


class LoginPage extends React.Component {
  constructor(props){
    super(props)
    this.state = { fbDetails : null, response: null }
    // this.setState = this.setState.bind(this)
  }
  responseFacebook = async (fbDetails) => {
    console.log(`FB Response: ${fbDetails}`)
    cookie.save('fbDetails', fbDetails, { path: '/' })
    this.setState({ fbDetails: fbDetails })

    // get page token
    var url = getURL('me/accounts', fbDetails.accessToken)
    var response = await axios.get(url);
    // console.log(response)
    response = response.data.data
    if (Object.keys(response).length === 0) {
      alert("Error: This app can't be used if you have no pages")
      return
    }
    else {
      var pageId = response['0'].id   // first page owned by this user
      var pageToken = response['0'].access_token
      var pageName = response['0'].name

      this.setState({ pageToken: pageToken, pageId: pageId })
      cookie.save('pageToken', pageToken, { path: '/' })
      cookie.save('pageName', pageName, { path: '/' })
      cookie.save('pageId', pageId, { path: '/' })
      window.location.href="/chat"
      return
    }
  }
  componentDidMount() {
    let response = cookie.load('fbDetails')
    console.log(`Cookie: ${response}`)
    this.setState({ fbDetails: response })
  }
  render()  {
    const { fbDetails } = this.state
    console.log(`Page 1: ${fbDetails}`)
    const pageToken = cookie.load('pageToken', { path: '/' })

    if (fbDetails && pageToken)  // already logged in  redirect to /chat
      return <Redirect to="/chat" />;

    return ( 
      <div className="App">
        <header className="App-header">
          
          <img 
            src="/Richpanel_logo_colored.svg"
            alt="Richpanel logo" width="300"
          /> <br /> <br />
          <div className="align_left">
            <p> <strong> Hi, we are Richpanel </strong> </p>
            <b> Deliver effortless customer service through Facebook </b>
          </div>
          <br />
          
          <img src="/connector_image.jpg" width="400" alt="Connector" />
          <br />
          <p id="login_text"> Click below to login </p>

          {/* <div className="fb-login-button" data-width="300" data-size="large"
            data-button-type="login_with" data-layout="rounded"
            data-auto-logout-link="false" data-use-continue-as="true"
            callback={this.responseFacebook}
          > </div> */}
          <FacebookLogin
            appId="370672534609881"
            autoLoad={false}
            fields="name,email,picture"
            callback={this.responseFacebook} />
          {/* <div className="login_button" data-width="300" onClick={() => fbLogin() }
          > Login with Facebook </div> */}
          
          <p id="login_text">
            By logging in, you give consent to store and access the cookies until you logout
          </p>
    
        </header>
      </div>
    );
  }
}

class LogoutPage extends React.Component {
  sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  componentDidMount() {
    cookie.remove('fbDetails', { path: '/' })  // remove cookie
    cookie.remove('pageToken', { path: '/' })
    cookie.remove('pageName', { path: '/' })
    cookie.remove('pageId', { path: '/' })
    console.log("Removed cookie. Logged out")
    this.setState({ fbDetails: false })  // after logout
    this.sleep(500)
  }
  render() {
    window.location.href = "/" 
    return <p> Logging out... </p>
  }
}

function App()  {
  return (
    <Router>
      <header>
        <main>
          <Route path="/" exact>
            <LoginPage />
          </Route>
          <Route path="/chat">
            <ChatPage />
          </Route>
          <Route path="/logout">
            <LogoutPage />
          </Route>
        </main>
      </header>
    </Router>
  )
}

export default App;
