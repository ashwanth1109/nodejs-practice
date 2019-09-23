# MICROSERVICES

A network is the sum of its parts and all the interactions between its parts.

To connect our microservices, we'll use a cross platform library called 0MQ (Zero Message Queue).
It provides high scalability, low latency messaging. Although Node's core has great support for
binding and connecting to sockets, it lacks in terms of higher level messaging patterns such as
handling server restarts, routing details, buffering of chunked data etc.
