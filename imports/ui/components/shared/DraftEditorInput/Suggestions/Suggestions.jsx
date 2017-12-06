import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { HOC as formsyHOC } from 'formsy-react';
import Editor from 'draft-js-plugins-editor';
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';
import { createContainer } from 'meteor/react-meteor-data';
import Keywords from '/imports/models/keywords';
import { fromJS } from 'immutable';
import { compose } from 'react-apollo';
import Utils from '/imports/lib/utils';

// graphql
import { commentsQuery } from '/imports/graphql/methods/comments';
import { keywordsQuery } from '/imports/graphql/methods/keywords';

class Suggestions extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mentions: fromJS([]),
			keywords: fromJS([])
		};
	}
	onMentionSearchChange({ value }) {
		const taht = this;
		this.props.commentsQuery.refetch({
			queryParam: JSON.stringify({ $text: { $search: value } }),
			limit: 5
		}).then(function(res) {
			const _mentions = Utils.getSuggestionsFromComments(res.data.comments);
			this.setState({
				mentions: defaultSuggestionsFilter(value, fromJS(_mentions))
			});
		});
	}
	onKeywordSearchChange({ value }) {
		const _keywords = [];
		this.props.tags.forEach((keyword) => {
			_keywords.push({
				name: keyword.title,
				link: `/tags/${keyword.slug}`,
			});
		});

		this.setState({
			keywords: defaultSuggestionsFilter(value, fromJS(_keywords)),
		});
	}
	render() {
		const { MentionSuggestions } = this.props.mentionPlugin;
		const KeywordsSuggestions = this.props.keywordPlugin.MentionSuggestions;
		return (
			<div>
				{this.props.tags !== undefined ? (
					<div>
						<this.props.mentionPlugin.MentionSuggestions
							onSearchChange={this.onMentionSearchChange.bind(this)}
							suggestions={this.state.mentions}
						/>
						<this.props.keywordPlugin.MentionSuggestions
							onSearchChange={this.onKeywordSearchChange.bind(this)}
							suggestions={this.state.keywords}
						/>
					</div>) : ''
					}
			</div>
		);
	}
}
Suggestions.propTypes = {
	mentionPlugin: PropTypes.object,
	keywordPlugin: PropTypes.object,
	tags: PropTypes.array
};
const cont = createContainer((props) => {

	const tenantId = sessionStorage.getItem('tenantId');

	if (tenantId) {
		props.keywordsQuery.refetch({
			tenantId: tenantId
		});
	}
	const tags = props.keywordsQuery.loading ? [] : props.keywordsQuery.keywords;
	const comments = props.commentsQuery.loading ? [] : props.commentsQuery.comments;

	return {
		tags
	};
}, Suggestions);

export default compose(
	keywordsQuery,
	commentsQuery
)(cont);
