/**
 * Account email template
 */

Accounts.emailTemplates.siteName = 'A Homer Commentary in Progress';
Accounts.emailTemplates.from = 'A Homer Commentary in Progress <no-reply@ahcip.archimedes.digital>';
Accounts.emailTemplates.verifyEmail = {
	subject() {
		return 'Account Registration Confirmation';
	},
	text(user, url) {
		return `Hi!
			Click the link below to verify your email account.
			${url}
			If you didn't request this email, please ignore it.
			Thanks,
			A Homer Commentary in Progress team`;
	},
	html(user, url) {
		SSR.compileTemplate('verifyEmail', Assets.getText('verify_email.html'));

		const html = SSR.render('verifyEmail', { url });
		return html;
	},
};
