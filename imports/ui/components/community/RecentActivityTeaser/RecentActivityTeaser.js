import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-apollo';

import moment from 'moment';

// graphql
import { settingsQuery } from '/imports/graphql/methods/settings';
import { commentersQuery } from '/imports/graphql/methods/commenters';
import { booksQuery } from '/imports/graphql/methods/books';
import { tenantsQuery } from '/imports/graphql/methods/tenants';

import Utils from '/imports/lib/utils';
import AvatarIcon from '/imports/ui/components/avatar/AvatarIcon';
import { Link } from 'react-router-dom';

class RecentActivityTeaser extends React.Component {
	static propTypes = {
		comment: PropTypes.object.isRequired,
		commentersQuery: PropTypes.object,
		tenantsQuery: PropTypes.object,
		settingsQuery: PropTypes.object,
		booksQuery: PropTypes.object
	}
	constructor(props) {
		super(props);
		this.state = {
			tenantId: sessionStorage.getItem('tenantId')
		};
	}
	componentWillReceiveProps(nextProps) {
		const commenterIds = [];
		const tenantId = this.state.tenantId;
		let userIds = [];
		let commenters = [];
		let users = [];
		let tenant;
		let book;
		let settings;
	
		if (nextProps.comment) {
	
			if (nextProps.comment.commenters) {
				nextProps.comment.commenters.forEach((commenter) => {
					commenterIds.push(commenter._id);
				});
			}
	
			if (nextProps.comment.users) {
				userIds = nextProps.comment.users;
			}
			
			commenters = currentCommenters = nextProps.commentersQuery.loading ? [] : nextProps.commentersQuery.commenters.filter(x =>
				commenterIds.find(y => y === x._id) !== undefined);
		
			users = Meteor.users.find({ _id: { $in: userIds } }).fetch();
			tenant = nextProps.tenantsQuery.loading ? {} : nextProps.tenantsQuery.tenants.find(x => x._id === tenantId);
			book = nextProps.booksQuery.loading ? {} : nextProps.booksQuery.find(x => 
				x.chapters.url === nextProps.comment.bookChapterUrl);
			settings = nextProps.settingsQuery.loading ? {} : nextProps.settingsQuery.settings.find(x => x.tenantId === tenantId);
		}
		this.setState({
			commenters: commenters,
			users: users,
			tenant: tenant,
			book: book,
			settings: settings
		});
	}
	render() {
		const { comment } = this.props;
		const { commenters, users, tenant, settings, book } = this.state;

		const styles = {
			commenterAvatar: {
				backgroundSize: 'cover',
			}
		};
		let title = '';
		let excerpt = '';
		let byline = '';
		let avatarUrl = '';
		let username = '';
		let user;
		let commenter;
		let commentUrl = `/commentary?_id=${comment._id}`;

		const mostRecentRevision = comment.revisions[comment.revisions.length - 1];

		title = mostRecentRevision.title;
		if (mostRecentRevision.text) {
			excerpt = Utils.trunc(mostRecentRevision.text.replace(/(<([^>]+)>)/ig, ''), 120);
		}

		if (commenters && commenters.length) {
			// TODO: support multiple user annotations
			commenter = commenters[0];

			byline = `By ${commenter.name} ${moment(comment.updated).fromNow()}`;
			if ('avatar' in commenter) {
				avatarUrl = commenter.avatar.src;
			}
		}

		if (settings) {
			commentUrl = `https://${settings.domain}${commentUrl}`;
		}


		if (comment.isAnnotation) {
			// TODO: support multiple user annotations
			user = users[0];

			if (!user) {
				return null;
			}

			if ('profile' in user && user.profile.name) {
				username = user.profile.name;
			} else if (user.username) {
				username = user.username;
			} else if (user.emails.length) {
				username = user.emails[0].address;
			}

			byline = `By ${username} ${moment(comment.updated).fromNow()}`;
			avatarUrl = user.avatarUrl;

			if (book) {
				title = `Annotation on ${book.title}`;
				book.chapters.forEach((chapter) => {
					if (chapter.url === comment.bookChapterUrl) {
						title = `${title}: ${chapter.title}`;
					}
				});
			}

			commentUrl = `http://chs.harvard.edu/${comment.bookChapterUrl}?paragraph=${comment.paragraphN}`;
		}

		return (
			<div className="recentActivityTeaser clearfix">
				<div className="recentActivityTeaserLeft">
					<AvatarIcon avatar={avatarUrl} />
				</div>

				<div className="recentActivityTeaserRight">
					<Link to={commentUrl} target="_blank" rel="noopener noreferrer">
						<h4 className="recentActivityTitle">
							{title}
						</h4>
					</Link>
					<span className="recentActivityByline">
						{byline}
					</span>
					<p className="recentActivityExcerpt">
						{excerpt}
					</p>
				</div>
			</div>
		);
	}
}

export default compose(
	commentersQuery,
	booksQuery,
	tenantsQuery,
	settingsQuery
)(RecentActivityTeaser);
