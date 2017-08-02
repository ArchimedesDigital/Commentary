import React from 'react';
import AvatarIcon from '/imports/ui/components/avatar/AvatarIcon';  
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import { sendSnack } from '/imports/ui/components/shared/SnackAttack';

const CommentUpperLeft = props => (
	<div className="comment-upper-left">
		<h1>{props.title}</h1>
	</div>
);
CommentUpperLeft.propTypes = {
	title: React.PropTypes.string.isRequired,
};

class CommentUpperRight extends React.Component {
	constructor(props) {
		super(props);

		this.subscribe = this.subscribe.bind(this);
	}

	static propTypes = {
		commenters: React.PropTypes.arrayOf(React.PropTypes.shape({
			_id: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired,
			name: React.PropTypes.string.isRequired,
			avatar: React.PropTypes.shape({
				src: React.PropTypes.string.isRequired,
			})
		})).isRequired,
		commentId: React.PropTypes.string.isRequired,
		updateDate: React.PropTypes.string.isRequired,
		userCanEditCommenters: React.PropTypes.arrayOf(React.PropTypes.string)
	}

	static defaultProps = {
		userCanEditCommenters: []
	}

	componentWillMount() {
		const { commenters } = this.props;
		const subscriptions = Meteor.user().subscriptions.commenters;

		this.setState({
			loggedIn: Meteor.user(),
			subscribed: subscriptions.filter((sub) => sub._id === commenters[0]._id).length > 0
		});
	}

	subscribe() {
		const { subscribed } = this.state;
		const { commenters } = this.props;
		const commenter = commenters[0];

		const subscriptions = Meteor.user().subscriptions.commenters;

		if (subscriptions.filter((sub) => sub._id === commenters[0]._id).length > 0 && !subscribed) {
			Meteor.users.update({_id: Meteor.userId()}, {
				$push: {
					'subscriptions.commenters': commenter
				}
			});
			this.setState({
				subscribed: !subscribed
			});
		} else {
			// unsubscribe
			this.setState({
				subscribed: !subscribed
			});
		}
	}

	render() {
		const { commenters, userCanEditCommenters, commentId, updateDate } = this.props;
		const { loggedIn, subscribed } = this.state;

		return (
			<div className="comment-upper-right">
				{commenters.map(commenter => (
					<div
						key={commenter._id}
						className="comment-author"
					>
						{userCanEditCommenters.indexOf(commenter._id) > -1 ?
							<FlatButton
								label="Edit comment"
								href={`/commentary/${commentId}/edit`}
								icon={<FontIcon className="mdi mdi-pen" />}
							/>
							:
							''
						}
						<div className={'comment-author-text'}>
							<a href={`/commenters/${commenter.slug}`}>
								<span className="comment-author-name">{commenter.name}</span>
							</a>
							<span>
								{updateDate}
							</span>
						</div>
						<div className="comment-author-image-wrap paper-shadow">
							<a href={`/commenters/${commenter.slug}`}>
								<AvatarIcon
									avatar={
										(commenter && 'avatar' in commenter) ?
										commenter.avatar.src
										: null
									}
								/>
							</a>
						</div>
						{loggedIn ?
							<div>
								<FlatButton
									label={subscribed ? 'Unsubscribe' : 'Subscribe'}
									onTouchTap={this.subscribe}
								/>
							</div>
						:
							''
						}
					</div>
				))}
			</div>
		);
	}
}

const CommentUpper = props => (
	<div className="comment-upper">
		{!props.hideTitle && <CommentUpperLeft
			title={props.title}
		/>}
		{!props.hideCommenters && <CommentUpperRight
			commenters={props.commenters}
			commentId={props.commentId}
			updateDate={props.updateDate}
			userCanEditCommenters={props.userCanEditCommenters}
		/>}
	</div>
);
CommentUpper.propTypes = {
	title: React.PropTypes.string.isRequired,
	commentId: React.PropTypes.string.isRequired,
	commenters: React.PropTypes.arrayOf(React.PropTypes.shape({
		_id: React.PropTypes.string.isRequired,
		slug: React.PropTypes.string.isRequired,
		name: React.PropTypes.string.isRequired,
		avatar: React.PropTypes.shape({
			src: React.PropTypes.string.isRequired,
		})
	})).isRequired,
	updateDate: React.PropTypes.string.isRequired,
	userCanEditCommenters: React.PropTypes.arrayOf(React.PropTypes.string),
	hideTitle: React.PropTypes.bool,
	hideCommenters: React.PropTypes.bool,
};
CommentUpper.defaultProps = {
	userCanEditCommenters: [],
	hideTitle: false,
	hideCommenters: false,
};

export default CommentUpper;
export { CommentUpperLeft, CommentUpperRight };
