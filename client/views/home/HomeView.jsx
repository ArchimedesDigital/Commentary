
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';

HomeView = React.createClass({

	propTypes: {
		filters: React.PropTypes.array,
		toggleSearchTerm: React.PropTypes.func,
		loadMoreComments: React.PropTypes.func,
		skip: React.PropTypes.number,
		comments: React.PropTypes.array.isRequired,
		commentsReady: React.PropTypes.bool,
	},

	getChildContext() {
		return { muiTheme: getMuiTheme(baseTheme) };
	},

	childContextTypes: {
		muiTheme: React.PropTypes.object.isRequired,
	},

	componentDidMount() {
		/*
		 * Init wow animations on homepage
		 */
		let w;
		w = new WOW().init();
	},


	mixins: [ReactMeteorData],

	getMeteorData() {
		let query = {},
			works = [];

		works = Works.find({}, { sort: { order: 1 } }).fetch();

		return {
			works,
		};
	},

	scrollToIntro(e) {
		$('html, body').animate({ scrollTop: $('#intro').offset().top - 100 }, 300);

		e.preventDefault();
	},

	render() {
		return (
				<div className="home">

					<div className="content primary">

						<section className="header cover fullscreen parallax">
								<div className="background-image-holder remove-blur blur-10">
									 <img className="background-image" src="/images/hector.jpg" />
								</div>
								<div className="block-screen brown" />

								<div className="container v-align-transform wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s">

										<div className="grid inner">
												<div className="center-content" >

														<div className="site-title-wrap">
																<h1 className="site-title">A Homer Commentary<br />in Progress</h1>
																<h3 className="site-subtitle">
																		An evolving, collaborative commentary based on the cumulative research of Milman Parry and Albert Lord, who created a new way of thinking about Homeric poetry
																</h3>
														</div>

														<RaisedButton
															href="#intro"
															className="cover-link learn-more"
															label="Learn More"
															onClick={this.scrollToIntro}
              />

														<RaisedButton
															href="/commentary/"
															className="cover-link go-to-commentary"
															label="Go to Commentary"
              />


												</div>
										</div>
								</div>

								<div className="scroll-down-helper">
									<p>
										<em>Scroll down for an overview of the project.</em>
									</p>
									<i className="mdi mdi-chevron-down" />
								</div>

						</section>

						<section id="intro" className="intro">
								<div className="container">
										<div className="row">
												<h2 >Quid faciat laetas segetes quo</h2>

												<div className="intro-col intro-col-text">

														<div className="mb40 mb-xs-24l intro-block-text ">
																<h5 className="uppercase intro-block-header">Sidere terram vertere</h5>
																<span className="intro-block-desc">
																		Mycenas, ulmisque adiungere vites conveniat quae curum boum qui cultus
																		habendo sit pecori apibus quanta experientia parcis.
																</span>
														</div>

														<div className="mb40 mb-xs-24 intro-block-text ">
																<h5 className="uppercase intro-block-header">Hinc canere incipiam</h5>
																<span className="intro-block-desc">
																		Vos, o agrestum praesentia numina fauni ferte simul faunique pedem dryadesque
																		puellae munera vestro cano.
																</span>
														</div>

														<RaisedButton
															className="cover-link dark "
															href="/"
															label="Troiae qui primus"
              />

												</div>
												<div className="intro-col intro-col-image image-wrap wow fadeIn">
														<img className="paper-shadow" alt="Ajax and Achilles" src="/images/ajax_achilles_3.jpg" />
														<div className="caption">
																<span className="caption-text">"Quid faciat laetas segetes quo sidere", Terram Vertere. 1865. Oil on canvas. Center for Hellenic Studies, Washington, DC.</span>
														</div>
												</div>
										</div>
										{/* <!--end of row-->*/}
								</div>
								{/* <!--end of container-->*/}
						</section>


						<section className="goals ">

								<div className="background-image-holder blur-4--no-remove">
									 <img alt="image" className="background-image" src="/images/mss_2.jpg" />
								</div>
								<div className="block-screen brown" />

								<div className="container ">

									<div className="goal hvr-grow wow fadeInUp" >
											<img className="goal-image" src="/images/svg-icons/pen.svg" />
											<div className="goal-text">
												<h3 className="goal-title">Collaborative commenting and editing</h3>
												<span className="goal-desc">Writing as a collaborative process between principal authors and associate editors</span>
											</div>
									</div>

									<div className="goal hvr-grow wow fadeInUp" data-wow-delay="0.5s">
											<img className="goal-image" src="/images/svg-icons/book-opened.svg" />
											<div className="goal-text">
												<h3 className="goal-title">System and beauty</h3>
												<span className="goal-desc">Linguistic approach analyzing both synchronically and diachronically the formulaic system of Homeric poetry</span>
											</div>
									</div>

									<div className="goal hvr-grow wow fadeInUp" data-wow-delay="1s">
											<img className="goal-image" src="/images/svg-icons/bank.svg" />
											<div className="goal-text">
												<h3 className="goal-title">A growing effort of scholars still in progress</h3>
												<span className="goal-desc">The commentary constitutes work from a diverse team representing three generations of researchers</span>
											</div>
									</div>

							</div>


						</section>

						<section id="visualizations" className="browse-commentary block-shadow" >
							{/* <h2 className="keyword-divider-title"></h2>*/}

							<span className="visualizations-coaching-text">
								The charts below visualize data about the number of comments per book or hymn, but they are also an interface into the commentary itself. The darker the shade of the bar, the more comments there are, but try clicking on the shaded elements and see what happens.
							</span>
							<div className="container data-visualization-container">
								<WorksList />

								{/* <img src="/images/data_visualization_example.png"/>*/}

							</div>

						</section>


						<section className="keywords">
								<div className="grid inner">
										<h2 className="keyword-divider-title">Keywords</h2>
										<div className="underline" />

										<KeywordsList type="word" title="Keywords" />

										<RaisedButton
											href="/keywords"
											className="cover-link show-more primary "
											label="More Keywords"
          />

								</div>
						</section>

						<section className="keywords">
								<div className="grid inner">
										<h2 className="keyword-divider-title">Key Ideas</h2>
										<div className="underline" />

										<KeywordsList type="idea" title="Key Ideas" />

										<RaisedButton
											href="/keywords"
											className="cover-link show-more primary "
											label="More Key Ideas"
          />

								</div>
						</section>

						<section className="commentors">
								<div className="background-image-holder blur-4--no-remove">
									 <img className="background-image" src="/images/school-athens.jpg" />
								</div>
								<div className="block-screen" />

								<div className="container">

									<h2 className="block-title">Commenters</h2>


										<CommentersList
											limit={3}
											featureOnHomepage
          />

										<RaisedButton
											href="/commenters"
											className="cover-link light show-more "
											label="Other Commenters"
          />

								</div>

						</section>

						<section className="get-started" >

									<h2 className="block-title">Get Started</h2>

									<div className="get-started-comments">

										<Commentary
											isOnHomeView
											filters={this.props.filters}
											toggleSearchTerm={this.props.toggleSearchTerm}
											loadMoreComments={this.props.loadMoreComments}
											skip={this.props.skip}
											comments={this.props.comments}
											commentsReady={this.props.commentsReady}
          />

										<div className="read-more-link">
											<RaisedButton
												href="/commentary"
												className="cover-link light show-more "
												label="Read More"
           />


										</div>

									</div>


						</section>


					</div>

				</div>

		);
	},
});
