import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

ModalLogin = React.createClass({

	propTypes: {
		lowered: React.PropTypes.bool,
		closeModal: React.PropTypes.func,
	},

	childContextTypes: {
		muiTheme: React.PropTypes.object.isRequired,
	},

	getChildContext() {
		return { muiTheme: getMuiTheme(baseTheme) };
	},

	getInitialState() {
		return {
			errorMsg: '',
			errorSocial: '',
		};
	},

	handleLogin(e) {
		e.preventDefault();
		const email = $('.sign-in-input--email').val();
		const password = $('.sign-in-input--password').val();
		Meteor.loginWithPassword(email, password, (err) => {
			if (!err) {
				this.props.closeModal();
			} else {
				this.setState({
					errorMsg: 'Invalid email or password',
				})
			}
		});
	},
	handleLoginFacebook() {
		Meteor.loginWithFacebook({}, (err) => {
			if (!err) {
				this.props.closeModal();
			} else {
				this.setState({
					errorSocial: `Error with signing in with Facebook: ${err.reason}`,
				});
			}
		});
	},

	handleLoginGoogle() {
		Meteor.loginWithGoogle({}, (err) => {
			if (!err) {
				this.props.closeModal();
			} else {
				this.setState({
					errorSocial: `Error with signing in with Google: ${err.reason}`,
				});
			}
		});
	},

	handleLoginTwitter() {
		Meteor.loginWithTwitter({}, (err) => {
			if (!err) {
				this.props.closeModal();
			} else {
				this.setState({
					errorSocial: `Error with signing in with Twitter: ${err.reason}`,
				});
			}
		});
	},

	render() {
		const lowered = this.props.lowered;

		return (
			<div>
				{!Meteor.userId() ?
					<div
						className={`ahcip-modal-login
						ahcip-modal ahcip-login-signup ${((lowered) ? ' lowered' : '')}`}
					>
						<div
							className="close-modal paper-shadow"
							onClick={this.props.closeModal}
						>
							<i className="mdi mdi-close" />
						</div>
						<div className="modal-inner">
							{/*<BlazeToReact blazeTemplate="atForm" state="signIn" />*/}

							<div className="at-form">
								<div className="at-title">
									<h3>Sign In</h3>
								</div>
								<span className="error-text">
									{this.state.errorSocial}
								</span>
								<div className="at-oauth">
									<button
										className="btn at-social-btn"
										id="at-facebook"
										name="facebook"
										onClick={this.handleLoginFacebook}
									>
										<i className="fa fa-facebook"></i> Sign In with Facebook
									</button>

									<button
										className="btn at-social-btn"
										id="at-google"
										name="google"
										onClick={this.handleLoginGoogle}
									>
										<i className="fa fa-google"></i> Sign In with Google
									</button>

									<button
										className="btn at-social-btn"
										id="at-twitter"
										name="twitter"
										onClick={this.handleLoginTwitter}
									>
										<i className="fa fa-twitter"></i> Sign In with Twitter
									</button>
								</div>
								<div className="at-sep">
									<strong>OR</strong>
								</div>
								<div className="at-pwd-form">
									<form role="form" id="at-pwd-form" noValidate="" onSubmit={this.handleLogin} >
										<fieldset>
											<div className="at-input form-group has-feedback">
												<label className="control-label" htmlFor="at-field-email">
													Email
												</label>
												<input type="email" className="form-control sign-in-input--email" id="at-field-email" name="at-field-email" placeholder="Email" autoCapitalize="none" autoCorrect="off" autoComplete="off" style={{backgroundImage:" url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAkCAYAAADo6zjiAAAAAXNSR0IArs4c6QAAAvhJREFUWAndWDtrIlEUPo4SUVDUhbjrWqkgiYGNnWBhEPMPoizb+g8sUgk2Vlv6Hxa2lnSC5GFArLTQViWs0SImYKFgjHvOrHN3Xo6OOxLYC5N73ue75965c4wJcBSLxc+vr6/fkTxbLpc+khk1TCbTAGNdWyyWy3w+/0se17RK3sLEH+RKI3kE8oQgvshBcLTyfSenhVCOVZUl6+KQO5NI9ssocnFG77kWfrVcVIF3Hf83gKOjI8jlckDzurHXCkQiEXA6nUDzurFXAPju83mFWQ3EXgGoJZTLJACsVisEg0Fwu91yO9hVpwgkE1gE3uVyQTabBYfDAW9vb1Aul6HZbPLqXXVCbK2ZVSAWi/HJyZjjOEgmk8xvVx0LoEEwABo2e1UxAPV6HSaTCZ+MtqBarbLEu+pYAA3CVCgUloKeDprf74fxeAzPz8+CmJ+1dBLDDQy+ko9ocrPqDx4kADb4GqpGIGMEccq2wNDoWwTDL6OH+oN3A7DCmGD3wBagNU2Oj48hk8mstcHWD3DFEj1W4ZNhFbDZbJLg2zKGVUAMYD6fw3Q6lWDA1Up4gTEMgN1uF2JCq9WCq6srxmsRFnwdBmq9mpaTmk5cAY/HA+fn5/ye93o96Ha7ai68jCpwjc83nvuHP2IAgUAA6KGRSCTg/v4eKpWKanSObiSswpOqVofQbDavtY7H4xCNRlX1ZrzzJ6lU6gduw0cEQr+OHKqWG4SdTgdGoxE0Gg24u7uDwWAAoVAIBGBUIeHzLg71p2cSSzbQ4m/HBlNIp9OsH6TvS6lUUrgYdg+cnJzAwcEBS0C01+tl/MvLC6PFhGGv4cXFBX/qaaWz2Qx8Ph/g+WK5+v0+o8XEXwuxdEeaEh4eHiq8h8Mh1Go1hZwEugHgQX2kO1wejRqYcDjMN7R04OgmpJ6i3W7zB3OxWMhdgGLpBoBRbvD5Ko92e3sL9OgcN7oP4ereGOtMpDDH1VNDcqkbAP6H4wEdTzHATyqhIvIGAfmQL8WgWL8B6msZ8cYhQlQAAAAASUVORK5CYII=&quot;)",backgroundRepeat: "no-repeat", backgroundAttachment: "scroll", backgroundSize: "16px 18px", backgroundPosition: "98% 50%",}}/>
												<span className="help-block hide"></span>
										</div>
										<div className="at-input form-group has-feedback">
											<label className="control-label" htmlFor="at-field-password">
												Password
											</label>
											<input type="password" className="form-control	sign-in-input--password" id="at-field-password" name="at-field-password" placeholder="Password" autoCapitalize="none" autoCorrect="off" autoComplete="off" style={{backgroundImage:" url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAkCAYAAADo6zjiAAAAAXNSR0IArs4c6QAAAvhJREFUWAndWDtrIlEUPo4SUVDUhbjrWqkgiYGNnWBhEPMPoizb+g8sUgk2Vlv6Hxa2lnSC5GFArLTQViWs0SImYKFgjHvOrHN3Xo6OOxLYC5N73ue75965c4wJcBSLxc+vr6/fkTxbLpc+khk1TCbTAGNdWyyWy3w+/0se17RK3sLEH+RKI3kE8oQgvshBcLTyfSenhVCOVZUl6+KQO5NI9ssocnFG77kWfrVcVIF3Hf83gKOjI8jlckDzurHXCkQiEXA6nUDzurFXAPju83mFWQ3EXgGoJZTLJACsVisEg0Fwu91yO9hVpwgkE1gE3uVyQTabBYfDAW9vb1Aul6HZbPLqXXVCbK2ZVSAWi/HJyZjjOEgmk8xvVx0LoEEwABo2e1UxAPV6HSaTCZ+MtqBarbLEu+pYAA3CVCgUloKeDprf74fxeAzPz8+CmJ+1dBLDDQy+ko9ocrPqDx4kADb4GqpGIGMEccq2wNDoWwTDL6OH+oN3A7DCmGD3wBagNU2Oj48hk8mstcHWD3DFEj1W4ZNhFbDZbJLg2zKGVUAMYD6fw3Q6lWDA1Up4gTEMgN1uF2JCq9WCq6srxmsRFnwdBmq9mpaTmk5cAY/HA+fn5/ye93o96Ha7ai68jCpwjc83nvuHP2IAgUAA6KGRSCTg/v4eKpWKanSObiSswpOqVofQbDavtY7H4xCNRlX1ZrzzJ6lU6gduw0cEQr+OHKqWG4SdTgdGoxE0Gg24u7uDwWAAoVAIBGBUIeHzLg71p2cSSzbQ4m/HBlNIp9OsH6TvS6lUUrgYdg+cnJzAwcEBS0C01+tl/MvLC6PFhGGv4cXFBX/qaaWz2Qx8Ph/g+WK5+v0+o8XEXwuxdEeaEh4eHiq8h8Mh1Go1hZwEugHgQX2kO1wejRqYcDjMN7R04OgmpJ6i3W7zB3OxWMhdgGLpBoBRbvD5Ko92e3sL9OgcN7oP4ereGOtMpDDH1VNDcqkbAP6H4wEdTzHATyqhIvIGAfmQL8WgWL8B6msZ8cYhQlQAAAAASUVORK5CYII=&quot;)", backgroundRepeat: "no-repeat", backgroundAttachment: "scroll", backgroundSize: "16px 18px", backgroundPosition: "98% 50%"}} />
											<span className="help-block hide"></span>
										</div>
										<span className="error-text">
											{this.state.errorMsg}
										</span>
										<div className="at-pwd-link">
											<p>
												<a href="/forgot-password" id="at-forgotPwd" className="at-link at-pwd">Forgot your password?</a>
											</p>
										</div>
										<button type="submit" className="at-btn submit btn btn-lg btn-block btn-default" id="at-btn">
											Sign In
										</button>
										</fieldset>
									</form>
								</div>
								<div className="at-signup-link">
									<p>
										Don't have an account?
										<a href="/sign-up" id="at-signUp" className="at-link at-signup">Register</a>
									</p>
								</div>
								<div className="at-resend-verification-email-link at-wrap">
									<p>
										Verification email lost?
										<a href="/send-again" id="at-resend-verification-email" className="at-link at-resend-verification-email">Send again</a>
									</p>
								</div>
							</div>
						</div>
					</div>
					: ''
				}
			</div>
		);
	},
});
