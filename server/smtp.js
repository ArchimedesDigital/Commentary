if ('smtp' in Meteor.settings.private) {
	process.env.MAIL_URL = Meteor.settings.private.smtp;
}
