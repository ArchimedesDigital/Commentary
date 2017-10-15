import React from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';

// models
import Keywords from '/imports/models/keywords';

// components
import KeywordTeaser from '/imports/ui/components/keywords/KeywordTeaser';

class KeywordsList extends React.Component {

	renderKeywords() {
		const { keywords } = this.props;

		if (!keywords) {
			return null;
		}

		return keywords.map((keyword, i) => (
			<KeywordTeaser
				key={i}
				keyword={keyword}
			/>
		));
	}

	render() {
		return (
			<div className="keywords-list">
				{this.renderKeywords()}
			</div>
		);
	}
}

KeywordsList.propTypes = {
	type: React.PropTypes.string.isRequired,
	limit: React.PropTypes.number,
	keywords: React.PropTypes.array,
};

export default createContainer(({ type, limit }) => {
	const skip = 0;
	let _limit = 100;
	if (limit) {
		_limit = limit;
	}

	const query = {
		type,
		tenantId: Session.get('tenantId'),
		count: { $gte: 1 },
	};

	switch (type) {
	case 'word':
		Meteor.subscribe('keywords.keywords', query, skip, _limit);
		break;
	case 'idea':
		Meteor.subscribe('keywords.keyideas', query, skip, _limit);
		break;
	default:
		break;
	}

	const keywords = Keywords.find(query, { limit: _limit }).fetch() || [];

	return {
		keywords,
		type,
	};
}, KeywordsList);
