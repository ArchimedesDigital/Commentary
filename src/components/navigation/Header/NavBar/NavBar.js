import React from 'react';
import PropTypes from 'prop-types';
import Headroom from 'react-headroom';
import { Link } from 'react-router-dom';

// components
import NavBarHeader from './NavBarHeader';
import UserAvatarContainer from '../../../../modules/users/containers/UserAvatarContainer';

// styles



const NavBar = ({ toggleAuthModal, toggleLeftMenu, userId, logout }) => (
	<Headroom className="navbar">
		<NavBarHeader toggleLeftMenu={toggleLeftMenu} />
		<ul className="nav">
			<li>
				<Link to={'/#features'}>
					Services
				</Link>
			</li>
			<li>
				<Link to={'/about'}>
					About
				</Link>
			</li>
			<li>
				{ userId ?
					<Link
						to={'/profile'}
						className="userAvatarLink"
					>
						<UserAvatarContainer />
					</Link>
				: '' }
			</li>
			<li>
				{!userId ?
					<Link
						to={'/'}
						className="login-button"
						onClick={toggleAuthModal}
					>
						Sign Up / In
					</Link>
				: '' }
			</li>
		</ul>
	</Headroom>
);

NavBar.propTypes = {
	toggleAuthModal: PropTypes.func.isRequired,
	userId: PropTypes.string,
};

export default NavBar;
