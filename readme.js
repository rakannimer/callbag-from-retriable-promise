/* 
  callbag-from-retriable-promise
  
  Usage : 
  
  pipe(fromRetriablePromise(() => fetch('https://wikipedia.org'), 4), forEach(console.log));

  Copy the code you need and inline it in your project.

  Or install with your favorite package manager :

  pnpm i callbag-from-retriable-promise
*/

const fromRetriablePromise = (promise, desiredRetryCount = 0) => (
  start,
  sink
) => {
  if (start !== 0) return;
  let retryCount = 0;
  let ended = false;
  const onfulfilled = val => {
    if (ended) return;
    sink(1, val);
    sink(2);
  };
  const onrejected = err => {
    if (retryCount === desiredRetryCount) {
      if (ended) return;
      sink(2, err);
    } else {
      retryCount += 1;
      promise()
        .then(onfulfilled)
        .catch(onrejected);
    }
  };
  promise()
    .then(onfulfilled)
    .catch(onrejected);
  sink(0, t => {
    if (t === 2) ended = true;
  });
};

// https://github.com/staltz/callbag-for-each
const forEach = operation => source => {
  let talkback;
  source(0, (t, d) => {
    if (t === 0) talkback = d;
    if (t === 1) operation(d);
    if (t === 1 || t === 0) talkback(1);
  });
};

// https://github.com/staltz/callbag-pipe
const pipe = (...cbs) => {
  let res = cbs[0];
  for (let i = 1, n = cbs.length; i < n; i++) res = cbs[i](res);
  return res;
};

const someThrowablePromise = () => {
  return new Promise((resolve, reject) => {
    Math.random() < 0.99 ? reject(new Error("Error")) : resolve("Ok");
  });
};

pipe(
  fromRetriablePromise(async () => someThrowablePromise(), 200),
  forEach(console.log)
);
