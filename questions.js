/**
 * This file is taken from a Intro To Meteor talk given by Naomi Seyfer at
 * https://www.meteor.com/learn-meteor. I have made some minor changes and added
 * some inline comments.
 */

// This is a global variable; the lack "var" declaration is itentional.
Questions = new Meteor.Collection("Questions");

// Helper function to return a user's email address.
var getCurrentEmail = function () {
  return Meteor.user() &&
    Meteor.user().emails &&
    Meteor.user().emails[0].address;
};

if (Meteor.isClient) {
  // Responsible for rendering the list of questions.
  Template.questions.allQuestions = function () {
    return Questions.find({}, {
      sort: {score: -1}
    });
  };

  // Returns as truthy only if a user is logged in.
  Template.questions.userId = function () {
    return Meteor.userId();
  };

  // Only return true if logged in and the the votes for this question does NOT
  // contain the current userId.
  Template.questions.showArrow = function () {
    return Meteor.userId() &&
      ! _.contains(this.votes, Meteor.userId());
  };

  // This function handles all of the events for the "questions" template.
  Template.questions.events({
    'submit form': function (evnt, templ) {
      var question = templ.find('#questionText').value;
      Questions.insert({
        question: question,
        score: 1,
        email: getCurrentEmail(),
        votes: [Meteor.userId()]
      });
    },
    'click .vote': function (evnt, templ) {
      Questions.update(this._id, {
        $inc: {score: 1},
        $addToSet: {votes: Meteor.userId()}
      });
    }
  });
}

if (Meteor.isServer) {
  // This function defines the permissions for dealing with the Questions
  // collection. Necessary once "insecure" is uninstalled. See the API docs at
  // http://docs.meteor.com/#api for the syntax and additioinal uses.
  Questions.allow({
    // Rules for inserting new documents into the Questions collection.
    insert: function (userId, doc) {
      if(! _.isEqual(doc.votes, [userId])) {
        return false;
      }
      if(!doc.email || !doc.question) {
        return false;
      }
      if(doc.score !== 1) {
        return false;
      }
      return true;
    },
    // Rules for updating existing docuemts in the Questions collection.
    update: function (userId, doc, fieldNames, modifier) {
      return _.isEqual(modifier, {
        $inc: {score: 1},
        $addToSet: {votes: Meteor.userId()}
      });
    }
  });
}
