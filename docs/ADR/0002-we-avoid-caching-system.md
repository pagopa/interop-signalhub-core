# Avoid caching system

Date: 2024-07-19

## Status

Accepted

## Context: POC architectuire

Compared to the POC architecture of Signal Hub, we eliminated the caching system (redis).
Caching was introduced to reduce latency due to the invocation of the m2m Interop api **per every single request** of push/pull.

See here un example, [caching  `purposeId`](https://github.com/pagopa/interop-be-signalhub-push-service/blob/feature/poc/src/main/java/it/pagopa/interop/signalhub/push/service/service/impl/InteropServiceImpl.java#L27).


## New architecture: no more Interop api m2m

In the new architecture, the use of the m2m api has been ruled out entirely, replaced by a call to the DB.
The latency of the operation itself will therefore be much lower by design. In general, for each optimisation and caching operation we deferred the choice to the result of the load test, so as to do only in cases of proven latency.
_Premature optimization is the root of all evil_ (*)

The data alignment system was redesigned, which is based on event propagation directly from the Interop platform and received as event consumption by a stream processor (Kafka).
The data set is more complete and also includes the `purpose` domain.


(*)

> Programmers waste enormous amounts of time thinking about, or worrying about, the speed of noncritical parts of their programs, and these attempts at efficiency actually have a strong negative impact when debugging and maintenance are considered. We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%.

Donald Knuth, [Structured Programming With Go To Statements](http://web.archive.org/web/20130731202547/http://pplab.snu.ac.kr/courses/adv_pl05/papers/p261-knuth.pdf)
