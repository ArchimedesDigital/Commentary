import React, { Component } from 'react';
import hello from 'hellojs';
import { login } from '../../lib/auth';
import PropTypes from 'prop-types';

hello.init({
	facebook: process.env.REACT_APP_FACEBOOK_CLIENT_ID,
	twitter: process.env.REACT_APP_TWITTER_CONSUMER_KEY,
	google: process.env.REACT_APP_GOOGLE_CLIENT_ID,
}, {
	redirect_uri: `${process.env.REACT_APP_AUTHENTICATION_API}/oauthproxy`,
});

class OAuthButtons extends Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.handleAuth = this.handleAuth.bind(this);
	}
	async handleAuth(type) {
		this.setState({
			disabledButtons: true,
		});

		try {
			const auth = await hello(type).login();

			if (type === 'twitter') {
				await login({ network: auth.network, oauthToken: auth.authResponse.oauth_token, oauthTokenSecret: auth.authResponse.oauth_token_secret });
			} else {
				await login({ network: auth.network, accessToken: auth.authResponse.access_token });
			}
			console.log(process.env);

		} catch (err) {
			this.setState({
				errorOauth: err.message,
				disabledButtons: false,
			});
		}
	}
	render(){
		return(
			<div className="at-oauth">
					<button
						className="btn at-social-btn social-facebook"
						id="at-facebook"
						name="facebook"
						onClick={this.handleAuth.bind(this, 'facebook')}
					>
						<i className="fab fa-facebook-f" /> Sign In with Facebook
					</button>
					<button
						className="btn at-social-btn social-google"
						id="at-google"
						name="google"
						onClick={this.handleAuth.bind(this, 'google')}
					>
						<i className="fab fa-google" /> Sign In with Google
					</button>
					<button
						className="btn at-social-btn social-twitter"
						id="at-twitter"
						name="twitter"
						onClick={this.handleAuth.bind(this, 'twitter')}
					>
						<i className="fab fa-twitter" /> Sign In with Twitter
					</button>
			</div>
			);
	}
}
OAuthButtons.propTypes = {
	handleFacebook: PropTypes.func,
	handleGoogle: PropTypes.func,
	handleTwitter: PropTypes.func,
};
OAuthButtons.defaultProps = {
	handleFacebook: null,
	handleGoogle: null,
	handleTwitter: null,
};

export default OAuthButtons;
