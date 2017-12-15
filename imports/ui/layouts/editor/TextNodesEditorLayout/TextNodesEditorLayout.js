import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import { Roles } from 'meteor/alanning:roles';
import slugify from 'slugify';
import { ApolloProvider } from 'react-apollo';
import { syncHistoryWithStore } from 'react-router-redux';
import { browserHistory } from 'react-router';
import { createBrowserHistory } from 'history';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Cookies from 'js-cookie';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// components:
import Header from '/imports/ui/layouts/header/Header';
import FilterWidget from '/imports/ui/components/commentary/FilterWidget';
import Spinner from '/imports/ui/components/loading/Spinner';
import CommentLemmaSelect from '/imports/ui/components/editor/addComment/CommentLemmaSelect';
import AddKeyword from '/imports/ui/components/editor/keywords/AddKeyword';
import ContextPanel from '/imports/ui/layouts/commentary/ContextPanel';
import TextNodesEditor from '/imports/ui/components/editor/textNodes/TextNodesEditor';

// lib
import muiTheme from '/imports/lib/muiTheme';
import client from '/imports/middleware/apolloClient';
import configureStore from '/imports/store/configureStore';
import Utils from '/imports/lib/utils';

// redux integration for layout
const store = configureStore();
const history = syncHistoryWithStore(createBrowserHistory(), store);


class TextNodesEditorLayout extends React.Component {
	getChildContext() {
		return { muiTheme: getMuiTheme(muiTheme) };
	}

	componentWillUpdate() {
		this.handlePermissions();
	}
	componentWillUnmount() {
		if (this.timeout)			{ clearTimeout(this.timeout); }
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

	// --- BEGNI PERMISSIONS HANDLE --- //
	handlePermissions() {
		if (Roles.subscription.ready()) {
			if (!Roles.userIsInRole(Meteor.userId(), ['editor', 'admin', 'commenter'])) {
				this.props.history.push('/');
			}
		}
	}

	render() {
		Utils.setTitle('Edit Source Text | The Center for Hellenic Studies Commentaries');

		return (
			<MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
				<div className="chs-layout chs-editor-layout add-comment-layout">
					<Header
						toggleSearchTerm={() => {}}
						handleChangeLineN={() => {}}
						filters={[]}
						selectedWork={{ slug: 'iliad' }}
					/>
					<main>
						<div className="commentary-comments">
							<div className="comment-group">
								<TextNodesEditor />
							</div>
						</div>
					</main>
				</div>
			</MuiThemeProvider>
		);
	}
}

TextNodesEditorLayout.propTypes = {
	ready: PropTypes.bool,
	isTest: PropTypes.bool,
};

TextNodesEditorLayout.childContextTypes = {
	muiTheme: PropTypes.object.isRequired,
};


const TextNodesEditorLayoutContainer = (() => {
	const ready = Roles.subscription.ready();
	return {
		ready,
	};
}, TextNodesEditorLayout);


export default TextNodesEditorLayoutContainer;
