
/*
	helpers
*/

const getCommentGroupId = (commentGroup) => {
	let id = '';
	commentGroup.comments.forEach((comment) => {
		id += `-${comment._id}`;
	});
	return id.slice(1);
};
function addCommetersToCommentGroup(allCommenters, comment, commenters = {}) {
	comment.commenters.map((_commenter) => {
		const commenter = allCommenters.find(x => x.slug === _commenter.slug);
		if (commenter) {
			commenters[commenter._id] = commenter;
		}
	});
	return commenters;
}
function isFromCommentGroup(comment, commentGroup) {
	return comment.work.title === commentGroup.work.title
		&& comment.subwork.n === commentGroup.subwork.n
		&& comment.lineFrom === commentGroup.lineFrom
		&& comment.lineTo === commentGroup.lineTo;
}
const parseCommentsToCommentGroups = (comments, allCommenters) => {
	const commentGroups = [];
	// Make comment groups from comments
	let isInCommentGroup = false;
	comments.map((comment) => {
		isInCommentGroup = false;
		if (comment.work) {
			commentGroups.map((commentGroup) => {
				if (isFromCommentGroup(comment, commentGroup)) {
					isInCommentGroup = true;
					commentGroup.comments.push(comment);
				}
			});

			if (!isInCommentGroup) {
				let ref;

				if (comment.work.title === 'Homeric Hymns') {
					ref = `Hymns ${comment.subwork.n}.${comment.lineFrom}`;
				} else {
					ref = `${comment.work.title} ${comment.subwork.n}.${comment.lineFrom}`;
				}

				commentGroups.push({
					ref,
					selectedLemmaEdition: {
						lines: [],
					},
					work: comment.work,
					subwork: comment.subwork,
					lineFrom: comment.lineFrom,
					lineTo: comment.lineTo,
					nLines: comment.nLines,
					comments: [comment],
				});
			}
		} else if (process.env.NODE_ENV === 'development') {
			console.error(`Review comment ${comment._id} metadata`);
		}
	});
	commentGroups.map((commentGroup) => {
		commentGroup._id = getCommentGroupId(commentGroup);
		commentGroup.commenters = {};
		commentGroup.comments.map((comment) => {
			addCommetersToCommentGroup(allCommenters, comment, commentGroup.commenters);
		});
	});

	return commentGroups;
};

export {
	parseCommentsToCommentGroups,
	getCommentGroupId,
};
