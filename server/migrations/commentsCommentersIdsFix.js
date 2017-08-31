import Comments from '/imports/models/comments';
import Commenters from '/imports/models/commenters';

const commentsCommentersIdsFix = () => {
	const comments = Comments.find().fetch();
	comments.forEach((comment) => {
		const commenters = comment.commenters;

		commenters.forEach((commenter) => {
			if (!commenter._id) {
				const _commenter = Commenters.findOne({ slug: commenter.slug });
				commenter._id = _commenter._id;
			}
		});

		try {
			Comments.update({
				_id: comment._id,
			}, {
				$set: {
					commenters,
				},
			});
		} catch (err) {
			throw new Meteor.Error(`Error fixing comment.commentersIdsFix ${comment._id}: ${err}`);
		}
	});
	console.log(' -- method commentsCommentersIdsFix run completed');
};

export default commentsCommentersIdsFix;
