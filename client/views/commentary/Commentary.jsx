import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Avatars } from '/imports/avatar/avatar_collections.js';
import { debounce } from 'throttle-debounce';
import InfiniteScroll from '/imports/InfiniteScroll.jsx';

Commentary = React.createClass({

	propTypes: {
		isOnHomeView: React.PropTypes.bool,
		filters: React.PropTypes.array.isRequired,
		loadMoreComments: React.PropTypes.func.isRequired,
		toggleSearchTerm: React.PropTypes.func.isRequired,
		comments: React.PropTypes.array.isRequired,
		commentsReady: React.PropTypes.bool,
	},

	childContextTypes: {
		muiTheme: React.PropTypes.object.isRequired,
	},

	mixins: [ReactMeteorData],

	getInitialState() {
		return {
			contextCommentGroupSelected: {},
			contextPanelOpen: false,
			discussionSelected: {},
			discussionPanelOpen: false,
			referenceLemma: [],
			referenceLemmaSelectedEdition: {
				lines: [],
			},
			commentLemmaGroups: [],
			commentGroups: [],
		};
	},

	getChildContext() {
		return {
			muiTheme: getMuiTheme(baseTheme),
		};
	},

	componentDidMount() {
		window.addEventListener('resize', this.handleScroll);
		window.addEventListener('scroll', this.handleScroll);
	},

	getMeteorData() {
		const commentGroups = [];

		// Make comment groups from comments
		let isInCommentGroup = false;
		this.props.comments.forEach((comment) => {
			isInCommentGroup = false;
			commentGroups.forEach((commentGroup) => {
				if (
					comment.work.title === commentGroup.work.title
					&& comment.subwork.n === commentGroup.subwork.n
					&& comment.lineFrom === commentGroup.lineFrom
					&& comment.lineTo === commentGroup.lineTo
				) {
					isInCommentGroup = true;
					commentGroup.comments.push(comment);
				}
			});

			if (!isInCommentGroup) {
				let ref;

				if (comment.work.title === 'Homeric Hymns') {
					ref = `Hymns ${comment.subwork.n}.${comment.lineFrom}`;
				} else {
					ref = `${comment.work.title} ${comment.subwork.n}.${comment.lineFrom}`;
				}

				commentGroups.push({
					ref,
					selectedLemmaEdition: {
						lines: [],
					},
					work: comment.work,
					subwork: comment.subwork,
					lineFrom: comment.lineFrom,
					lineTo: comment.lineTo,
					nLines: comment.nLines,
					comments: [comment],
				});
			}
		});

		// Unique commenters for each comment group
		commentGroups.forEach((commentGroup, commentGroupIndex) => {
			// let isInCommenters = false;
			const commenters = [];
			const avatarSubscription = Meteor.subscribe('avatars.commenter.all');
			const commenterSubscription = Meteor.subscribe('commenters');
			if (avatarSubscription.ready() && commenterSubscription.ready()) {
				commentGroup.comments.forEach((comment, commentIndex) => {
					// isInCommenters = false;

					comment.commenters.forEach((commenter, i) => {
						const commenterRecord = Commenters.findOne({
							slug: commenter.slug,
						});
						commentGroups[commentGroupIndex].comments[commentIndex].commenters[i] = commenterRecord;

						// get commenter avatar
						if (commenterRecord.avatar) {
							commenterRecord.avatarData = Avatars.findOne(commenterRecord.avatar);
						}

						// add to the unique commenter set
						if (commenters.some((c) => c.slug === commenter.slug)) {
							// isInCommenters = true;
						} else {
							commenters.push(commenterRecord);
						}
					});
				});
			}

			commentGroups[commentGroupIndex].commenters = commenters;
		});

		return {
			commentGroups,
		};
	},

	handleScroll() {
		const scrollY = window.scrollY;
		this.data.commentGroups.forEach((commentGroup, i) => {
			const id = `#comment-group-${i}`;
			const offset = $(id).offset();
			const height = $(`${id} .comments`).height();
			const element = $(id).find(
				'.comment-group-meta-inner,.comment-group-meta-inner-fixed,.comment-group-meta-inner-bottom'
			);
			if (offset && scrollY < offset.top) {
				element.addClass('comment-group-meta-inner');
				element.removeClass('comment-group-meta-inner-fixed');
				element.removeClass('comment-group-meta-inner-bottom');
			} else if (scrollY >= offset.top && scrollY < (offset.top + height) - 275) {
				element.addClass('comment-group-meta-inner-fixed');
				element.removeClass('comment-group-meta-inner');
				element.removeClass('comment-group-meta-inner-bottom');
			} else {
				element.addClass('comment-group-meta-inner-bottom');
				element.removeClass('comment-group-meta-inner-fixed');
				element.removeClass('comment-group-meta-inner');
			}
		});
	},

	loadMoreComments() {
		if (!this.props.isOnHomeView && this.data.commentGroups.length) {
			this.props.loadMoreComments();
		}
	},

	toggleLemmaEdition() {
		this.setState({
			selectedLemmaEdition: {},
		});
	},

	searchReferenceLemma() {
		this.setState({
			referenceLemma: [],
			referenceLemmaSelectedEdition: {
				lines: [],
			},
		});
	},

	showContextPanel(commentGroup) {
		this.setState({
			contextCommentGroupSelected: commentGroup,
			contextPanelOpen: true,
		});
	},

	closeContextPanel() {
		this.setState({
			contextCommentGroupSelected: {},
			contextPanelOpen: false,
		});
	},

	contextScrollPosition(scrollPosition, index) {
		this.setState({
			contextScrollPosition: scrollPosition,
			commentLemmaIndex: index,
		});
	},

	render() {
		let isOnHomeView;
		let commentsClass = 'comments ';

		if ('isOnHomeView' in this.props) {
			isOnHomeView = this.props.isOnHomeView;
		} else {
			isOnHomeView = false;
		}

		if (this.state.contextPanelOpen) {
			commentsClass += 'lemma-panel-visible';
		}

		return (
			<div className="commentary-primary content ">
				{/* --- BEGIN comments list */}
				<InfiniteScroll
					endPadding={120}
					loadMore={debounce(1000, this.loadMoreComments)}
				>
					<div className="commentary-comments commentary-comment-groups">
						{this.data.commentGroups.map((commentGroup, commentGroupIndex) => (
							<div
								className="comment-group "
								data-ref={commentGroup.ref}
								key={commentGroupIndex}
								id={`comment-group-${commentGroupIndex}`}
							>
								<div className={commentsClass}>
									<CommentLemma
										index={commentGroupIndex}
										commentGroup={commentGroup}
										showContextPanel={this.showContextPanel}
										scrollPosition={this.contextScrollPosition}
									/>
									{commentGroup.comments.map((comment, commentIndex) => (
										<CommentDetail
											key={commentIndex}
											commentGroup={commentGroup}
											comment={comment}
											toggleSearchTerm={this.props.toggleSearchTerm}
											checkIfToggleLemmaReferenceModal={this.checkIfToggleLemmaReferenceModal}
											filters={this.props.filters}
											isOnHomeView={isOnHomeView}
										/>
									))}
								</div>
								<hr className="comment-group-end" />
							</div>
						))}
					</div>
				</InfiniteScroll>
				{(!isOnHomeView && this.data.commentGroups.length > 0) ?
					<div className="ahcip-spinner commentary-loading">
						<div className="double-bounce1" />
						<div className="double-bounce2" />

					</div>
					: '' }
				{/* --- END comments list */}
				{/* --- BEGIN no comments found */}
				{(this.props.commentsReady && this.data.commentGroups.length === 0) ?
					<div className="no-commentary-wrap">
						<p className="no-commentary no-results">
							No commentary available for the current search.
						</p>
					</div>
					: ''}
				{/* --- END no comments found */}
				{/* <div className="lemma-reference-modal">
				 <article className="comment	lemma-comment paper-shadow ">
				 {this.state.referenceLemmaSelectedEdition.lines.map(function(line, i) {
				 return (<p
				 key={i}
				 className="lemma-text"
				 dangerouslySetInnerHTML={{ __html: line.html }}
				 />);
				 })}
				 <div className="edition-tabs tabs">
				 {this.state.referenceLemma.map(function(lemma_text_edition, i) {
				 return (<FlatButton
				 key={i}
				 label={edition.title}
				 data-edition={edition.title}
				 className="edition-tab tab"
				 onClick={this.toggleLemmaEdition}
				 />);
				 })}
				 </div>
				 <i
				 className="mdi mdi-close paper-shadow"
				 onClick={this.hideLemmaReference}
				 />
				 </article>
				 </div>*/}
				{'work' in this.state.contextCommentGroupSelected ?
					<ContextPanel
						open={this.state.contextPanelOpen}
						closeContextPanel={this.closeContextPanel}
						commentGroup={this.state.contextCommentGroupSelected}
						scrollPosition={this.state.contextScrollPosition}
						commentLemmaIndex={this.state.commentLemmaIndex}
					/>
					: ''}
				<FilterWidget
					filters={this.props.filters}
					toggleSearchTerm={this.props.toggleSearchTerm}
				/>
			</div>
		);
	},
});
