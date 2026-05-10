const dns = require('dns');
dns.resolveSrv('_mongodb._tcp.cluster0.mzyp2q8.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('DNS SRV Resolution Error:', err);
  } else {
    console.log('SRV Addresses:', addresses);
  }
});
