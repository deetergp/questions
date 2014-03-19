Questions = new Meteor.Collection("Questions");

var getCurrentEmail = function () {
  return Meteor.user() &&
    Meteor.user().emails &&
    Meteor.user().emails[0].address;
};

if (Meteor.isClient) {
  Template.questions.allQuestions = function () {
    return Questions.find({}, {
      sort: {score: -1}
    });
  };

  // Returns true only if a user is logged in.
  Template.questions.userId = function () {
    return Meteor.userId();
  };

  // Only return true if logged in and the the votes for this question does NOT
  // contain the current userId.
  Template.questions.showArrow = function () {
    return Meteor.userId() &&
      ! _.contains(this.votes, Meteor.userId());
  };

  Template.questions.events({
    'submit form': function (evt, templ) {
      var question = templ.find('#questionText').value;
      Questions.insert({
        question: question,
        score: 1,
        email: getCurrentEmail(),
        votes: [Meteor.userId()]
      });
    },
    'click .vote': function (evt, templ) {
      Questions.update(this._id, {
        $inc: {score: 1},
        $addToSet: {votes: Meteor.userId()}
      });
    }
  });
}

if (Meteor.isServer) {
  Questions.allow({
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
    }
  });
}
