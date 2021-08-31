import FacebookLogin from 'react-facebook-login';
import cookie from 'react-cookies'
import React from 'react';
// import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import ChatPage from './ChatPage.js'
import './App.css';


class LoginPage extends React.Component {
  constructor(props){
    super(props)
    this.state = { fbDetails : null }
    // this.setState = this.setState.bind(this)
  }
  responseFacebook =  (response) => {
    console.log(`FB Response: ${response}`)
    cookie.save('fbDetails', response, { path: '/' })
    this.setState({ fbDetails: response })
    window.location.href="/chat" ;
  }
  componentDidMount() {
    let response = cookie.load('fbDetails')
    console.log(`Cookie: ${response}`)
    this.setState({ fbDetails: response })
  }
  render()  {
    const { fbDetails } = this.state
    console.log(`Page 1: ${fbDetails}`)

    if (fbDetails) { // already logged in  redirect to /chat
      return <Redirect to="/chat" />;
    }

    return ( 
      <div className="App">
        <header className="App-header">
          
          <img 
            src="/Richpanel_logo_colored.svg"
            alt="Richpanel logo" width="300"
          />
          <div className="align_left">
            <p> <strong> Hi, we are Richpanel </strong> </p>
            <b> Deliver effortless customer service through Facebook </b>
          </div>
          <br /> <br />
          
          <img src="/connector_image.jpg" width="400" alt="Connector" />
          <br />
          <p id="login_text"> Click to login with Facebook </p>
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
          
          <p id="login_text">
            By logging in, you allow to save the cookies
          </p>
    
        </header>
      </div>
    );
  }
}

class LogoutPage extends React.Component {
  componentDidMount() {
    cookie.remove('fbDetails', { path: '/' })  // remove cookie
    console.log("Removed cookie. Logged out")
    this.setState({ fbDetails: false })  // after logout
  }
  render() {
    return <Redirect to="/" />;
  }
}

function App()  {
  return (
    <Router>
      <header>
        <main>
          <Route path="/">
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
