Router.route('/payment/', {
  name: 'mdStripePayment', 
  template: 'mdStripePayment'
});

Router.map(function () {
    this.route('stripeWebHook', {
        path: '/stripe_webhook',
        where: 'server',
        action: function () {
            var requestMethod = this.request.method;
            var requestData = this.request.body;
            if (requestMethod == "POST") {
                StripeMeteor.logWebHook(requestData);
                this.response.writeHead(200, {'Content-Type': 'text/html'});
                this.response.end('<html><body>Your request was successfull.</body></html>');
            } else {
                this.response.writeHead(404, {'Content-Type': 'text/html'});
                this.response.end('<html><body>Page not found.</body></html>');
            }
        }
    });
});