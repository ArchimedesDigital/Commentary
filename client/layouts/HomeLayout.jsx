HomeLayout = React.createClass({
	render(){
		return(
			<div className="chs-layout home-layout">
				<Header />

				<HomeView />

				<Footer/>

				<FilterWidget filters={[]}/>
			  {/*<ModalLogin />
				<ModalSignup />*/}

			</div>
			);
		}

});
