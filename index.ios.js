import React, {
  PropTypes,
  Component
}from 'react';

import {
  View,
  StyleSheet,
  NativeModules,
  NativeMethodsMixin,
  DeviceEventEmitter,
  requireNativeComponent,
  TouchableHighlight
} from 'react-native';

const FBLoginManager = NativeModules.MFBLoginManager;
const RCTMFBLogin = requireNativeComponent('RCTMFBLogin', FBLogin);

const  styles = StyleSheet.create({
  base: {
    width: 175,
    height: 30,
  },
});


class FBLogin extends Component {
  constructor (props) {
    super(props);

    this.bindAll = this.bindAll.bind(this);
    this.bindAll();

    this.statics = {
      Events : FBLoginManager.Events,
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this._getButtonView = this._getButtonView.bind(this);
    this.getChildContext = this.getChildContext.bind(this);
    this._onFacebookPress = this._onFacebookPress.bind(this);

    this.state = {
      isLoggedIn: false,
      name: "",
      subscriptions : [],
    }
  }
  static childContextTypes = {
    isLoggedIn: PropTypes.bool,
    login: PropTypes.func,
    logout: PropTypes.func,
    props: PropTypes.object,
    name: PropTypes.string
  }

  getChildContext () {
    return {
      isLoggedIn: this.state.isLoggedIn,
      login: this.login,
      logout: this.logout,
      props: this.props,
      name: this.state.name
    };

  }

  bindAll() {
    for( const prop in NativeMethodsMixin) {
      if( typeof NativeMethodsMixin[ prop ] === 'function') {
        this[prop] = NativeMethodsMixin[prop].bind(this);
      }
    }
  }

  login(permissions) {
    FBLoginManager.loginWithPermissions(
      permissions || this.props.permissions,
      (err,data) => {}
    );
  }

  logout() {
    FBLoginManager.logout((err, data) => {});
  }

  componentWillMount(){
    var _this = this
    const subscriptions = this.state.subscriptions;



    // For each event key in FBLoginManager constantsToExport
    // Create listener and call event handler from props
    // e.g.  this.props.onError, this.props.onLogin
    Object.keys(FBLoginManager.Events).forEach((event) => {
      subscriptions.push(DeviceEventEmitter.addListener(
        FBLoginManager.Events[event],
        (eventData) => {
          // event handler defined? call it and pass along any event data
          let eventHandler = this.props["on"+event];
          eventHandler && eventHandler(eventData, _this.changeLoginStatus.bind(_this));
        }
      ));
    });
    // Add listeners to state
    this.setState({ subscriptions : subscriptions });
  }

  componentWillUnmount(){
    const subscriptions = this.state.subscriptions;
    subscriptions.forEach(subscription => subscription.remove());
  }

  changeLoginStatus(isLoggedIn, name){
    this.setState({isLoggedIn: isLoggedIn, name: name})
  }

  componentDidMount(){
  }

  _onFacebookPress() {
    let permissions = [];
    if( itypeof(this.props.permissions) === 'array'){
      permissions = this.props.permissions;
    }

    if(true){
      this.logout()
    }else{
      this.login(permissions)
    }
  }

  _getButtonView () {
    const buttonText = this.props.facebookText ? this.props.facebookText:this.state.buttonText;
    return (this.props.buttonView)
      ? this.props.buttonView
      : (
        <View style={[styles.login, this.props.style]}>
          <Text style={[styles.whiteFont, this.fontStyle]}> {buttonText} </Text>
        </View>
      );
  }

  render(){
    return (
      <TouchableHighlight onPress={this._onFacebookPress} >
        <View style={[this.props.containerStyle]}>
          {this._getButtonView()}
        </View>
      </TouchableHighlight>
    )
  }
}

FBLogin.propTypes = {
  style: View.propTypes.style,
  permissions: PropTypes.array, // default: ["public_profile", "email"]
  loginBehavior: PropTypes.number, // default: Native
  onLogin: PropTypes.func,
  onLogout: PropTypes.func,
  onLoginFound: PropTypes.func,
  onLoginNotFound: PropTypes.func,
  onError: PropTypes.func,
  onCancel: PropTypes.func,
  onPermissionsMissing: PropTypes.func,
};

module.exports = {
  FBLogin,
  FBLoginManager
};
