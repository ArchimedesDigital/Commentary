import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

Meteor.methods({
	'users.insert': (token, user) => {
		check(token, String);
		check(user, {
			username: String,
			emails: Match.Maybe(Array),
			profile: {
				name: Match.Maybe(String),
				biography: Match.Maybe(String),
				publicEmailAddress: Match.Maybe(String),
				academiaEdu: Match.Maybe(String),
				twitter: Match.Maybe(String),
				facebook: Match.Maybe(String),
				google: Match.Maybe(String),
				avatarUrl: Match.Maybe(String),
				location: Match.Maybe(String),
				country: Match.Maybe(String),
			},
			services: Match.Maybe(Object),
			roles: Match.Maybe(Array),
			highlightingPreference: Match.Maybe(Boolean),
		});

		if (
			Meteor.users.findOne({
				roles: 'admin',
				'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(token),
			})) {
			return Meteor.users.insert(user);
		}

		throw new Meteor.Error('meteor-ddp-admin', 'Attempted publishing with invalid token');
	},
	'users.remove': (token, userId) => {
		check(token, String);
		check(userId, String);

		if (
			Meteor.users.findOne({
				roles: 'admin',
				'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(token),
			})) {
			return Meteor.users.remove(userId);

		}

		throw new Meteor.Error('meteor-ddp-admin', 'Attempted publishing with invalid token');
	},
	'users.update': (token, _id, user) => {
		check(token, String);
		check(_id, String);
		check(user, {
			username: String,
			emails: Match.Maybe(Array),
			profile: {
				name: Match.Maybe(String),
				biography: Match.Maybe(String),
				publicEmailAddress: Match.Maybe(String),
				academiaEdu: Match.Maybe(String),
				twitter: Match.Maybe(String),
				facebook: Match.Maybe(String),
				google: Match.Maybe(String),
				avatarUrl: Match.Maybe(String),
				location: Match.Maybe(String),
				country: Match.Maybe(String),
			},
			services: Match.Maybe(Object),
			roles: Match.Maybe(Array),
			highlightingPreference: Match.Maybe(Boolean),
		});

		if (
			Meteor.users.findOne({
				roles: 'admin',
				'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(token),
			})) {
			return Meteor.users.update({
				_id
			}, {
				$set: user,
			});
		}

		throw new Meteor.Error('meteor-ddp-admin', 'Attempted publishing with invalid token');
	}
});
