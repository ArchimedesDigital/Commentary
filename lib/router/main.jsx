import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import React from 'react';
import cookie from 'react-cookie';
import { mount } from 'react-mounter';

FlowRouter.notFound = {
	action() {
		// Render not found page here
		mount(NotFound);
	},
};

// Global subscription: user data is needed in almost all routes
function subscriptions() {
	this.register('userData', Meteor.subscribe('userData'));
	this.register('commenters', Meteor.subscribe('commenters', this.tenantId));
	this.register('tenants', Meteor.subscribe('tenants'));
}
FlowRouter.subscriptions = subscriptions;

/*
 * Perform necessary checks on entering any route
 */
FlowRouter.triggers.enter([() => {

	/*
	 * Check for and set the tenantId of the current subdomain
	 */
	if (!Session.get('tenantId')) {
		const hostnameArray = document.location.hostname.split('.');
		if (process.env.NODE_ENV === 'development') {
			subdomain = Meteor.settings.public.developmentSubdomain;
		} else if (hostnameArray.length > 1) {
			subdomain = hostnameArray[0];
		} else {
			subdomain = '';
			FlowRouter.go('/404');
		}
		Meteor.call('findTenantBySubdomain', subdomain, (err, tenant) => {
			if (tenant) {
				Session.set('tenantId', tenant._id);
				if (tenant.isAnnotation && !Meteor.userId()) {
					FlowRouter.go('/sign-in');
				}
			} else {
				FlowRouter.go('/404');
			}
		});
	}

	/*
	 * If the tenant is only for Annotations, then deny access to the homepage and
	 * instead forward only to the user's profile
	 */
	if (Session.get('tenantId')) {
		const tenant = Tenants.findOne({ _id: Session.get('tenantId') });
		if (tenant && tenant.isAnnotation && FlowRouter.current().path === '/') {
			FlowRouter.go('/profile');
		}
	}

	/*
	 * Check for multi-subdomain login cookie, if found, login user with Token
	 * if user is logged in and no cookie is found, set cookie
	 */
	if (Meteor.userId()) {
		if (!cookie.load('loginToken')) {
			Meteor.call('getNewStampedToken', (_err, token) => {
				const path = '/';
				let domain;

				if (_err) {
					console.error(_err);
					return false;
				}

				/*
				if (location.hostname.match(/.+.chs.harvard.edu/)) {
					domain = '*.chs.harvard.edu';
				} else if (location.hostname.match(/.+.orphe.us/)) {
					domain = '*.orphe.us';
				}
				*/

				if (domain) {
					cookie.save('userId', Meteor.userId(), { path, domain, });
					cookie.save('loginToken', token, { path, domain });
				} else {
					cookie.save('userId', Meteor.userId(), { path });
					cookie.save('loginToken', token, { path });
				}
			});
		}
	} else {
		const loginToken = cookie.load('loginToken');
		if (loginToken) {
			Meteor.loginWithToken(loginToken);
		}
	}

	/*
	 * Set the base document metadata for the page
	 */
	if (Meteor.isClient) {
		Utils.setBaseDocMeta();
	}

	this.tenantId = Session.get('tenantId');
}]);

/*
 * Route groups with permissions
 */
loggedInGroup = FlowRouter.group({
	triggersEnter: [AccountsTemplates.ensureSignedIn],
});
FlowRouter.route('/', {
	name: 'home',
	action: () => {
		mount(HomeLayout);
	},
});
FlowRouter.route('/commentary', {
	name: 'commentary',
	action: (params, queryParams) => {
		mount(CommentaryLayout, { params, queryParams });
	},
});
FlowRouter.route('/keywords/add', {
	action: () => {
		mount(AddKeywordLayout);
	},
});
FlowRouter.route('/keywords/:slug/edit', {
	action: (params) => {
		mount(MasterLayout, {
			content: <EditKeywordLayout slug={params.slug} />,
		});
	},
});
FlowRouter.route('/keywords/:slug', {
	action: (params) => {
		mount(MasterLayout, {
			content: <KeywordDetail slug={params.slug} />,
		});
	},
});
FlowRouter.route('/keywords', {
	name: 'keywords',
	action: () => {
		mount(MasterLayout, {
			content: <KeywordsPage type="word" title="Keywords" />,
		});
	},
});
FlowRouter.route('/keyideas', {
	action: () => {
		mount(MasterLayout, {
			content: <KeywordsPage type="idea" title="Key Ideas" />,
		});
	},
});
FlowRouter.route('/referenceWorks/:slug', {
	action: (params) => {
		mount(MasterLayout, {
			content: <ReferenceWorkDetail slug={params.slug} />,
		});
	},
});
FlowRouter.route('/referenceWorks', {
	name: 'referenceWorks',
	action: () => {
		mount(MasterLayout, {
			content: <ReferenceWorksPage title="ReferenceWorks" />,
		});
	},
});
FlowRouter.route('/commenters/:slug', {
	name: 'CommentersDetail',
	action: (params) => {
		mount(MasterLayout, {
			content: <CommenterDetail
				slug={params.slug}
				defaultAvatarUrl="/images/default_user.jpg"
			/>,
		});
	},
});
FlowRouter.route('/commenters', {
	action: () => {
		mount(MasterLayout, {
			content: <CommentersPage />,
		});
	},
});
loggedInGroup.route('/commentary/add', {
	action: () => {
		mount(AddCommentLayout);
	},
});
loggedInGroup.route('/commentary/:commentId/edit', {
	action: (params) => {
		mount(AddRevisionLayout, {
			commentId: params.commentId,
		});
	},
});
loggedInGroup.route('/profile', {
	action: () => {
		mount(UserLayout, {
			content: < ProfilePage />,
		});
	},
});
FlowRouter.route('/users/:userId', {
	triggersEnter: [
		(context, redirect) => {
			if (Meteor.userId() && Meteor.userId() === context.params.userId) {
				redirect('/profile');
			}
		},
	],
	action: (params) => {
		mount(MasterLayout, {
			content: <PublicProfilePage
				userId={params.userId}
			/>,
		});
	},
});
FlowRouter.route('/users/:userId/:username', {
	triggersEnter: [
		(context, redirect) => {
			if (Meteor.userId() && Meteor.userId() === context.params.userId) {
				redirect('/profile');
			}
		},
	],
	action: (params) => {
		mount(MasterLayout, {
			content: <PublicProfilePage
				userId={params.userId}
			/>,
		});
	},
});
loggedInGroup.route('/account', {
	action: () => {
		mount(UserLayout, {
			content: < AccountPage />,
		});
	},
});
loggedInGroup.route('/sign-out', {
	triggersEnter: [
		() => {
			AccountsTemplates.logout();
			cookie.remove('userId');
			cookie.remove('loginToken');
		},
	],
	action: () => {
		// Do nothing
	},
});

/*
 * Single page view
 * 404 check is in the actual template
 */
FlowRouter.route('/:slug', {
	action(params) {
		const reservedRoutes = ['admin', 'sign-in', 'sign-up'];
		if (reservedRoutes.indexOf(params.slug) === -1) {
			mount(MasterLayout, {
				content: <SinglePage slug={params.slug} />,
			});
		}
	},
});
