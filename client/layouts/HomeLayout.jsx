HomeLayout = React.createClass({
	getInitialState() {
		return {
			filters: [],
		};
	},

	mixins: [ReactMeteorData],

	getMeteorData() {
		let comments = [];

		// SUBSCRIPTIONS:
		const commentsSub = Meteor.subscribe('comments', {}, 0, 10);
		comments = Comments.find({}, { sort: { 'work.order': 1, 'subwork.n': 1, lineFrom: 1, nLines: -1 } }).fetch();

		const commentsReady = commentsSub.ready();

		return {
			comments,
			commentsReady,
		};
	},

	loadMoreComments() {
		this.setState({
			skip: this.state.skip + 10,
		});
	},

	toggleSearchTerm(key, value) {
		let self = this,
			filters = this.state.filters;
		let keyIsInFilter = false,
			valueIsInFilter = false,
			filterValueToRemove,
			filterToRemove;

		filters.forEach(function (filter, i) {
			if (filter.key === key) {
				keyIsInFilter = true;

				filter.values.forEach(function (filterValue, j) {
					if (filterValue._id === value._id) {
						valueIsInFilter = true;
						filterValueToRemove = j;
					}
				});

				if (valueIsInFilter) {
					filter.values.splice(filterValueToRemove, 1);
					if (filter.values.length === 0) {
						filterToRemove = i;
					}
				} else {
					if (key === 'works') {
						filter.values = [value];
					} else {
						filter.values.push(value);
					}
				}
			}
		});


		if (typeof filterToRemove !== 'undefined') {
			filters.splice(filterToRemove, 1);
		}

		if (!keyIsInFilter) {
			filters.push({
				key,
				values: [value],
			});
		}

		this.setState({
			filters,
			skip: 0,
		});
	},

	handleChangeTextsearch(e) {
		const filters = this.state.filters;
		const textsearch = $('.text-search input').val();

		if (textsearch && textsearch.length) {
			let textsearchInFilters = false;

			filters.forEach(function (filter, i) {
				if (filter.key === 'textsearch') {
					filter.values = [textsearch];
					textsearchInFilters = true;
				}
			});

			if (!textsearchInFilters) {
				filters.push({
					key: 'textsearch',
					values: [textsearch],
				});
			}
		} else {
			let filterToRemove;

			filters.forEach(function (filter, i) {
				if (filter.key === 'textsearch') {
					filterToRemove = i;
				}
			});

			if (typeof filterToRemove !== 'undefined') {
				filters.splice(filterToRemove, 1);
			}
		}

		this.setState({
			filters,
		});
	},

	handleChangeLineN(e) {
		const filters = this.state.filters;

		if (e.from > 1) {
			let lineFromInFilters = false;

			filters.forEach(function (filter, i) {
				if (filter.key === 'lineFrom') {
					filter.values = [e.from];
					lineFromInFilters = true;
				}
			});

			if (!lineFromInFilters) {
				filters.push({
					key: 'lineFrom',
					values: [e.from],
				});
			}
		} else {
			var filterToRemove;

			filters.forEach(function (filter, i) {
				if (filter.key === 'lineFrom') {
					filterToRemove = i;
				}
			});

			if (typeof filterToRemove !== 'undefined') {
				filters.splice(filterToRemove, 1);
			}
		}

		if (e.to < 2100) {
			let lineToInFilters = false;

			filters.forEach(function (filter, i) {
				if (filter.key === 'lineTo') {
					filter.values = [e.to];
					lineToInFilters = true;
				}
			});

			if (!lineToInFilters) {
				filters.push({
					key: 'lineTo',
					values: [e.to],
				});
			}
		} else {
			var filterToRemove;

			filters.forEach(function (filter, i) {
				if (filter.key === 'lineTo') {
					filterToRemove = i;
				}
			});

			if (typeof filterToRemove !== 'undefined') {
				filters.splice(filterToRemove, 1);
			}
		}


		this.setState({
			filters,
		});
	},

	componentDidMount() {
		if (typeof location.hash !== 'undefined' && location.hash.length > 0) {
			setTimeout(() => {
				$('html, body').animate({ scrollTop: $(location.hash).offset().top - 100 }, 300);
			}, 1000);
		}
	},


	render() {
		return (
			<div className="chs-layout home-layout">
				<Header
					toggleSearchTerm={this.toggleSearchTerm}
					handleChangeLineN={this.handleChangeLineN}
					handleChangeTextsearch={this.handleChangeTextsearch}
    />

				<HomeView
					filters={this.state.filters}
					toggleSearchTerm={this.toggleSearchTerm}
					loadMoreComments={this.loadMoreComments}
					skip={this.state.skip}
					comments={this.data.comments}
					commentsReady={this.data.commentsReady}
    />

				<FilterWidget
					filters={this.state.filters}
					toggleSearchTerm={this.toggleSearchTerm}
    />

				<Footer />

				{/* <ModalLogin />
				<ModalSignup />*/}

			</div>
			);
	},

});
