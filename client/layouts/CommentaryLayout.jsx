CommentaryLayout = React.createClass({

	addSearchTerm(){

	},

	render(){
		return(
			<div className="chs-layout commentary-layout">

				<Header addSearchTerm={this.addSearchTerm} />

				<Commentary addSearchTerm={this.addSearchTerm} />

				<Footer/>

				<FilterWidget filters={[]}/>
			  {/*<ModalLogin />
				<ModalSignup />*/}

			</div>
			);
		}

});
