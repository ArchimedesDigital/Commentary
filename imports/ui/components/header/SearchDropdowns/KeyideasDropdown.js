import React from 'react';

// components:
import SearchToolDropdown from '/imports/ui/components/header/SearchToolDropdown'; 
import SearchTermButton from '/imports/ui/components/header/SearchTermButton'; 

// helpers:
import { isActive, dropdownPropTypes, dropdownDefaultProps } from './helpers';

/*
	BEGIN KeyideasDropdown
*/
const KeyideasDropdown = ({ keyideas, searchDropdownOpen, toggleSearchDropdown, toggleSearchTerm, filters }) => (
	<SearchToolDropdown
		name="Ideas"
		open={searchDropdownOpen === 'Ideas'}
		toggle={toggleSearchDropdown}
		disabled={false}
	>
		{keyideas.map(keyidea => (
			<SearchTermButton
				key={keyidea._id}
				toggleSearchTerm={toggleSearchTerm}
				label={keyidea.title}
				searchTermKey="keyideas"
				value={keyidea}
				active={isActive(filters, keyidea, 'keyideas')}
			/>
		))}
	</SearchToolDropdown>
);
KeyideasDropdown.propTypes = {
	keyideas: React.PropTypes.arrayOf(React.PropTypes.shape({
		_id: React.PropTypes.string.isRequired,
		title: React.PropTypes.string.isRequired,
		slug: React.PropTypes.string.isRequired,
	})),
	...dropdownPropTypes,
};
KeyideasDropdown.defaultProps = {
	keyideas: [],
	...dropdownDefaultProps,
};
/*
	END KeyideasDropdown
*/

export default KeyideasDropdown;
