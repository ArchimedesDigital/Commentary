import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { compose } from 'react-apollo';
import slugify from 'slugify';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Cookies from 'js-cookie';

// layouts
import Header from '/imports/ui/layouts/header/Header';

// graphql
import { keywordsQuery, keywordUpdateMutation } from '../../../graphql/methods/keywords';
import { textNodesQuery } from '../../../graphql/methods/textNodes';

// components
import Spinner from '../../../components/loading/Spinner';
import FilterWidget from '../../filters/FilterWidget';
import CommentLemmaSelect from '../../comments/addComment/commentLemma/CommentLemmaSelect';
import EditKeyword from './EditKeyword';
import ContextPanel from '/imports/ui/layouts/commentary/ContextPanel';

// lib
import muiTheme from '../../../lib/muiTheme';
import Utils from '../../../lib/utils';


class EditKeywordLayout extends Component {

	constructor(props) {

		super(props);
		this.state = {
			filters: [],
			selectedLineFrom: 0,
			selectedLineTo: 0,
			selectedType: 'word',
			loading: false,
			snackbarOpen: false,
			snackbarMessage: '',
			contextReaderOpen: true,
			refetchTextNodes: true
		};

		this.handlePermissions = this.handlePermissions.bind(this);
		this.updateSelectedLines = this.updateSelectedLines.bind(this);
		this.toggleSearchTerm = this.toggleSearchTerm.bind(this);
		this.updateKeyword = this.updateKeyword.bind(this);
		this.showSnackBar = this.showSnackBar.bind(this);
		this.getWork = this.getWork.bind(this);
		this.getSubwork = this.getSubwork.bind(this);
		this.getLineLetter = this.getLineLetter.bind(this);
		this.getSelectedLineTo = this.getSelectedLineTo.bind(this);
		this.getType = this.getType.bind(this);
		this.lineLetterUpdate = this.lineLetterUpdate.bind(this);
		this.onTypeChange = this.onTypeChange.bind(this);
		this.handleChangeLineN = this.handleChangeLineN.bind(this);
		this.props.keywordsQuery.refetch({
			tenantId: sessionStorage.getItem('tenantId')
		});
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.keywordsQuery.loading || nextProps.textNodesQuery.loading) {
			if (!nextProps.textNodesQuery.loading) {
				this.setState({
					ready: false
				});
			}
			return;
		}
		const { match } = nextProps;
		const slug = match.params.slug;
		console.log(nextProps.textNodesQuery.textNodes.length);
		const keyword = nextProps.keywordsQuery.keywords.find(x => x.slug === slug);
		if (this.state.refetchTextNodes || nextProps.textNodesQuery.textNodes.length === 100) {
			this.props.textNodesQuery.refetch({
				lineFrom: this.state.selectedLineFrom || keyword.lineFrom || 0,
				lineTo: this.state.selectedLineTo || keyword.lineTo || 0,
				workSlug: keyword.work ? keyword.work.slug : 'iliad',
				subworkN: keyword.subwork ? keyword.subwork.n : 1
			});
			this.setState({
				refetchTextNodes: false
			});
			return;
		}
		this.setState({
			ready: true,
			keyword: keyword,
			textNodes: nextProps.textNodesQuery.textNodes,
			keywords: nextProps.keywordsQuery.keywords
		});
	}
	componentWillUpdate() {
		if (this.state.ready) this.handlePermissions();
	}
	componentWillUnmount() {
		if (this.timeout)			{ clearTimeout(this.timeout); }
	}
	handlePermissions() {
		// if (this.state.ready) {
		// 	if (!Roles.userIsInRole(Cookies.getItem('user')._id, ['editor', 'admin', 'commenter'])) {
		// 		this.props.history.push('/');
		// 	}
		// } // TODo
	}
	updateSelectedLines(selectedLineFrom, selectedLineTo) {
		if (selectedLineFrom === null) {
			this.setState({
				selectedLineTo,
			});
			selectedLineFrom = this.state.selectedLineFrom;
		} else if (selectedLineTo === null) {
			this.setState({
				selectedLineFrom,
			});
			selectedLineTo = this.state.selectedLineTo;
		} else if (selectedLineTo != null && selectedLineTo != null) {
			this.setState({
				selectedLineFrom,
				selectedLineTo,
			});
		} else {
			return;
		}
		const { filters } = this.state;
		let work;
        let subwork;
        let lineTo;
        let lineFrom;
		filters.forEach((filter) => {
			if (filter.key === 'works') {
				work = filter.values[0];
			} else if (filter.key === 'subworks') {
				subwork = filter.values[0];
			} else if (filter.key === 'lineTo') {
				lineTo = filter.values[0];
			} else if (filter.key === 'lineFrom') {
				lineFrom = filter.values[0];
			}
		});
		const properties = {
			workSlug: work ? work.slug : 'iliad',
			subworkN: subwork ? subwork.n : 1,
			lineFrom: selectedLineFrom,
			lineTo: selectedLineTo
		};
		this.props.textNodesQuery.refetch(properties);
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
	updateKeyword(formData, textValue, textRawValue) {
		this.setState({
			loading: true,
		});

		// get data for keyword :
		const work = this.getWork();
		const subwork = this.getSubwork();
		const lineLetter = this.getLineLetter();
		const selectedLineTo = this.getSelectedLineTo();
		const type = this.getType();
		const token = Cookies.get('loginToken');
		const { keyword } = this.state;
		const that = this;
		// create keyword object to be inserted:
		const keywordCandidate = {
			work: {
				title: work.title,
				slug: work.slug,
				order: work.order,
			},
			subwork: {
				title: subwork.title,
				n: subwork.n,
			},
			lineFrom: this.state.selectedLineFrom || keyword.lineFrom,
			lineTo: selectedLineTo || keyword.lineTo,
			lineLetter,
			title: formData.titleValue,
			slug: slugify(formData.titleValue.toLowerCase()),
			description: textValue,
			descriptionRaw: JSON.stringify(textRawValue),
			type: this.state.selectedType,
			tenantId: sessionStorage.getItem('tenantId'),
			count: 1,
		};
		this.props.keywordUpdate(keyword._id, keywordCandidate).then(function() {
			that.props.history.push(`/tags/${keywordCandidate.slug}`);
		});
	}
	showSnackBar(error) {
		this.setState({
			snackbarOpen: error.errors,
			snackbarMessage: error.errorMessage,
		});
		this.timeout = setTimeout(() => {
			this.setState({
				snackbarOpen: false,
			});
		}, 4000);
	}
	getWork() {
		let work = null;
		this.state.filters.forEach((filter) => {
			if (filter.key === 'works') {
				work = filter.values[0];
			}
		});
		if (!work) {
			work = {
				title: 'Iliad',
				slug: 'iliad',
				order: 1,
			};
		}
		return work;
	}
	getSubwork() {
		let subwork = null;
		this.state.filters.forEach((filter) => {
			if (filter.key === 'subworks') {
				subwork = filter.values[0];
			}
		});
		if (!subwork) {
			subwork = {
				title: '1',
				n: 1,
			};
		}
		return subwork;
	}
	getLineLetter() {
		let lineLetter = '';
		if (this.state.selectedLineTo === 0 && this.state.selectedLineFrom > 0) {
			lineLetter = this.commentLemmaSelect.state.lineLetterValue;
		}
		return lineLetter;
	}
	getSelectedLineTo() {
		let selectedLineTo = 0;
		if (this.state.selectedLineTo === 0) {
			selectedLineTo = this.state.selectedLineFrom;
		} else {
			selectedLineTo = this.state.selectedLineTo;
		}
		return selectedLineTo;
	}
	getType() {
		return this.state.selectedType;
	}
	lineLetterUpdate(value) {
		this.setState({
			lineLetter: value,
		});
	}
	onTypeChange(type) {
		this.setState({
			selectedType: type,
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
	render() {
		const filters = this.state.filters;
		const { ready, keyword, keywords } = this.state;
		let work;
		let subwork;
		let lineFrom;
		let lineTo;

		Utils.setTitle('Edit Tag | The Center for Hellenic Studies Commentaries');

		filters.forEach((filter) => {
			if (filter.key === 'works') {
				work = filter.values[0];
			} else if (filter.key === 'subworks') {
				subwork = filter.values[0];
			} else if (filter.key === 'lineTo') {
				lineTo = filter.values[0];
			} else if (filter.key === 'lineFrom') {
				lineFrom = filter.values[0];
			}
		});

		return (
			<MuiThemeProvider>
				{ready && keyword ?
					<div className="chs-layout chs-editor-layout edit-keyword-layout">

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
										ref={(component) => { this.keywordLemmaSelect = component; }}
										lineFrom={this.state.selectedLineFrom || keyword.lineFrom || 0}
										lineTo={this.state.selectedLineTo || keyword.lineTo || 0}
										workSlug={keyword.work ? keyword.work.slug : 'iliad'}
										subworkN={keyword.subwork ? keyword.subwork.n : 1}
										shouldUpdateQuery={this.state.updateQuery}
										updateQuery={this.updateQuery}
										textNodes={this.state.textNodes}
									/>

									<EditKeyword
										selectedLineFrom={this.state.selectedLineFrom || keyword.lineFrom || null}
										selectedLineTo={this.state.selectedLineTo || keyword.lineTo || null}
										submitForm={this.updateKeyword}
										onTypeChange={this.onTypeChange}
										keyword={keyword}
										kewrods={keywords}
									/>

									<ContextPanel
										open={this.state.contextReaderOpen}
										workSlug={work ? work.slug : 'iliad'}
										subworkN={subwork ? subwork.n : 1}
										lineFrom={lineFrom || 1}
										selectedLineFrom={this.state.selectedLineFrom || keyword.lineFrom || 0}
										selectedLineTo={this.state.selectedLineTo || keyword.lineTo || 0}
										updateSelectedLines={this.updateSelectedLines}
										editor
									/>
								</div>
							</div>
						</main>

						<FilterWidget
							filters={filters}
							toggleSearchTerm={this.toggleSearchTerm}
						/>
					</div>
					:
					<Spinner fullPage />
				}
			</MuiThemeProvider>
		);
	}
}
EditKeywordLayout.propTypes = {
	slug: PropTypes.string,
	history: PropTypes.object,
	keywordUpdate: PropTypes.func,
	match: PropTypes.object,
	keywordsQuery: PropTypes.object,
	textNodesQuery: PropTypes.object
};
export default compose(
	keywordsQuery,
	keywordUpdateMutation,
	textNodesQuery
)(EditKeywordLayout);
