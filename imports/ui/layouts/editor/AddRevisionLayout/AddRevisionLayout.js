import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import { Roles } from 'meteor/alanning:roles';
import { compose } from 'react-apollo';
import slugify from 'slugify';
import Cookies from 'js-cookie';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Snackbar from 'material-ui/Snackbar';

// components:
import Header from '/imports/ui/layouts/header/Header';
import FilterWidget from '/imports/ui/components/commentary/FilterWidget';
import CommentLemmaSelect from '/imports/ui/components/editor/addComment/CommentLemmaSelect';
import AddRevision from '/imports/ui/components/editor/addRevision/AddRevision';
import ContextPanel from '/imports/ui/layouts/commentary/ContextPanel';

// graphql
import { keywordsQuery } from '/imports/graphql/methods/keywords';
import { commentersQuery } from '/imports/graphql/methods/commenters';
import { textNodesQuery } from '/imports/graphql/methods/textNodes';
import { commentsQueryById, commentsUpdateMutation } from '/imports/graphql/methods/comments';

// lib
import muiTheme from '/imports/lib/muiTheme';
import Utils from '/imports/lib/utils';

class AddRevisionLayout extends Component {

	constructor(props) {
		super(props);
		this.state = {
			filters: [],
			contextReaderOpen: true,
			snackbarOpen: false,
			snackbarMessage: '',
			ready: false
		};

		this.addRevision = this.addRevision.bind(this);
		this.update = this.update.bind(this);
		this.getKeywords = this.getKeywords.bind(this);
		this.closeContextReader = this.closeContextReader.bind(this);
		this.openContextReader = this.openContextReader.bind(this);
		this.handlePermissions = this.handlePermissions.bind(this);
		this.toggleSearchTerm = this.toggleSearchTerm.bind(this);
		this.handleChangeLineN = this.handleChangeLineN.bind(this);
		this.showSnackBar = this.showSnackBar.bind(this);

		this.props.keywordsQuery.refetch({
			tenantId: sessionStorage.getItem('tenantId')
		});
		this.props.commentsQueryById.refetch();
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.commentsQueryById.loading || 
			nextProps.keywordsQuery.loading || 
			nextProps.commentersQuery.loading ||
			nextProps.textNodesQuery.loading) {
			this.setState({
				ready: false
			});
			return;
		}
		const commentId = nextProps.match.params.commentId;
		
