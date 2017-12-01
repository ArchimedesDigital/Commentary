import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { compose } from 'react-apollo';
import _ from 'lodash';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TextField from 'material-ui/TextField';
import Drawer from 'material-ui/Drawer';
import { Card, CardHeader, CardText } from 'material-ui/Card';

// models:
import Commenters from '/imports/models/commenters';
import Keywords from '/imports/models/keywords';
import ReferenceWorks from '/imports/models/referenceWorks';
import Works from '/imports/models/works';

// graphql
import { commentersQuery } from '/imports/graphql/methods/commenters';
import { referenceWorksQuery } from '/imports/graphql/methods/referenceWorks';
import { keywordsQuery } from '/imports/graphql/methods/keywords';

// components:
import LineRangeSlider from '/imports/ui/components/header/LineRangeSlider';
import SearchTermButtonPanel from '/imports/ui/components/header/SearchTermButtonPanel';
import { WorksCard } from '/imports/ui/components/header/SearchCards';

// lib:
import Utils from '/imports/lib/utils';
import muiTheme from '/imports/lib/muiTheme';


const CommentarySearchPanel = React.createClass({

	propTypes: {
		filters: PropTypes.array,
		toggleSearchTerm: PropTypes.func,
		handleChangeTextsearch: PropTypes.func,
		handleChangeLineN: PropTypes.func,
		open: PropTypes.bool,
		closeRightMenu: PropTypes.func,
		keyideas: PropTypes.array,
		keywords: PropTypes.array,
		commenters: PropTypes.array,
		works: PropTypes.array,
		referenceWorks: PropTypes.array,
		isTest: PropTypes.bool,
	},

	childContextTypes: {
		muiTheme: PropTypes.object.isRequired,
	},

	getInitialState() {
		return {
			subworks: [],
			activeWork: '',
		};
	},

	getChildContext() {
		return { muiTheme: getMuiTheme(muiTheme) };
	},

	toggleSearchTerm(key, value) {
		this.props.toggleSearchTerm(key, value);
	},

	toggleWorkSearchTerm(key, value) {
		const work = value;
		const newValue = value;
		newValue.subworks.forEach((subwork, i) => {
			newValue.subworks[i].work = work;
		});

		if (this.state.activeWork === newValue.slug) {
			this.setState({
				subworks: [],
				activeWork: '',
			});
		} else {
			newValue.subworks.sort((a, b) => {
				if (a.n < b.n) {
					return -1;
				}
				if (a.n > b.n) {
					return 1;
				}
				return 0;
			});
			this.setState({
				subworks: newValue.subworks,
				activeWork: newValue.slug,
			});
		}

		this.props.toggleSearchTerm(key, newValue);
	},

	handleChangeTextsearch() {
		this.props.handleChangeTextsearch($('.text-search--drawer input').val());
	},

	render() {
		const self = this;
		const { keyideas, keywords, commenters, works, referenceWorks, isTest } = this.props;
		const filters = this.props.filters || [];

		const styles = {
			drawer: {
				backgroundColor: '#ddd',
			},
			flatButton: {
				width: 'auto',
				minWidth: 'none',
				height: '80px',
				padding: '21px 5px',
			},
			flatIconButton: {
				padding: '10px 20px',
				width: 'auto',
				minWidth: 'none',
				height: '55px',
			},
			wrapper: {
				display: 'flex',
				flexWrap: 'wrap',
			},
			textSearch: {
				width: '100%',
				padding: '0px 10px',
				background: '#f2f2f2',
			},
			cardHeader: {
				fontFamily: 'Proxima N W01 At Smbd',
				textTransform: 'uppercase',
				fontSize: '14px',
				fontWeight: 'bold',
			},
			lineSearch: {
				width: '99%',
				margin: '0px auto',
			},
		};

		let drawerWidth = 400;
		if (window.innerWidth < 500) {
			drawerWidth = 300;
		}
		if (window.innerWidth < 300) {
			drawerWidth = 210;
		}

		return (
			<Drawer
				width={drawerWidth}
				className="search-tools-drawer"
				openSecondary
				open={this.props.open}
				docked={false}
				onRequestChange={this.props.closeRightMenu}
				style={styles.drawer}
			>
				<div className="search-tool text-search text-search--drawer">
					{!isTest ?
						<TextField
							hintText=""
							floatingLabelText="Search"
							fullWidth
							onChange={_.debounce(this.handleChangeTextsearch, 300)}
						/>
					: ''}
				</div>

				<WorksCard
					works={works}
					toggleWorkSearchTerm={this.toggleWorkSearchTerm}
					styles={styles}
					filters={filters}
				/>

				<Card
					className="search-tool-card"
				>
					<CardHeader
						title="Book"
						style={styles.cardHeader}
						actAsExpander={!(self.state.subworks.length === 0)}
						showExpandableButton={!(self.state.subworks.length === 0)}
						className={`card-header ${(self.state.subworks.length === 0) ? '' : 'card-header--disabled'}`}
					/>
					<CardText expandable style={styles.wrapper}>
						{self.state.subworks.map((subwork, i) => {
							let active = false;
							filters.forEach((filter) => {
								if (filter.key === 'subworks') {
									filter.values.forEach((value) => {
										if (subwork.n === value.n) {
											active = true;
										}
									});
								}
							});

							return (
								<SearchTermButtonPanel
									key={i}
									toggleSearchTerm={self.toggleSearchTerm}
									label={`${subwork.work.title} ${subwork.title}`}
									searchTermKey="subworks"
									value={subwork}
									active={active}
								/>
							);
						})}
					</CardText>
				</Card>
				<Card
					className="search-tool-card"
				>
					<CardHeader
						title="Line Number"
						style={styles.cardHeader}
						actAsExpander={!(self.state.subworks.length === 0)}
						showExpandableButton={!(self.state.subworks.length === 0)}
						className={`card-header ${(self.state.subworks.length === 0) ? '' : 'card-header--disabled'}`}
					/>
					<CardText expandable style={styles.wrapper}>
						<div style={styles.lineSearch} className="line-search">
							<LineRangeSlider
								handleChangeLineN={this.props.handleChangeLineN}
							/>
						</div>
					</CardText>
				</Card>
				<Card
					className="search-tool-card"
				>
					<CardHeader
						title="Keywords"
						style={styles.cardHeader}
						actAsExpander
						showExpandableButton
						className="card-header"
					/>
					<CardText expandable style={styles.wrapper}>
						{keywords && keywords.map((keyword, i) => {
							let active = false;
							filters.forEach((filter) => {
								if (filter.key === 'keywords') {
									filter.values.forEach((value) => {
										if (keyword._id === value._id) {
											active = true;
										}
									});
								}
							});

							return (
								<SearchTermButtonPanel
									key={i}
									toggleSearchTerm={self.toggleSearchTerm}
									label={keyword.title}
									searchTermKey="keywords"
									value={keyword}
									active={active}
								/>
							);
						})}
					</CardText>
				</Card>
				<Card
					className="search-tool-card"
				>
					<CardHeader
						title="Key Ideas"
						style={styles.cardHeader}
						actAsExpander
						showExpandableButton
						className="card-header"
					/>
					<CardText expandable style={styles.wrapper}>
						{keyideas && keyideas.map((keyidea, i) => {
							let active = false;
							filters.forEach((filter) => {
								if (filter.key === 'keyideas') {
									filter.values.forEach((value) => {
										if (keyidea._id === value._id) {
											active = true;
										}
									});
								}
							});

							return (
								<SearchTermButtonPanel
									key={i}
									toggleSearchTerm={self.toggleSearchTerm}
									label={keyidea.title}
									searchTermKey="keyideas"
									value={keyidea}
									active={active}
								/>
							);
						})}
					</CardText>
				</Card>
				<Card
					className="search-tool-card"
				>
					<CardHeader
						title="Commentator"
						style={styles.cardHeader}
						actAsExpander
						showExpandableButton
						className="card-header"
					/>
					<CardText expandable style={styles.wrapper}>
						{commenters && commenters.map((commenter, i) => {
							let active = false;
							filters.forEach((filter) => {
								if (filter.key === 'commenters') {
									filter.values.forEach((value) => {
										if (commenter._id === value._id) {
											active = true;
										}
									});
								}
							});

							return (
								<SearchTermButtonPanel
									key={i}
									toggleSearchTerm={self.toggleSearchTerm}
									label={commenter.name}
									searchTermKey="commenters"
									value={commenter}
									active={active}
								/>
							);
						})}
					</CardText>
				</Card>
				<Card
					className="search-tool-card"
				>
					<CardHeader
						title="Reference"
						style={styles.cardHeader}
						actAsExpander
						showExpandableButton
						className="card-header"
					/>
					<CardText expandable style={styles.wrapper}>
						{referenceWorks && referenceWorks.map((reference, i) => {
							let active = false;
							filters.forEach((filter) => {
								if (filter.key === 'reference') {
									filter.values.forEach((value) => {
										if (reference._id === value._id) {
											active = true;
										}
									});
								}
							});

							return (
								<SearchTermButtonPanel
									key={i}
									toggleSearchTerm={self.toggleSearchTerm}
									label={Utils.trunc(reference.title, 30)}
									searchTermKey="reference"
									value={reference}
									active={active}
								/>
							);
						})}
					</CardText>
				</Card>
			</Drawer>
		);
	},
});

