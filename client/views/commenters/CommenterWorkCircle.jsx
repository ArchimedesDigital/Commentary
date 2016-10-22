
CommenterWorkCircle = React.createClass({

	propTypes: {
		toggleVisibleWork: React.PropTypes.func.isRequired,
		workTitle: React.PropTypes.string.isRequired,
		workSlug: React.PropTypes.string.isRequired,
		workLevel: React.PropTypes.number.isRequired,
	},

	render() {
		console.log(this.props);
		return (
			<div className="commenter-work-circle">
				<div
					className={`circle-inner circle-level-${this.props.workLevel}`}
					onClick={this.props.toggleVisibleWork.bind(null, this.props.workSlug)}
				>
					<span className="work-title">{this.props.workTitle}</span>
					<div className="grow-border" />
				</div>
			</div>
		);
	},
});
