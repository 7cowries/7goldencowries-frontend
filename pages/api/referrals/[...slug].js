const proxy = require('../_backendProxy');
module.exports = (req,res) => proxy(req,res,'/api/referrals');
