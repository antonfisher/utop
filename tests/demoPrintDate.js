'use strict';

setInterval(() => {
  console.log(`process wrote log at: ${new Date()} - ${+new Date()}`);
}, 500);
