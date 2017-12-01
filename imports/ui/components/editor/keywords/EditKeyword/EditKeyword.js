import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';
import RaisedButton from 'material-ui/RaisedButton';
import { compose } from 'react-apollo';
import FontIcon from 'material-ui/FontIcon';
import Snackbar from 'material-ui/Snackbar';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
// https://github.com/JedWatson/react-select
import { EditorState, ContentState, convertFromHTML, convertFromRaw, convertToRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import createSingleLinePlugin from 'draft-js-single-line-plugin';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { convertToHTML } from 'draft-convert';
import { fromJS } from 'immutable';
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';
import Utils from '/imports/lib/utils';

// graphql
import { commentersQuery } from '/imports/graphql/methods/commenters';
import { referenceWorksQuery } from '/imports/graphql/methods/referenceWorks';
import { keywordsQuery } from '/imports/graphql/methods/keywords';

// models
import Commenters from '/imports/models/commenters';
import Keywords from '/imports/models/keywords';
import ReferenceWorks from '/imports/models/referenceWorks';

// lib
import muiTheme from '/imports/lib/muiTheme';
import LinkButton from '/imports/ui/components/editor/addComment/LinkButton';
import DraftEditorInput from '../../../shared/DraftEditorInput/DraftEditorInput';

// Create toolbar plugin for editor
const singleLinePlugin = createSingleLinePlugin();


const mentionPlugin = createMentionPlugin();
const { MentionSuggestions } = mentionPlugin;

const EditKeyword = React.createClass({

	propTypes: {
		submitForm: PropTypes.func.isRequired,
		onTypeChange: PropTypes.func.isRequired,
		keyword: PropTypes.object,
		selectedLineFrom: PropTypes.number,
		selectedLineTo: PropTypes.number,
		keywordsOptions: PropTypes.array,
		keyideasOptions: PropTypes.array,
	},

	childContextTypes: {
		muiTheme: PropTypes.object.isRequired,
	},

	getInitialState() {
		const keyword = this.props.keyword;
		let keywordTitle = '';
		let keywordDescription = '';
		let description = '';

		if (keyword) {
			if (keyword && keyword.title) {
				keywordTitle = keyword.title;
			}

			if (keyword && keyword.description) {
				keywordDescription = keyword.description;
				description = this._getKeywordEditorState(keyword);
			} else {
				description = EditorState.createEmpty();
			}
		}

		return {
			titleEditorState: EditorState.createWithContent(ContentState.createFromText(keywordTitle)),
			textEditorState: description,

			titleValue: keywordTitle,
			textValue: keywordDescription,

			snackbarOpen: false,
			snackbarMessage: '',
			suggestions: fromJS([]),
		};
	},

	getChildContext() {
		return { muiTheme: getMuiTheme(muiTheme) };
	},

	_getKeywordEditorState(keyword) {
		if (keyword.descriptionRaw && Object.keys(keyword.descriptionRaw).length) {
			return EditorState.createWithContent(convertFromRaw(keyword.descriptionRaw));
		} else if (keyword.description) {
			const blocksFromHTML = convertFromHTML(keyword.description);
			return EditorState.createWithContent(
				ContentState.createFromBlockArray(
					blocksFromHTML.contentBlocks,
					blocksFromHTML.entityMap
				)
			);
		}
		throw new Meteor.Error('missing filed description or descriptionRaw in keyword');
	},

	onTitleChange(titleEditorState) {
		const titleHtml = stateToHTML(this.state.titleEditorState.getCurrentContent());
		const title = jQuery(titleHtml).text();
		this.setState({
			titleEditorState,
			titleValue: title,
		});
	},

	onTextChange(textEditorState) {
		// var textHtml = stateToHTML(this.state.textEditorState.getCurrentContent());
		/*
		this.setState({
			textEditorState,
			textValue: textEditorState.toString('html'),
		});
		*/

		const textHtml = stateToHTML(this.state.textEditorState.getCurrentContent());

		this.setState({
			textEditorState,
			textValue: textHtml,
		});
	},

	onTypeChange(e, type) {
		this.props.onTypeChange(type);
	},

	onKeywordsValueChange(keywords) {
		this.setState({
			keywordsValue: keywords,
		});
	},

	onKeyideasValueChange(keyidea) {
		this.setState({
			keyideasValue: keyidea,
		});
	},

	onNewOptionCreator(newOption) {
		return {
			label: newOption.label,
			value: newOption.label
		};
	},
	shouldKeyDownEventCreateNewOption(sig) {
		if (sig.keyCode === 13 ||
			sig.keyCode === 188) {
			return true;
		}

		return false;
	},

	isOptionUnique(newOption) {
		const keywordsOptions = this.props.keywordsOptions;
		const keyideasOptions = this.props.keyideasOptions;
		const keywordsValue = this.state.keywordsValue ? this.state.keywordsValue : [];
		const keyideasValue = this.state.keyideasValue ? this.state.keyideasValue : [];
		const BreakException = {};
		try {
			keywordsOptions.forEach((keywordsOption) => {
				if (keywordsOption.label === newOption.option.label) throw BreakException;
			});
			keyideasOptions.forEach((keyideasOption) => {
				if (keyideasOption.label === newOption.option.label) throw BreakException;
			});
			keywordsValue.forEach((keywordValue) => {
				if (keywordValue.label === newOption.option.label) throw BreakException;
			});
			keyideasValue.forEach((keyideaValue) => {
				if (keyideaValue.label === newOption.option.label) throw BreakException;
			});
		} catch (e) {
			if (e === BreakException) return false;
		}
		return true;
	},

	onCommenterValueChange(comenter) {
		this.setState({
			commenterValue: comenter,
		});
	},

	handleSubmit(event) {
		const { textEditorState } = this.state;
		event.preventDefault();

		const error = this.validateStateForSubmit();

		this.showSnackBar(error);

		const descriptionHtml = Utils.getHtmlFromContext(textEditorState.getCurrentContent());

		const descriptionRaw = convertToRaw(textEditorState.getCurrentContent());

		if (!error.errors) {
			this.props.submitForm(this.state, descriptionHtml, descriptionRaw);
		}
	},

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
	},
	componentWillUnmount() {
		if (this.timeout)			{ clearTimeout(this.timeout); }
	},
	validateStateForSubmit() {
		let errors = false;
		let errorMessage = 'Missing comment data:';
		if (!this.state.titleValue) {
			errors = true;
			errorMessage += ' title,';
		}
		if (errors === true) {
			errorMessage = errorMessage.slice(0, -1);
			errorMessage += '.';
		}
		return {
			errors,
			errorMessage,
		};
	},

	// --- END SUBMIT / VALIDATION HANDLE --- //

	render() {
		const { keyword } = this.props;
		const toolbarConfig = {
			display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'HISTORY_BUTTONS'],
			INLINE_STYLE_BUTTONS: [{
				label: 'Italic',
				style: 'ITALIC',
			}, {
				label: 'Underline',
				style: 'UNDERLINE',
			}],
			BLOCK_TYPE_BUTTONS: [{
				label: 'UL',
				style: 'unordered-list-item',
			}],
		};

		const styles = {
			block: {
				maxWidth: 250,
			},
			radioButton: {
				marginBottom: 16,
			},
		};

		if (!keyword) {
			return null;
		}

		return (
			<div className="comments lemma-panel-visible">
				<div className={'comment-outer'}>
					<article
						className="comment commentary-comment paper-shadow "
						style={{ marginLeft: 0 }}
					>
						<div className="comment-upper">
							<h1 className="add-comment-title">
								<DraftEditorInput
									editorState={this.state.titleEditorState}
									onChange={this.onTitleChange}
									placeholder="Key word or idea . . ."
									disableMentions
									spellcheck
									stripPastedStyles
									singleLinePlugin
									blockRenderMap={singleLinePlugin.blockRenderMap}
								/>
							</h1>
							<RadioButtonGroup
								className="keyword-type-toggle"
								name="type"
								defaultSelected={this.props.keyword.type}
								onChange={this.onTypeChange}
							>
								<RadioButton
									value="word"
									label="Word"
									style={styles.radioButton}
									className="keyword-type-radio"
								/>
								<RadioButton
									value="idea"
									label="Idea"
									style={styles.radioButton}
									className="keyword-type-radio"
								/>
							</RadioButtonGroup>
						</div>
						<div
							className="comment-lower clearfix"
							style={{ paddingTop: 20 }}
						>
							<DraftEditorInput
								editorState={this.state.textEditorState}
								onChange={this.onTextChange}
								placeholder="Keyword description . . ."
								spellcheck
								stripPastedStyles
							/>
							<div className="comment-edit-action-button">
								<RaisedButton
									type="submit"
									label="Update Tag"
									labelPosition="after"
									onClick={this.handleSubmit}
									icon={<FontIcon className="mdi mdi-plus" />}
								/>
							</div>
						</div>

					</article>

					<Snackbar
						className="editor-snackbar"
						open={this.state.snackbarOpen}
						message={this.state.snackbarMessage}
						autoHideDuration={4000}
					/>

				</div>
			</div>
		);
	},
});