const cont = createContainer(props => {

	let works = [];
	let keywords = [];
	let keyideas = [];
	let commenters = [];
	let referenceWorks = [];
	const tenantId = Session.get('tenantId');

	if (tenantId) {
		props.commentersQuery.refetch({
			tenantId: tenantId
		});
		props.referenceWorksQuery.refetch({
			tenantId: tenantId
		});
		props.keywordsQuery.refetch({
			tenantId: tenantId
		});
	}
	Meteor.subscribe('works', Session.get('tenantId'));

	// FETCH DATA:
	keyideas = props.keywordsQuery.loading ? [] : props.keywordsQuery.keywords.filter(x => x.type === 'idea');
	keywords = props.keywordsQuery.loading ? [] : props.keywordsQuery.keywords.filter(x => x.type === 'word');
	commenters = props.commentersQuery.loading ? [] : props.commentersQuery.commenters;
	works = Works.find({}, { sort: { order: 1 } }).fetch();
	referenceWorks = props.referenceWorksQuery.loading ? [] : props.referenceWorksQuery.referenceWorks;

	return {
		keyideas,
		keywords,
		commenters,
		works,
		referenceWorks,
	};
}, CommentarySearchPanel);
export default compose(
	commentersQuery,
	referenceWorksQuery,
	keywordsQuery
)(cont);