		const comment = nextProps.commentsQueryById.comments[0];
		const tenantCommenters = nextProps.commentersQuery.commenters;
		const commenters = [];
		if (comment) {
			comment.commenters.forEach((commenter) => {
				commenters.push(tenantCommenters.find(x =>
					x.slug === commenter.slug,
				));
			});
		}
		if (!this.props.textNodesQuery.variables.workSlug) {
			this.props.textNodesQuery.refetch({
				tenantId: sessionStorage.getItem('tenantId'),
				lineFrom: comment.lineFrom,
				lineTo: comment.lineTo,
				workSlug: comment.work.slug,
				subworkN: comment.subwork.n
			});
			return;
		}
		const keywords = nextProps.keywordsQuery.keywords;
		this.setState({
			comment: comment,
			ready: !nextProps.commentsQueryById.loading && !nextProps.commentsQueryById.loading,
			keywords: keywords,
			commenters: commenters
		});
	}
	componentWillUpdate() {
		if (this.state.ready) this.handlePermissions();
	}
	addRevision(formData, textValue, textRawValue) {
		const self = this;
		const { comment } = this.state;
		const token = Cookies.get('loginToken');
		const revision = {
			title: formData.titleValue,
			text: textValue,
			textRaw: textRawValue,
			created: new Date(),
			slug: slugify(formData.titleValue),
		};

		Meteor.call('comments.add.revision', token, comment._id, revision, (err) => {
			if (err) {
				console.error('Error adding revision', err);
				this.showSnackBar(err.error);
			} else {
				this.showSnackBar('Revision added');
			}
			self.update(formData);
		});
		// TODO: handle behavior after comment added (add info about success)
	}
	update(formData) {
		const { comment } = this.state;

		const keywords = this.getKeywords(formData);
		const authToken = Cookies.get('loginToken');

		let update = [{}];
		if (keywords) {
			update = {
				keywords,
				referenceWorks: formData.referenceWorks,
				commenters: Utils.getCommenters(formData.commenterValue)
			};
		}
		this.props.commentUpdate(comment.id, update).then(function() {
			this.props.history.push(`/commentary/${comment._id}/edit`);
		});
	}
	getKeywords(formData) {
		const keywords = [];

		formData.tagsValue.forEach((tag) => {
			const keyword = tag.keyword;
			keyword.isMentionedInLemma = tag.isMentionedInLemma;
			keywords.push(keyword);
		});
		return keywords;
	}
	closeContextReader() {
		this.setState({
			contextReaderOpen: false,
		});
	}
	openContextReader() {
		this.setState({
			contextReaderOpen: true,
		});
	}
	handlePermissions() {
		if (this.state.comment && this.state.commenters.length) {
			let isOwner = false;
			this.state.commenters.forEach((commenter) => {
				if (!isOwner) {
					isOwner = (Meteor.user().canEditCommenters.indexOf(commenter._id));
				}
			});
			if (!isOwner) {
				this.props.history.push('/');
			}
		}
	}
	toggleSearchTerm(key, value) {
		const filters = this.state.filters;
		let keyIsInFilter = false;
		let valueIsInFilter = false;
		let filterValueToRemove;
		let filterToRemove;

		filters.forEach((filter, i) => {
			if (filter.key === key) {
				keyIsInFilter = true;

				filter.values.forEach((filterValue, j) => {
					if (filterValue._id === value._id) {
						valueIsInFilter = true;
						filterValueToRemove = j;
					}
				});

				if (valueIsInFilter) {
					filter.values.splice(filterValueToRemove, 1);
					if (filter.values.length === 0) {
						filterToRemove = i;
					}
				} else if (key === 'works') {
					filters[i].values = [value];
				} else {
					filter.values.push(value);
				}
			}
		});


		if (typeof filterToRemove !== 'undefined') {
			filters.splice(filterToRemove, 1);
		}

		if (!keyIsInFilter) {
			filters.push({
				key,
				values: [value],
			});
		}

		this.setState({
			filters,
			skip: 0,
		});
	}
	handleChangeLineN(e) {
		const filters = this.state.filters;

		if (e.from > 1) {
			let lineFromInFilters = false;

			filters.forEach((filter, i) => {
				if (filter.key === 'lineFrom') {
					filters[i].values = [e.from];
					lineFromInFilters = true;
				}
			});

			if (!lineFromInFilters) {
				filters.push({
					key: 'lineFrom',
					values: [e.from],
				});
			}
		} else {
			let filterToRemove;

			filters.forEach((filter, i) => {
				if (filter.key === 'lineFrom') {
					filterToRemove = i;
				}
			});

			if (typeof filterToRemove !== 'undefined') {
				filters.splice(filterToRemove, 1);
			}
		}

		if (e.to < 2100) {
			let lineToInFilters = false;

			filters.forEach((filter, i) => {
				if (filter.key === 'lineTo') {
					filters[i].values = [e.to];
					lineToInFilters = true;
				}
			});

			if (!lineToInFilters) {
				filters.push({
					key: 'lineTo',
					values: [e.to],
				});
			}
		} else {
			let filterToRemove;

			filters.forEach((filter, i) => {
				if (filter.key === 'lineTo') {
					filterToRemove = i;
				}
			});

			if (typeof filterToRemove !== 'undefined') {
				filters.splice(filterToRemove, 1);
			}
		}

		this.setState({
			filters,
		});
	}
	showSnackBar(message) {
		this.setState({
			snackbarOpen: true,
			snackbarMessage: message,
		});
		this.timeout = setTimeout(() => {
			this.timeout = this.setState({
				snackbarOpen: false,
			});
		}, 4000);
	}
	componentWillUnmount() {
		if (this.timeout)			{ clearTimeout(this.timeout); }
	}
	render() {
		const filters = this.state.filters;
		const { ready, comment } = this.state;

		Utils.setTitle('Add Revision | The Center for Hellenic Studies Commentaries');

		return (
			<MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
				{ready && comment ?
					<div className="chs-layout chs-editor-layout add-comment-layout">

						<Header
							toggleSearchTerm={this.toggleSearchTerm}
							handleChangeLineN={this.handleChangeLineN}
							filters={filters}
							initialSearchEnabled
							addCommentPage
						/>

						<main>

							<div className="commentary-comments">
								<div className="comment-group">
									<CommentLemmaSelect
										ref={(component) => { this.commentLemmaSelect = component; }}
										lineFrom={comment.lineFrom}
										lineTo={(comment.lineFrom + comment.nLines) - 1}
										workSlug={comment.work.slug}
										subworkN={comment.subwork.n}
										shouldUpdateQuery={this.state.updateQuery}
										updateQuery={this.updateQuery}
										textNodes={this.props.textNodesQuery.loading ? [] : this.props.textNodesQuery.textNodes}
									/>

									<AddRevision
										submitForm={this.addRevision}
										update={this.update}
										comment={comment}
									/>

									<ContextPanel
										open={this.state.contextReaderOpen}
										workSlug={comment.work.slug}
										subworkN={comment.subwork.n}
										lineFrom={comment.lineFrom}
										selectedLineFrom={comment.lineFrom}
										selectedLineTo={(comment.lineFrom + comment.nLines) - 1}
										editor
										disableEdit
									/>
								</div>
							</div>


						</main>

						<FilterWidget
							filters={filters}
							toggleSearchTerm={this.toggleSearchTerm}
						/>
						<Snackbar
							className="editor-snackbar"
							open={this.state.snackbarOpen}
							message={this.state.snackbarMessage}
							autoHideDuration={4000}
						/>

					</div>
					:
					<div className="ahcip-spinner commentary-loading full-page-spinner">
						<div className="double-bounce1" />
						<div className="double-bounce2" />
					</div>
				}

			</MuiThemeProvider>
		);
	}
}
AddRevisionLayout.propTypes = {
	history: PropTypes.object,
	commentUpdate: PropTypes.func,
	commentersQuery: PropTypes.object,
	commentsQueryById: PropTypes.object,
	keywordsQuery: PropTypes.object,
	match: PropTypes.object,
	textNodesQuery: PropTypes.object

};

export default compose(
	commentersQuery,
	keywordsQuery,
	commentsQueryById,
	commentsUpdateMutation,
	textNodesQuery
)(AddRevisionLayout);
