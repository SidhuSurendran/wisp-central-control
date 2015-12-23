Meteor.methods({
    mdCreateOrderNumber: function () {
        return Meteor.call('mdCreateNumber');
    },
    mdCreateSubscriptionNumber: function () {
        return Meteor.call('mdCreateNumber', 'subscription');
    },
    mdCreateNumber: function (type) {
        if (!this.userId) throw new Meteor.Error(401, "Not authorized");
        var successFlag = 0;
        var order_number;
        do {
            switch (type) {
                case 'subscription':
                    order_number = MdOrderNumber.generateRandomSubscriptionNumber();
                    break;
                default:
                order_number = MdOrderNumber.generateRandomOrderNumber();
            }
            if (!MdOrderNumber.ordernumbers.findOne({orderNumber: order_number})) {
                successFlag = 1;
                MdOrderNumber.ordernumbers.insert({
                    orderNumber: order_number
                });
            }
        } while(!successFlag);
        return order_number;
    }
});