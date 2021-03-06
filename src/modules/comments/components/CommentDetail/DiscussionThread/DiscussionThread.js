import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import Cookies from 'js-cookie';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';

// graphql
import discussionCommentInsert from '../../../../discussionComments/graphql/mutations/discussionCommentInsert';
import discussionCommentsQuery  from '../../../../discussionComments/graphql/queries/discussionCommentsQuery';

import { usersQuery } from '../../../../users/graphql/queries/users';

// lib
// import Utils from '../../../../../lib/utils';

// components
import DiscussionComment from '../../../../discussionComments/components/DiscussionComment/DiscussionComment';

class DiscussionThread extends Component {

	constructor(props) {
		super(props);
		this.state = {
			sortMethod: 'votes',
			discussionComments: [],
			getDissComments: true,
			ready: false,
			discussionCommentsDisabled: []
		}
		this.showDiscussionThread = this.showDiscussionThread.bind(this);
		this.hideDiscussionThread = this.hideDiscussionThread.bind(this);
		this.addDiscussionComment = this.addDiscussionComment.bind(this);
		this.sortMethodSelect = this.sortMethodSelect.bind(this);
	}
	componentWillReceiveProps(props) {
		/**

		Disable discussion comment functionality until requested to reinstate it for the project

		if (props.usersQuery.loading || !props.comment || props.discussionCommentsQuery.loading) {
			return null;
		}

		const { tenantId } = this.props;

		if (this.state.getDissComments) {
			props.discussionCommentsQuery.refetch({
				tenantId,
				commentId: props.comment._id
			});
			this.setState({
				getDissComments: false
			});
			return;
		}
		let discussionComments = props.discussionCommentsQuery.discussionComments;
		let helpArray = JSON.parse(JSON.stringify(props.discussionCommentsQuery.discussionComments));
		switch (this.state.sortMethod) {
		case 'votes':
			helpArray.sort(Utils.sortBy('votes', 'updated'));
			discussionComments = helpArray;
			break;
		case 'recent':
			helpArray.sort(Utils.sortBy('updated', 'votes'));
			discussionComments = helpArray;
			break;
		default:
			break;
		}
		this.setState({
			discussionComments: discussionComments,
			users: props.usersQuery.users,
			ready: true
		});
		*/

		this.setState({
			ready: true,
		});
	}
	showDiscussionThread() {
		this.props.showDiscussionThread(this.props.comment);
	}
	hideDiscussionThread() {
		this.props.hideDiscussionThread();
	}
	addDiscussionComment() {
		const content = $(this.newCommentForm).find('textarea').val();

		this.props.discussionCommentInsert(
			this.props.comment._id,
			content,
			this.props.tenantId,
		);

		$(this.newCommentForm).find('textarea').val('');
	}
	sortMethodSelect(value) {
		this.setState({
			sortMethod: value,
		});
	}
	render() {
		const currentUser = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : undefined;
		const { comment, toggleLemma, showLoginModal } = this.props;
		const { discussionComments, discussionCommentsDisabled } = this.state

		if (!discussionComments) {
			return null;
		}

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
						onClick={toggleLemma}
					>
						<i className="mdi mdi-comment" />
						{this.state.discussionComments.length ?
							<span className="continue-discussion-text">
								{this.state.discussionComments.length}
							</span>
							: ''}
					</div>
				</div>

				{!this.state.ready ?
					''
					:
					<div className="discussion-thread">
						{comment.discussionCommentsDisabled || discussionCommentsDisabled ?
							<div className="add-comment-wrap paper-shadow">
								<IconButton
									className="close-discussion paper-shadow"
									iconClassName="material-icons"
									onClick={() => { this.hideDiscussionThread(); toggleLemma(); }}
								>close
								</IconButton>
								<div className="no-results-wrap">
									<span className="no-results-text">The discussion comments are currently disabled for this commentary.</span>
								</div>
							</div>
							:
							<div className="add-comment-wrap paper-shadow ">
								<IconButton
									className="close-discussion paper-shadow"
									iconClassName="material-icons"
									onClick={() => { this.hideDiscussionThread(); toggleLemma(); }}
								>close
								</IconButton>

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
													onClick={showLoginModal}
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
						}
						<div
							className="sort-by-wrap"
						/>
						{this.state.discussionComments.length === 0 ?
							<div className="no-results-wrap">
								{!comment.discussionCommentsDisabled && !discussionCommentsDisabled ?
									<span className="no-results-text">No discussion comments.</span>
									: ''}
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
						{this.state.discussionComments.map((discussionComment, i) =>
							(<DiscussionComment
								key={i}
								className="discussion-comment paper-shadow"
								discussionComment={discussionComment}
								currentUser={currentUser}
							/>)
						)}
					</div>
				}
			</div>
		);
	}
}

DiscussionThread.propTypes = {
	comment: PropTypes.object.isRequired,
	discussionVisible: PropTypes.bool.isRequired,
	showDiscussionThread: PropTypes.func.isRequired,
	hideDiscussionThread: PropTypes.func.isRequired,
	toggleLemma: PropTypes.func.isRequired,
	showLoginModal: PropTypes.func,
	discussionCommentsQuery: PropTypes.object,
	commenters: PropTypes.array,
	discussionCommentInsert: PropTypes.func
};

const mapStateToProps = (state, props) => ({
	tenantId: state.tenant.tenantId,
});

export default compose(
	discussionCommentsQuery,
	discussionCommentInsert,
	usersQuery,
	connect(mapStateToProps),
)(DiscussionThread);
