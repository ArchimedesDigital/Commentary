Meteor.method('keyword_cron', () => {
	const comments = Comments.find().fetch();
	const keywords = [];

	let isInKeywords = false;


	comments.forEach((comment, commentIndex) => {
		comment.keywords.forEach((commentKeyword, commentKeywordIndex) => {
			isInKeywords = false;
			keywords.forEach((keyword, keywordIndex) => {
				if (keyword.slug === commentKeyword.slug) {
					isInKeywords = true;
					keywords[keywordIndex].count++;
				}
			});

			if (!isInKeywords) {
				comments[commentIndex].keywords[commentKeywordIndex].count = 0;
				keywords.push(commentKeyword);
			}
		});
	});


	keywords.forEach((keyword) => {
		console.log(keyword.title, keyword.count);

		Keywords.update({ slug: keyword.slug }, { $set: { count: keyword.count } });
	});

	/*
	 comments.forEach(function(comment){
	 var nLines = 1;

	 if('lineTo' in comment && comment.lineTo){
	 nLines = comment.lineTo - comment.lineFrom + 1;
	 // console.log(comment.lineFrom, comment.lineTo, comment.nLines);

	 }

	 Comments.update({_id: comment._id}, {$set:{nLines:nLines}});
	 });
	 */


	console.log(' -- Cron run complete: Keywords');

	return 1;
}, {
	url: 'keywords/cron',
	getArgsFromRequest(request) {
		// Sometime soon do validation here
		const content = request.body;

		return [content];
	},
});
