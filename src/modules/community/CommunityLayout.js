import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import muiTheme from '../../lib/muiTheme';

import { compose } from 'react-apollo';

// layouts & components
import Header from '../../components/navigation/Header';
import Footer from '../../components/navigation/Footer';
import { SnackAttack } from '../shared/SnackAttack';
import LoadingHome from '../../components/loading/LoadingHome';
import CommunityPage from './CommunityPage';

// auth
import AuthModalContainer from '../../modules/auth/containers/AuthModalContainer';
import { login, register, logoutUser, verifyToken } from '../../lib/auth';

// graphql
import { settingsQuery } from '../../graphql/methods/settings';


class CommunityLayout extends Component {

	constructor(props) {
		super(props);
		this.state = {
			tenantId: sessionStorage.getItem('tenantId')
		};
	}
	componentWillReceiveProps(nextProps) {
		this.setState({
			settings: nextProps.settingsQuery.loading ? {} : nextProps.settingsQuery.settings.find(x => x.tenantId === this.state.tenantId)
		});
	}
	render() {
		const { settings } = this.state;

		if (!settings) {
			return <LoadingHome />;
		}

		return (
			<MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
				<div className="chs-layout community-layout">
					<Header />
					<CommunityPage />
					<Footer />
					<SnackAttack />
				</div>
				<AuthModalContainer
					loginMethod={login}
					signupMethod={register}
					logoutMethod={logoutUser}
					getUserFromServer={verifyToken}
				/>
			</MuiThemeProvider>
		);
	}

}
CommunityLayout.propTypes = {
	settingsQuery: PropTypes.object,
};

export default compose(settingsQuery)(CommunityLayout);
