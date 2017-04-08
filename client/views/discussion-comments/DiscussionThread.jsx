import { Session } from 'meteor/session';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import DiscussionComments from '/imports/collections/discussionComments';

DiscussionThread = React.createClass({

	propTypes: {
		comment: React.PropTypes.object.isRequired,
		discussionVisible: React.PropTypes.bool.isRequired,
		showDiscussionThread: React.PropTypes.func.isRequired,
		hideDiscussionThread: React.PropTypes.func.isRequired,
		toggleLemma: React.PropTypes.func.isRequired,
		showLoginModal: React.PropTypes.func,
	},

	mixins: [ReactMeteorData],

	getInitialState() {
		return {
			sortMethod: 'votes',
		};
	},

	getMeteorData() {
		let discussionComments = [];
		let userDiscussionComments = [];

		let sort = {};
		switch (this.state.sortMethod) {
		case 'votes':
			sort = { votes: -1, updated: 1 };
			break;
		case 'recent':
			sort = { updated: 1, votes: -1 };
			break;
		default:
			break;
		}

		const handle = Meteor.subscribe('discussionComments', this.props.comment._id, Session.get('tenantId'));
		discussionComments = DiscussionComments.find({
			commentId: this.props.comment._id,
			status: 'publish'
		}, {
			sort
		}).fetch();
		userDiscussionComments = DiscussionComments.find({
			commentId: this.props.comment._id,
			userId: Meteor.userId(),
		}, {
			sort
		}).fetch();

		discussionComments.push(...userDiscussionComments);

		return {
			discussionComments,
			ready: handle.ready(),
		};
	},

	showDiscussionThread() {
		this.props.showDiscussionThread(this.props.comment);
	},

	hideDiscussionThread() {
		this.props.hideDiscussionThread();
	},

	addDiscussionComment() {
		const content = $(this.newCommentForm).find('textarea').val();

		Meteor.call('discussionComments.insert', {
			content,
			tenantId: Session.get('tenantId'),
			commentId: this.props.comment._id,
		});

		$(this.newCommentForm).find('textarea').val('');
	},

	sortMethodSelect(value) {
		this.setState({
			sortMethod: value,
		});
	},

	render() {
		const currentUser = Meteor.user();

		let discussionWrapClass = 'discussion-wrap';

		if (this.state.discussionVisible) {
			discussionWrapClass += ' discussion-visible';
		}

		let textareaPlaceholder = '';
		if (currentUser) {
			textareaPlaceholder = 'Enter your comment here . . .';
		} else {
			textareaPlaceholder = 'Please login to enter a comment.';
		}

		let avatarUrl = '/images/default_user.jpg';
		if (currentUser && currentUser.profile && currentUser.profile.avatarUrl) {
			avatarUrl = currentUser.profile.avatarUrl;
		}

		const sortSelectedLabelStyle = {
			color: '#FFFFFF',
		};

		return (

			<div className={discussionWrapClass}>
				<div
					onClick={this.showDiscussionThread}

					className="continue-discussion"
				>
					<h4 className="continue-discussion-label">Discussion</h4>
					<div
						className="continue-discussion-icon"
						onClick={this.props.toggleLemma}
					>
						<i className="mdi mdi-comment" />
						{this.data.discussionComments.length ?
							<span className="continue-discussion-text">
								{this.data.discussionComments.length}
							</span>
						: ''}
					</div>
				</div>

				{!this.data.ready ?
					''
					:
					<div className="discussion-thread">
						<div className="add-comment-wrap paper-shadow ">
							<IconButton
								className="close-discussion paper-shadow"
								iconClassName="mdi mdi-close"
								onClick={() => { this.hideDiscussionThread(); this.props.toggleLemma(); }}
							/>

							<form
								ref={(component) => { this.newCommentForm = component; }}
								className="new-comment-form"
								name="new-comment-form"
							>
								<div className="add-comment-row-1">
									<div className="profile-picture paper-shadow">
										<img
											src={avatarUrl}
											alt="Commentary User"
										/>
									</div>
									<textarea
										className="new-comment-text"
										name="newCommentText"
										placeholder={textareaPlaceholder}
									/>
								</div>
								<div className="add-comment-row-2 add-comment-row">
									<div className="error-message">
										<span className="error-message-text">Please enter your text to submit.</span>
									</div>
									{ currentUser ?
										<RaisedButton
											label="Submit"
											className="submit-comment-button paper-shadow"
											onClick={this.addDiscussionComment}
										/>
										:
										<div
											className="new-comment-login"
										>
											<FlatButton
												label="Login"
												className="login-link"
												onClick={this.props.showLoginModal}
											/>
											<FlatButton
												label="Join"
												className="join-link"
												href="/sign-up"
												target="_blank"
											/>
										</div>
									}
								</div>
							</form>
						</div>
						<div
							className="sort-by-wrap"
						>
							{/*
							 <span className="sort-by-label">Sort by:</span>
							 <RaisedButton
							 label="Top"
							 className="sort-by-option selected-sort sort-by-top"
							 onClick={this.toggleSort}>
							 </RaisedButton>
							 <RaisedButton
							 label="Newest"
							 className="sort-by-option sort-by-new"
							 onClick={this.toggleSort}>
							 </RaisedButton>
							 */}
						</div>
						{this.data.discussionComments.length === 0 ?
							<div className="no-results-wrap">
								<span className="no-results-text">No discussion comments.</span>
							</div>
							:
							<div className="sort-method-select">
								<FlatButton
									label="Top votes"
									labelStyle={this.state.sortMethod === 'votes' ? sortSelectedLabelStyle : {}}
									backgroundColor={this.state.sortMethod === 'votes' ? '#795548' : ''}
									onClick={this.sortMethodSelect.bind(null, 'votes')}
								/>
								<FlatButton
									label="Recent"
									labelStyle={this.state.sortMethod === 'recent' ? sortSelectedLabelStyle : {}}
									backgroundColor={this.state.sortMethod === 'recent' ? '#795548' : ''}
									onClick={this.sortMethodSelect.bind(null, 'recent')}
								/>
							</div>
						}
						{this.data.discussionComments.map((discussionComment, i) =>
							<DiscussionComment
								key={i}
								className="discussion-comment paper-shadow"
								discussionComment={discussionComment}
								currentUser={currentUser}
							/>
						)}
					</div>
				}
			</div>
		);
	},
});
