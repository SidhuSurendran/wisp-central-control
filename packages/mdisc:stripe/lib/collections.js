MdStripeMeteor = {};
MdStripeMeteor.plans = new Mongo.Collection('md_stripemeteor_plans');
MdStripeMeteor.subscriptions = new Mongo.Collection('md_subscriptions');

if (Meteor.isServer) {
    MdStripeMeteor.webhooks = new Mongo.Collection('md_stripemeteor_webhooks');
}