const EditKeywordContainer = createContainer(props => {

	const tenantId = Session.get('tenantId');

	const keywordsOptions = [];
	const keywords = props.keywordsQuery.loading ? [] : props.keywordsQuery.keywords
	.filter(x => x.type === 'word');
	keywords.forEach((keyword) => {
		keywordsOptions.push({
			value: keyword.title,
			label: keyword.title,
			slug: keyword.slug,
		});
	});

	const keyideasOptions = [];
	const keyideas = props.keywordsQuery.loading ? [] : props.keywordsQuery.keywords
	.filter(x => x.type === 'idea');
	keyideas.forEach((keyidea) => {
		keyideasOptions.push({
			value: keyidea.title,
			label: keyidea.title,
			slug: keyidea.slug,
		});
	});

	if (tenantId) {
		props.referenceWorksQuery.refetch({
			tenantId: tenantId
		});
		props.commentersQuery.refetch({
			tenantId: tenantId
		});
		props.keywordsQuery.refetch({
			tenantId: tenantId
		});
	}
	const referenceWorks = props.referenceWorksQuery.loading ? [] : props.referenceWorksQuery.referenceWorks;
	const referenceWorksOptions = [];
	referenceWorks.forEach((referenceWork) => {
		referenceWorksOptions.push({
			value: referenceWork._id,
			label: referenceWork.title,
		});
	});

	const commentersOptions = [];
	const tenantCommenters = props.commentersQuery.loading ? [] : props.commentersQuery.commenters;
	let commenters = [];
	if (Meteor.user() && Meteor.user().canEditCommenters) {
		commenters = tenantCommenters.filter((x => 
			Meteor.user().canEditCommenters.find(y => y === x._id) !== undefined));
	}
	commenters.forEach((commenter) => {
		commentersOptions.push({
			value: commenter._id,
			label: commenter.name,
		});
	});

	return {
		keywordsOptions,
		keyideasOptions,
		referenceWorksOptions,
		commentersOptions,
	};
}, EditKeyword);

export default compose(
	commentersQuery,
	referenceWorksQuery,
	keywordsQuery
)(EditKeywordContainer);
