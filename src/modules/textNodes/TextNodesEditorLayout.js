import React from 'react';
import PropTypes from 'prop-types';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// components:
import Header from '../../components/header/Header';
import TextNodesEditor from './TextNodesEditor';

// lib
import muiTheme from '../../lib/muiTheme';
import Utils from '../../lib/utils';

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
		// if (Roles.subscription.ready()) {
		// 	if (!Roles.userIsInRole(Cookies.getItem('user')._id, ['editor', 'admin', 'commenter'])) {
		// 		this.props.history.push('/');
		// 	}
		// } TODO
	}

	render() {
		Utils.setTitle('Edit Source Text | The Center for Hellenic Studies Commentaries');

		return (
			<MuiThemeProvider>
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
	isTest: PropTypes.bool,
};

TextNodesEditorLayout.childContextTypes = {
	muiTheme: PropTypes.object.isRequired,
};



export default TextNodesEditorLayout;
