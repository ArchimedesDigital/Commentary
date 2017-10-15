import React from 'react';
import renderer from 'react-test-renderer';

// component:
import AvatarEditor from './AvatarEditor';

jest.mock('react-dropzone');

describe('AvatarEditor', () => {
	it('renders correctly', () => {

		const tree = renderer
			.create(<AvatarEditor />)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

// TODO Fix import error
