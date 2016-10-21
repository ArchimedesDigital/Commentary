CommenterDetail = React.createClass({

	propTypes: {
		slug: React.PropTypes.string.isRequired
	},

	mixins: [ReactMeteorData],

	getMeteorData() {
		let query = {};

		query.slug = this.props.slug;

		console.log("Query", query);

		return {
			commenter: Commenters.findOne(query)
		};
	},

	render() {
		var commenter = this.data.commenter;

		if(commenter){

		 return (
			 <div className="page commenters-page">

					<div className="content primary">

							<section className="block header cover parallax">
									<div className="background-image-holder blur-2--no-remove blur-10 remove-blur">
											<img className="background-image" src="/images/capitals.jpg"/>
									</div>
									<div className="block-screen brown"></div>

									<div className="container v-align-transform">

											<div className="grid inner">
													<div className="center-content">

															<div className="page-title-wrap">
																	<h2 className="page-title ">
																			{commenter.name}
																	</h2>
																	<h3 className="page-subtitle"></h3>
															</div>


													</div>
											</div>
									</div>
							</section>
							<section className="page-content">

									<div className="author-image paper-shadow">
											<img src="/images/default_user.jpg" alt={commenter.name} />
									</div>

									<div className="user-bio">
										{commenter.bio ?
												<div dangerouslySetInnerHTML={{__html: commenter.bio}}></div>
											:
												<p>There is no biography information for this user yet.</p>
										}

									</div>

									<div className="commenter-visualizatin">
										<CommenterVisualizations
											commenter={commenter}
										/>
									</div>

							</section>

							<CommentsRecent />
					</div>

			 </div>


			);

		}else {
			return <div></div>
		}
	}

});
