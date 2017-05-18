/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, import/no-extraneous-dependencies */

import React from 'react';
import { shallow } from 'enzyme';
import chai from 'chai';
import sinon from 'sinon';
import FlatButton from 'material-ui/FlatButton';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// component:
import SearchToolDropdown from './SearchToolDropdown'; 

describe('SearchToolDropdown', () => {
	it('should render', () => {
		const toggle = sinon.spy();
		const wrapper = shallow(
			<SearchToolDropdown
				name="TestDropdown"
				toggle={toggle}
				open={false}
				disabled={false}
			>
				<p>children</p>
			</SearchToolDropdown>
		);
		chai.assert.ok(wrapper.find(FlatButton), 'should contain the Flatbutton child');
		chai.assert.equal(wrapper.find(FlatButton).node.props.label, 'TestDropdown');
		chai.assert.ok(wrapper.find('p'), 'should render the children(<p> in this case)');
		chai.assert.equal(wrapper.find('p').text(), 'children');
	});

	it('should render with dropdown open', () => {
		const toggle = sinon.spy();
		const wrapper = shallow(
			<SearchToolDropdown
				name="TestDropdown"
				toggle={toggle}
				open
				disabled={false}
			>
				<p>children</p>
			</SearchToolDropdown>
		);
		const flatButton = wrapper.find(FlatButton);
		chai.assert(wrapper.hasClass('open'));
		chai.assert.ok(flatButton, 'should contain the Flatbutton child');
		chai.assert.equal(flatButton.node.props.label, 'TestDropdown');
		chai.assert.ok(wrapper.find('p'), 'should render the children(<p> in this case)');
		chai.assert.equal(wrapper.find('p').text(), 'children');
	});

	it('should render with dropdown disabled', () => {
		const toggle = sinon.spy();
		const wrapper = shallow(
			<SearchToolDropdown
				name="TestDropdown"
				toggle={toggle}
				open={false}
				disabled
			>
				<p>children</p>
			</SearchToolDropdown>
		);
		const flatButton = wrapper.find(FlatButton);
		chai.assert.ok(flatButton, 'should contain the Flatbutton child');
		chai.assert.equal(flatButton.node.props.label, 'TestDropdown');
		chai.assert.equal(flatButton.node.props.disabled, true);
		chai.assert.include(flatButton.node.props.className, 'search-tool-disabled');
		chai.assert.ok(wrapper.find('p'), 'should render the children(<p> in this case)');
		chai.assert.equal(wrapper.find('p').text(), 'children');
	});
	it('should call toggle function with correct values', () => {
		const toggle = sinon.spy();
		const wrapper = shallow(
			<SearchToolDropdown
				name="TestDropdown"
				toggle={toggle}
				open={false}
				disabled={false}
			>
				<p>children</p>
			</SearchToolDropdown>
		);
		const flatButton = wrapper.find(FlatButton);
		flatButton.simulate('click');
		sinon.assert.calledWith(toggle, 'TestDropdown');
		chai.assert.ok(flatButton, 'should contain the Flatbutton child');
		chai.assert.equal(flatButton.node.props.label, 'TestDropdown');
		chai.assert.ok(wrapper.find('p'), 'should render the children(<p> in this case)');
		chai.assert.equal(wrapper.find('p').text(), 'children');
	});
	it('renders correctly', () => {
		const toggle = sinon.spy();
		const tree = renderer
			.create(
				<MuiThemeProvider>
					<SearchToolDropdown
						name="TestDropdown"
						toggle={toggle}
						open={false}
						disabled={false}
					>
						<p>"children"</p>
					</SearchToolDropdown>
				</MuiThemeProvider>
			)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
