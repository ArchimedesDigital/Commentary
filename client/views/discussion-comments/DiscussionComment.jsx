import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

DiscussionComment = React.createClass({

	propTypes: {
		discussionComment: React.PropTypes.object.isRequired,
		currentUser: React.PropTypes.object,
	},

	getInitialState() {
		return {
			editMode: false,
		};
	},

	showEditMode() {
		this.setState({
			editMode: true,
		});
	},

	closeEditMode() {
		this.setState({
			editMode: false,
		});
	},

	updateDiscussionComment() {
		const content = $(this.refs.updateCommentForm).find('textarea').val();

		Meteor.call('discussionComments.update', {
			_id: this.props.discussionComment._id,
			content,
		});

		this.setState({
			editMode: false,
		});
	},

	upvoteDiscussionComment() {
		if (typeof this.props.currentUser !== 'undefined') {
			Meteor.call('discussionComments.upvote',
				this.props.discussionComment._id
			);
		}
	},

	render() {
		const self = this;
		const userIsLoggedIn = Meteor.user();
		const discussionComment = this.props.discussionComment;
		discussionComment.children = [];
		let userUpvoted = false;
		let username = '';

		if (
			'emails' in discussionComment.user
			&& discussionComment.user.emails.length
		) {
			username = discussionComment.user.emails[0].address.split('@')[0];
		}

		if (
				typeof this.props.currentUser !== 'undefined'
			&& discussionComment.voters.indexOf(this.props.currentUser._id) >= 0
		) {
			userUpvoted = true;
		}

		return (<div
			className="discussion-comment paper-shadow"
		>
			<div
				className="inner-comment-row"
			>

				<div className="discussion-commenter-profile-picture profile-picture paper-shadow">
					<img src="/images/default_user.jpg" alt={username} />
				</div>

				<div className="discussion-commenter-meta">
					<span className="discussion-commenter-name">
						{username}
					</span>
					<span className="discussion-comment-date">
						<span >Updated: </span>
						{moment(discussionComment.updated).format('D MMMM YYYY')
						|| moment(discussionComment.created).format('D MMMM YYYY')}
					</span>
				</div>

			</div>
			<div className="inner-comment-row">
				<div className="discussion-comment-text">
						{/* <div
							dangerouslySetInnerHTML={{ __html: discussionComment.content}}
							></div> */}
						{this.state.editMode ?
							<form
								className="update-comment-form clearfix"
								name="update-comment-form"
								ref="updateCommentForm"
							>
								<textarea
									className="new-comment-text"
									defaultValue={this.props.discussionComment.content}
								/>
								<div className="comment-edit-buttons">
									<RaisedButton
										label="Update"
										className="submit-comment-button paper-shadow"
										onClick={this.updateDiscussionComment}
									/>
									<FlatButton
										label="Close"
										className="close-form-button"
										onClick={this.closeEditMode}
									/>
								</div>
							</form>
						:
							<div>{discussionComment.content}</div>

					}

				</div>
			</div>
			<div className="inner-comment-row">
				<FlatButton
					label={discussionComment.votes}
					onClick={this.upvoteDiscussionComment}
					className={(userUpvoted) ? 'vote-up upvoted' : 'vote-up'}
					icon={<FontIcon className="mdi mdi-chevron-up" />}
				>
					{userIsLoggedIn ?
						''
						:
						<span className="vote-up-tooltip">
							You must be signed in to upvote.
						</span>
					}
				</FlatButton>

				{('currentUser' in self.props && self.props.currentUser !== null && typeof self.props.currentUser !== 'undefined')
					? (self.props.currentUser._id === discussionComment.user._id) ?
						<FlatButton
							label="Edit"
							onClick={this.showEditMode}
							className="edit"
						/>
						: ''
					: ''
				}
			</div>


			{false ?
				<div className="reply-create-form" >
					<div className="add-comment-wrap">
						<form
							className="new-comment-form"
							name="new-comment-form"
						>
							<div className="add-comment-row-1" >
								<textarea
									className="new-comment-text"
									placeholder="Enter your reply here . . . "
								/>
								<RaisedButton
									label="Submit"
									type="submit"
									className="submit-comment-button paper-shadow"
								/>
								<RaisedButton
									label="Close Reply"
									className="close-form-button"
									onClick={this.closeReply}
								/>
							</div>
						</form>
					</div>
				</div>
			: ''}

			<div className="discussion-comment-children">

				{discussionComment.children.map((discussionCommentChild, j) =>
					<div
						key={j}
						className="discussion-comment discussion-comment-child"
					>
						<div className="inner-comment-row">
							<div className="discussion-commenter-profile-picture profile-picture paper-shadow">
								<img src="/images/default_user.png" alt={username} />
							</div>
							<div className="discussion-commenter-meta">
								<span className="discussion-commenter-name">
									{discussionCommentChild.user.name}
								</span>
								<span className="discussion-comment-date">
									{discussionCommentChild.updated}
								</span>
							</div>
						</div>
						<div className="inner-comment-row">
							<div className="discussion-comment-text">
								<p
									dangerouslySetInnerHTML={{
										__html: discussionCommentChild.content,
									}}
								/>
							</div>
						</div>
						<div className="inner-comment-row">
							<FlatButton
								label={discussionComment.votes}
								onClick={this.upvoteDiscussionComment}
								className="vote-up upvoted"
								icon={<FontIcon className="mdi mdi-chevron-up" />}
							/>
							<FlatButton
								label="Reply"
								onClick={this.showReplyForm}
								className="reply"
							/>
							<FlatButton
								label="Edit"
								onClick={this.editDiscussionComment}
								className="edit"
							/>
							<FlatButton
								label="Remove"
								onClick={this.removeDiscussionComment}
								className="remove"
							/>
						</div>

					{/* <!-- .discussion-comment-child --> */}</div>
				)}
				{/* <!-- .discussion-comment-children --> */}</div>
			{/* <!-- .discussion-comment --> */}</div>
		);
	},

});
