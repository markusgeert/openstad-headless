module.exports = {
  options: {
    logger: 'pino',
    messageAs: 'msg',
    filter: {
      // By module name, or *. We can specify any mix of severity levels and specific event types,
      // and entries are kept if *either* criterion is met
      '*': {
        severity: [ 'warn', 'error', 'info', 'debug' ]
      }
    }
  }
};
