CommentaryLayout = React.createClass({

  getInitialState(){
    return {
      filters: [],
			skip: 0
    };
  },

	loadMoreComments(){
	    this.setState({
	      skip : this.state.skip + 10
	    });

			//console.log("Load more comments:", this.state.skip);
	},

	toggleSearchTerm(key, value){
		var self = this,
				filters = this.state.filters;
		var keyIsInFilter = false,
				valueIsInFilter = false,
				filterValueToRemove,
				filterToRemove;

		filters.forEach(function(filter, i){
			if(filter.key === key){
				keyIsInFilter = true;

				filter.values.forEach(function(filterValue, j){
						if(filterValue._id === value._id){
							valueIsInFilter = true;
							filterValueToRemove = j;
						}
				})

				if(valueIsInFilter){
					filter.values = filter.values.splice(filterValueToRemove, 1);
					if(filter.values.length === 0){
						filterToRemove = i;
					}
				}else {
					if(key === "works"){
						filter.values = [value];
					}else {
						filter.values.push(value);
					}
				}

			}

		});

		if(typeof filterToRemove !== "undefined"){
			filters.splice(filterToRemove, 1);
		}

		if(!keyIsInFilter){
			filters.push({
									key: key,
									values: [value]
								});

		}

		this.setState({
			filters: filters,
			skip: 0
		});

	},

	handleChangeLineN(e){
		var $target = $(e.target);

		debugger;

	},

	render(){
		console.log("CommentaryLayout.filters", this.state.filters);
		return(
			<div className="chs-layout commentary-layout">

				<Header
					toggleSearchTerm={this.toggleSearchTerm}
					handleChangeLineN={this.handleChangeLineN}/>

				<Commentary
					filters={this.state.filters}
					toggleSearchTerm={this.toggleSearchTerm}
					loadMoreComments={this.loadMoreComments}
					skip={this.state.skip}
					/>


				<FilterWidget filters={this.state.filters}/>
			  {/*<ModalLogin />
				<ModalSignup />*/}

			</div>
			);
		}

});
