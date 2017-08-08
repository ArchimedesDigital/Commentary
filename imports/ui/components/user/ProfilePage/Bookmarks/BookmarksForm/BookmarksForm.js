import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { createContainer } from 'meteor/react-meteor-data';
import { ObjectID } from 'bson';


// api
import Works from '/imports/api/collections/works';

class BookmarksForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedWork: null,
			selectedSubwork: null,
			selectedLineFrom: '',
			selectedLineTo: ''
		};

		this.submit = this.submit.bind(this);
		this.getWork = this.getWork.bind(this);
		this.getSubwork = this.getSubwork.bind(this);
	}

	static propTypes = {
		works: React.PropTypes.array,
		toggleBookmarksForm: React.PropTypes.func
	}

	static deafultProps = {
		works: []
	}

	componentWillReceiveProps(nextProps) {
		const {works} = this.props;

		if (nextProps !== this.props) {
			this.setState({
				selectedWork: nextProps.works[0],
				selectedSubwork: nextProps.works[0].subworks[0].slug
			});
			console.log(nextProps);
		}
	}

	getWork(event, index, value) {
		this.setState({
			selectedWork: value,
		});
	}

	getSubwork(event, index, value) {
		this.setState({
			selectedSubwork: value
		});
	}

	submit() {
		const { selectedWork, selectedSubwork, selectedLineFrom, selectedLineTo } = this.state;
		const { toggleBookmarksForm } = this.props;

		const bookmark = {
			work: selectedWork,
			subwork: selectedSubwork,
			lineFrom: Number(selectedLineFrom),
			lineTo: Number(selectedLineTo),
			subscribedOn: new Date(),
			_id: new ObjectID().toString()
		};

		Meteor.users.update({_id: Meteor.userId()}, {
			$push: {
				'subscriptions.bookmarks': bookmark
			}
		});
		
		toggleBookmarksForm();
	}

	render() {
		const { works } = this.props;
		const { selectedWork, selectedSubwork, subworks, selectedLineFrom, selectedLineTo } = this.state;

		if (!selectedWork || !works) { return <div><h2 style={{textAlign: 'center'}}>loading...</h2></div>; }

		return (
			<div style={{ alignItems: 'center', justifyItems: 'center', display: 'flex', flexDirection: 'column' }}>
				<div>
					<SelectField 
						floatingLabelText="Select Work"
						value={selectedWork}
						onChange={this.getWork}
					>
						{works.map(work => 
							<MenuItem 
								key={work.slug}
								value={work} 
								primaryText={work.title} 
							/>
						)}
					</SelectField>
				</div>
				<div>
					<SelectField 
						floatingLabelText="Select Subwork"
						value={selectedSubwork}
						onChange={this.getSubwork}
					>
						{selectedWork.subworks.map(subwork => 
							<MenuItem 
								key={subwork.slug}
								value={subwork.slug} 
								primaryText={subwork.title} 
							/>
						)}
					</SelectField>
				</div>
				<div>
					<TextField 
						floatingLabelText="Line From"
						value={selectedLineFrom}
						onChange={(e, newValue) => this.setState({ selectedLineFrom: newValue })}
					/>
				</div>
				<div>
					<TextField
						floatingLabelText="Line To"
						value={selectedLineTo}
						onChange={(e, newValue) => this.setState({ selectedLineTo: newValue })}
					/>
				</div>
				<div>
					<FlatButton 
						label="Submit"
						onTouchTap={this.submit}
					/>
				</div>
			</div>
		);
	}
}

const BookmarksFormContainer = createContainer(() => {
	Meteor.subscribe('works', Session.get('tenantId')).ready();
	const works = Works.find().fetch();

	return {
		works
	};
}, BookmarksForm);

export default BookmarksFormContainer;
